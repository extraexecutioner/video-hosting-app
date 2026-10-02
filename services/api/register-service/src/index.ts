import Server from './server'

class Setup {
    #neededEnvironment: string[] = [
        "REFRESH_TOKEN_SECRET",
        "ACCESS_TOKEN_SECRET",
        "POSTGRES_PORT",
        "POSTGRES_HOST",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "SERVER_PORT"
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
        new Server()
    }
}

new Setup()