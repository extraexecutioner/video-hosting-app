import { type Response } from 'express'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import crypto from 'crypto'

type IsCookieValid = { isCookieValid: boolean, serverError: false } | { isCookieValid: false, serverError: true }
type CookieTypes = "refreshToken" | "accessToken"

export function isCookieValid(cookie: string): IsCookieValid {
    try {
        jwt.verify(cookie, process.env.REFRESH_TOKEN_SECRET!)

        return {
            isCookieValid: true,
            serverError: false
        }
    } catch (error: unknown) {
        if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
            return {
                isCookieValid: false,
                serverError: false
            }
        }

        console.error(`Failed to verify JWT token: ${error}`)

        return {
            isCookieValid: false,
            serverError: true
        }
    }
}

function getRightEnvironment(cookieType: CookieTypes): string {
    if (cookieType === "accessToken") {
        return 'ACCESS_TOKEN_SECRET'
    }

    return 'REFRESH_TOKEN_SECRET'
}

function generateJwtToken(salt: string, cookieType: CookieTypes): string { 
    const currentEnv = getRightEnvironment(cookieType)

    return jwt.sign({ salt: salt }, process.env[currentEnv]!, {
        expiresIn: '7d',
        algorithm: 'HS256'
    })
}

export function setCookie(cookie: CookieTypes, response: Response) {
    const salt = crypto.randomBytes(3).toString("hex")
    const token = generateJwtToken(salt, cookie)

    response.cookie(cookie, token, {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
        maxAge: cookie === "refreshToken" ? 31 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000
    })
}