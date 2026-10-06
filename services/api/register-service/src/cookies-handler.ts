import { type Response } from 'express'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

interface CookiePayload {
    username: string;
}

type IsCookieValid = { cookiePayload: CookiePayload | null, serverError: false } | { cookiePayload: null, serverError: true }
export type CookieTypes = "refreshToken" | "accessToken" | "emailCodeToken"

export function isCookieValid(cookie: CookieTypes, token: string, response: Response): IsCookieValid {
    try {
        const payload = jwt.verify(token, process.env[getRightEnvironment(cookie)]!) as CookiePayload | null
        return { cookiePayload: payload, serverError: false }
    } catch (error: unknown) {
        if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
            deleteCookie(cookie, response)
            return { cookiePayload: null, serverError: false }
        }

        console.error(`Failed to verify JWT token: ${error}`)
        return { cookiePayload: null, serverError: true }
    }
}

function getRightEnvironment(cookieType: CookieTypes): string {
    switch (cookieType) {
        case "accessToken":
            return 'ACCESS_TOKEN_SECRET'
        case "refreshToken":
            return 'REFRESH_TOKEN_SECRET'
        case "emailCodeToken":
            return 'EMAIL_CODE_TOKEN_SECRET'
    }
}

function generateJwtToken(payload: Record <string, string>, cookieType: CookieTypes): string { 
    const currentEnv = getRightEnvironment(cookieType)
    return jwt.sign(payload, process.env[currentEnv]!, { algorithm: 'HS256' })
}

function getCookieMaxAge(cookie: CookieTypes): number {
    switch (cookie) {
        case "accessToken":
            return 15 * 60 * 1000
        case "refreshToken":
            return 31 * 24 * 60 * 60 * 1000
        case "emailCodeToken":
            return 100 * 1000
    }
}

export function deleteCookie(cookie: CookieTypes, response: Response) {
    response.clearCookie(cookie, {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
        maxAge: 0
    }) 
}

export function setCookie(payload: Record <string, string>, cookie: CookieTypes, response: Response) {
    const token = generateJwtToken(payload, cookie)

    response.cookie(cookie, token, {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
        maxAge: getCookieMaxAge(cookie)
    })
}