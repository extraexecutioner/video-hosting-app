import { Pool } from 'pg'

export interface PostgresDatabaseConfig {
    init: () => Promise <void>
}

export default class PostgresDatabase implements PostgresDatabaseConfig {
    #pool: Pool

    public async init() {
        try {
            await this.#pool.query(`SELECT NOW();`)
        } catch (error: unknown) {
            throw new Error(`Failed to connect to the postgres database: ${error}`)
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