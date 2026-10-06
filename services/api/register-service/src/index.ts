import Server from './server'

class Setup {
    server: Server
    #neededEnvironment: string[] = [
        "REFRESH_TOKEN_SECRET",
        "ACCESS_TOKEN_SECRET",
        "EMAIL_CODE_TOKEN_SECRET",
        "POSTGRES_PORT",
        "POSTGRES_HOST",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "SERVER_PORT",
        "NODEMAILER_APP_USER",
        "NODEMAILER_APP_PASSWORD"
    ]

    #setupEnvInit() {
        this.#neededEnvironment.forEach(environment => {
            if (!process.env[environment]) {
                throw new Error(`Failed to find environment element: ${environment}`)
            }
        })
    }

    public constructor() {
        this.#setupEnvInit()
        this.server = new Server()
    }
}

const setup = new Setup()
const server = setup.server

export default server