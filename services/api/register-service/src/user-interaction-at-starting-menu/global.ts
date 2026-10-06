import type { Request, Response } from 'express'
import crypto from 'crypto'

import { isCookieValid as cookieVerification, setCookie, deleteCookie, type CookieTypes } from '../cookies-handler'

function userHasCookiesCheckup(cookies: Record <string, string>): cookies is Record <string, string> & { refreshToken: string } {
    return Object.hasOwn(cookies, "refreshToken")
}

export function checkIfUserIsLogged(request: Request, response: Response) {
    const cookies = request.cookies
    if (!cookies) return response.status(401).end()

    const doesUserHasCookies = userHasCookiesCheckup(cookies)
    if (!doesUserHasCookies) return response.status(401).end()

    if (cookies.emailCodeToken && !cookieVerification("emailCodeToken", cookies.emailCodeToken, response)) {
        deleteCookie("emailCodeToken", response)
        return response.status(401).end()
    }

    const refreshToken = cookies.refreshToken
    const { cookiePayload, serverError } = cookieVerification("refreshToken", cookies.refreshToken, response)

    if (!cookiePayload) {
        const errorCode = serverError ? 500 : 400
        return response.status(errorCode).end()
    }

    setCookie({ salt: crypto.randomBytes(3).toString("hex") }, "refreshToken", response)
    setCookie({ salt: crypto.randomBytes(3).toString("hex") }, "accessToken", response)

    response.status(204).end()
}