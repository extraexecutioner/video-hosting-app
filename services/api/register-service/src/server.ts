import express, { type Request, type Response, Router } from 'express'
import cookieParser from 'cookie-parser'
import http from 'http'

import PostgresDatabase, { type PostgresDatabaseConfig } from './postgres-handler'
import { register, registerMiddleware } from './user-interaction-at-starting-menu/register'
import { checkIfUserIsLogged } from './user-interaction-at-starting-menu/global'

import { codeRequestMiddleware, codeRequest, type CodeRequestSimplified } from './email-codes-handler'

export default class Server {
    #app: express.Express = express()
    #server: http.Server = http.createServer(this.#app)
    #database!: Omit <PostgresDatabaseConfig, "init">

    #setRoutes() {
        const router = Router()

        router.head("/auths", checkIfUserIsLogged)
        router.post("/auths", registerMiddleware, register)
        router.post("/auths/codes", codeRequestMiddleware, codeRequest as CodeRequestSimplified)
        
        this.#app.get("/healthchecks", (_: Request, response: Response) => { return response.status(204).end() })
        this.#app.use("/users", router)
    }

    #serverSignalsDetector() {

    }

    async #setup() {
        this.#app.use(express.json())
        this.#app.use(cookieParser())

        this.#serverSignalsDetector()

        this.#database = new PostgresDatabase()
        await (this.#database as PostgresDatabaseConfig).init()

        this.#server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => [
            console.log(`Server is running successfully!`)
        ])
    }

    public getDatabaseCommands(): Readonly <Omit <PostgresDatabaseConfig, "init">> {
        return this.#database
    }

    public constructor() { 
        this.#setup()
        this.#setRoutes()
    }
}