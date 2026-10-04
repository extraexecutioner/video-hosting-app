import type { Request, Response } from 'express'

import { isCookieValid as cookieVerification, setCookie } from '../cookies-handler'

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
