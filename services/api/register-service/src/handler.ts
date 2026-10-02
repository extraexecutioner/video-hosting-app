import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

import { isCookieValid as cookieVerification, setCookie } from './cookies-handler'

interface RegisterBody {
    username: string;
    password: string;
    email: string;
}

const registerBodySchema = z.object({
    username: z.string().min(6).max(12).regex(/^\S+$/),
    password: z.string().min(8).max(16).regex(/^\S+$/),
    email: z.string().toLowerCase().min(11).max(36).regex(/^\S+$/).regex(/@gmail\.com$/)
})

function userHasCookiesCheckup(cookies: Record <string, string>): cookies is Record <string, string> & { refreshToken: string } {
    return Object.hasOwn(cookies, "refreshToken")
}

export function checkIfUserIsLogged(request: Request, response: Response) {
    const cookies = request.cookies

    const doesUserHasCookies = userHasCookiesCheckup(cookies)
    if (!doesUserHasCookies) return

    const refreshToken = cookies.refreshToken
    const { isCookieValid, serverError } = cookieVerification(refreshToken)

    if (!isCookieValid) {
        const errorCode = serverError ? 500 : 400

        return response.status(errorCode).json({
            isCookieValid: isCookieValid
        })
    }

    setCookie("refreshToken", response)
    setCookie("accessToken", response)

    response.status(200).json({
        isCookieValid: isCookieValid
    })
}

function isRegisterBodyValid(body: unknown): body is RegisterBody {
    const areBodyElementsValid = registerBodySchema.safeParse(body)
    return areBodyElementsValid.success
}

export function registerMiddleware(request: Request, response: Response, next: NextFunction) {
    const body = request.body
    const isBodyValid = isRegisterBodyValid(body)

    if (!isBodyValid) {
        return response.status(400).json({
            fail: true
        })
    }

    next()
}

export async function register(request: Omit <Request, "body"> & { body: RegisterBody }, response: Response) {
    const { username, password, email } = request.body
    

}