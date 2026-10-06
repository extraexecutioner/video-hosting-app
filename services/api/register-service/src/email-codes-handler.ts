import { type Request, type Response, type NextFunction } from 'express'
import crypto from 'crypto'

import nodemailer from 'nodemailer'
import { z } from 'zod'

import server from './index'
import { setCookie, isCookieValid } from './cookies-handler'

export type CodeRequestSimplified = (request: Request, response: Response) => Promise <void>

type EmailCodeRequestValues = Omit <Request, "body"> & { body: { code: number }, cookies: { emailCodeToken: string } }
type EmailCodeResponseValues = Omit <Response, "locals"> & { locals: { username: string }}

const codeRequestBodySchema = z.object({
    code: z
        .number()
        .transform(val => String(val))
        .pipe(z.string()
            .length(6)
        )
})

const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_APP_USER,
        pass: process.env.NODEMAILER_APP_PASSWORD
    }
})

function generateEmailCode(): number {
    const min = 100000
    const max = 999999
    const range = max - min + 1
    
    const randomBytes = crypto.randomBytes(4)
    const randomNumber = randomBytes.readUInt32BE(0)

    return min + (randomNumber % range)
}

function sendCodeToEmail(code: number, email: string) {
    try {
        transporter.sendMail({
            from: `video-hosting-app <${process.env.NODEMAILER_APP_USER}>`,
            to: email,
            subject: "Код подтверждения email",
            text: `Ваш код: ${code}, не сообщайте не кому!`
        })
    } catch (error: unknown) {
        console.error(`Failed to send email code: ${error}`)
    }
}

export async function registerEmailCode(username: string, password: string, email: string, response: Response) {
    const targetCode = generateEmailCode()
    const commands = server.getDatabaseCommands()

    const startedAt = Date.now()
    const serverIntervalError = await commands.registerUserEmailCode(username, password, email, startedAt, targetCode)

    if (serverIntervalError) {
        return response.status(500).json({
            fail: true,
            errorMsg: "Server interval error!"
        })
    }

    sendCodeToEmail(targetCode, email)

    const msg = `Send a six-digit code to your email, ${email}\n You have 60 seconds to fill input!`
    setCookie({ username: username }, "emailCodeToken", response)

    response.status(200).json({
        fail: false,
        storage: {
            email_code_time_origin: startedAt,
            email_attempts_left: 3,
            email_code_sending_message: msg
        }
    })
}

export function codeRequestMiddleware(request: Request, response: Response, next: NextFunction) {
    const body = request.body
    const bodySafe = codeRequestBodySchema.safeParse(body)

    if (!bodySafe.success) {
        return response.status(400).json({
            errorMsg: "Code is invalid!",
            fail: true
        })
    }

    const cookies = request.cookies
    const emailCodeToken = cookies.emailCodeToken

    const { cookiePayload, serverError } = isCookieValid("emailCodeToken", emailCodeToken, response)

    if (!cookiePayload) {
        const [statusCode, msg] = serverError ? 
            [500, "Server Interval Error!"] : 
            [400, "Cookie is expired!"]

        return response.status(statusCode).json({
            errorMsg: msg,
            fail: true
        })
    }

    response.locals.username = cookiePayload.username
    next()
}

export async function codeRequest(request: EmailCodeRequestValues, response: EmailCodeResponseValues) {
    const currentTime = Date.now()

    const username = response.locals.username
    const code = request.body.code

    const commands = server.getDatabaseCommands()
    const isRegistered = await commands.checkIfCodeEmailIsValidAndRegister(username, code, currentTime)

    if (!isRegistered) {
        return response.status(500).json({
            fail: true,
            errorMsg: "Server interval error, please try again."
        })
    }

    console.log(`Result: ${Date.now()}`)

    response.status(201).end()
}