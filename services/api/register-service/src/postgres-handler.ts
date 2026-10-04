import { Pool } from 'pg'

import path from 'path'
import fs from 'fs/promises'

type SqlUserInteractionResults = [boolean, false] | [false, true]

export interface PostgresDatabaseConfig {
    init: () => Promise <void>,
    registerUser: (username: string, password: string, email: string) => Promise <SqlUserInteractionResults>,
    registerUserEmailCode: (username: string, email: string, targetCode: number) => Promise <SqlUserInteractionResults>,
    checkIfUserExists: (username: string) => Promise <SqlUserInteractionResults>
}

const postgresSqlFilesPath = path.join(__dirname, "postgres-sql")

export default class PostgresDatabase implements PostgresDatabaseConfig {
    #pool: Pool

    async #readPostgresFiles(paths: string[]) {
        try {
            await Promise.all(paths.map(async (path) => {
                const content = await fs.readFile(path, 'utf-8')
                await this.#pool.query(content)
            }))
        } catch (error: unknown) {
            throw new Error(`Failed to read postgres files: ${error}!`)
        }
    }

    public async init() {
        try {
            await this.#pool.query(`SELECT 1;`)

            await this.#readPostgresFiles([
                path.join(postgresSqlFilesPath, "init.sql"),
                path.join(postgresSqlFilesPath, "user-interaction.sql"),
            ])

            await this.#pool.query(`SELECT init_users_database();`)
            await this.#pool.query(`SELECT init_emailcodes_database();`)
        } catch (error: unknown) {
            if (error instanceof AggregateError) {
                throw new Error(`Failed to connect to the postgres database: ${error.errors}`)
            } else {
                throw new Error(`Failed to connect to the postgres database: ${error}`)
            }
        }
    }

    public async checkIfUserExists(username: string): Promise <SqlUserInteractionResults> {
        return [false, true]
    }

    public async registerUserEmailCode(username: string, email: string, targetCode: number): Promise <SqlUserInteractionResults> {
        try {
            const queryResponse = await this.#pool.query(`SELECT insert_user_into_emailcodes($1, $2, $3)`, [username, email, targetCode])
            return [queryResponse.rows[0], false]
        } catch (error: unknown) {
            console.error(`Failed to register user emailcode: ${error}`)
            return [false, true]
        }
    }

    public async registerUser(username: string, password: string, email: string): Promise <SqlUserInteractionResults> {
        try {
            const queryResponse = await this.#pool.query(`SELECT `)
        } catch (error: unknown) {
            console.error(`Failed to register user: ${error}`)
            return [false, true]
        }

         return [false, true]
    }
    
    public constructor() {
        this.#pool = new Pool({
            port: Number(process.env.POSTGRES_PORT),
            host: process.env.POSTGRES_HOST,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,

            max: 100,
            idleTimeoutMillis: 15000,
            connectionTimeoutMillis: 5000,
            maxUses: 5000
        })
    }
}