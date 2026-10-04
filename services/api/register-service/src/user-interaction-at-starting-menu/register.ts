import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

import { registerEmailCode } from '../email-codes-handler'

interface RegisterBody {
    username: string;
    password: string;
    email: string;
}

const registerBodySchema = z.object({
    username: z
        .string({ error: "Invalid username!" })
        .min(6, { error: "More than 6 username symbols required!" })
        .max(12, { error: "Maximum 12 username symbols allowed!" })
        .regex(/^\S+$/, { error: "Username cannot contain spaces!" }),
        
    password: z
        .string({ error: "Invalid password!" })
        .min(8, { error: "Password must be at least 8 characters long!" })
        .max(16, { error: "Password cannot exceed 16 characters!" })
        .regex(/^\S+$/, { error: "Password cannot contain spaces!" }),
        
    email: z
        .string({ error: "Invalid email!" })
        .toLowerCase()
        .min(11, { error: "Email must be at least 11 characters long!" })
        .max(36, { error: "Email cannot exceed 36 characters!" })
        .regex(/^\S+$/, { error: "Email cannot contain spaces!" })
        .regex(/@gmail\.com$/, { error: "Only @gmail.com addresses are allowed!" })
})

function isRegisterBodyValid(body: unknown): [true, null] | [false, string] {
    const areBodyElementsValid = registerBodySchema.safeParse(body)
    
    if (areBodyElementsValid.success) {
        return [true, null]
    }

    const fieldErrors = areBodyElementsValid.error.issues
    console.log(fieldErrors, body)
    let errorResult: string = ""

    for (const errorMsg of fieldErrors) {
        errorResult += `${errorMsg.message}\n`
    }

    return [false, errorResult]
}

export function registerMiddleware(request: Request, response: Response, next: NextFunction) {
    const body = request.body

    if (!body) {
        return response.status(400).json({
            fail: true,
            errorMsg: "No body object detected!"
        })
    }

    const [isBodyValid, errorMsg] = isRegisterBodyValid(body)

    if (!isBodyValid) {
        return response.status(400).json({
            fail: true,
            errorMsg: errorMsg
        })
    }

    next()
}

async function hashPassword(password: string): Promise <[true, string] | [false, null]> {
    try {
        return [true, await Bun.password.hash(password, {
            algorithm: "argon2id",
            memoryCost: 32000,
            timeCost: 3
        })]
    } catch (error: unknown) {
        console.error(`Failed to hash password with argon2: ${error}`)
        return [false, null]
    }
}

export async function register(request: Omit <Request, "body"> & { body: RegisterBody }, response: Response) {
    const { username, password, email } = request.body
    const [isHashSuccessful, hashedPassword] = await hashPassword(password)

    if (!isHashSuccessful) {
        return response.status(500).json({
            fail: true,
            errorMsg: "Server interval error!"
        })
    }

    registerEmailCode(username, email, response)
}