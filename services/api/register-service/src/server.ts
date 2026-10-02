import express, { type Request, type Response, Router } from 'express'
import http from 'http'

import PostgresDatabase, { type PostgresDatabaseConfig } from './postgres-handler'
import { checkIfUserIsLogged, register, registerMiddleware } from './handler'

export default class Server {
    #app: express.Express = express()
    #server: http.Server = http.createServer(this.#app)
    #database!: Omit <PostgresDatabaseConfig, "init">

    #setRoutes() {
        const router = Router()

        router.get("/auths", checkIfUserIsLogged)
        router.post("/auths", registerMiddleware, register)
        
        this.#app.get("/healthchecks", (_: Request, response: Response) => {
            console.log(`Got healthcheck!`)
            return response.status(204).end()
        })

        this.#app.use("/users", router)
    }

    #serverSignalsDetector() {

    }

    async #setup() {
        // this.#database = new PostgresDatabase()
        // await (this.#database as PostgresDatabaseConfig).init()

        this.#serverSignalsDetector()

        this.#server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => [
            console.log(`Server is running successfully!`)
        ])
    }

    public constructor() { 
        this.#setRoutes()
        this.#setup() 
    }
}