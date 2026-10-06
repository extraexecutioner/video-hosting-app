import { Pool } from 'pg'

import path from 'path'
import fs from 'fs/promises'

export interface PostgresDatabaseConfig {
    init: () => Promise <void>,
    registerUserEmailCode: (username: string, password: string, email: string, currentAt: number, targetCode: number) => Promise <boolean>,
    checkIfCodeEmailIsValidAndRegister: (username: string, code: number, currentTime: number) => Promise <boolean>,
    checkIfUserExists: (username: string) => Promise <boolean>
}

const postgresSqlFilesPath = path.join(__dirname, "postgres-sql")

export default class PostgresDatabase implements PostgresDatabaseConfig {
    #pool: Pool

    async #readPostgresFiles(paths: string[]) {
        try {
            for (const path of paths) {
                const content = await fs.readFile(path, 'utf-8')
                await this.#pool.query(content)

                if (path === "/app/postgres-sql/init.sql") { 
                    await Promise.all(["users", "emailcodes"].map(async (val) => {
                        await this.#pool.query(`SELECT init_${val}_database();`) 
                    })) 
                }
            }
        } catch (error: unknown) {
            throw new Error(`Failed to read postgres files: ${error}!`)
        }
    }

    public async init() {
        try {
            await this.#pool.query(`SELECT 1;`)

            await this.#readPostgresFiles([
                path.join(postgresSqlFilesPath, "init.sql"),
                path.join(postgresSqlFilesPath, "user-interaction.sql")
            ])
            
            await this.#pool.query(`SELECT init_emailcodes_database();`)
        } catch (error: unknown) {
            if (error instanceof AggregateError) {
                throw new Error(`Failed to connect to the postgres database: ${error.errors}`)
            } else {
                throw new Error(`Failed to connect to the postgres database: ${error}`)
            }
        }
    }

    public async checkIfUserExists(username: string): Promise <boolean> {
        return false
    }

    public async checkIfCodeEmailIsValidAndRegister(username: string, code: number, currentTime: number): Promise <boolean> {
        try {
            const queryResponse = await this.#pool.query(
                `SELECT is_user_email_code_right($1, $2, $3)`, 
                [username, code, currentTime]
            )

            return queryResponse.rows[0]
        } catch (error: unknown) {
            console.error(`Failed to check if email code is valid: ${error}`)
            return false
        }
    }

    public async registerUserEmailCode(username: string, password: string, email: string, currentAt: number, targetCode: number): Promise <boolean> {
        try {
            await this.#pool.query(
                `SELECT insert_user_into_emailcodes($1, $2, $3, $4, $5)`, 
                [username, password, email, currentAt, targetCode]
            )

            return false
        } catch (error: unknown) {
            console.error(`Failed to register user emailcode: ${error}`)
            return true
        }
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