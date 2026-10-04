import { type Response } from 'express'
import crypto from 'crypto'

function generateEmailCode(): number {
    const min = 100000
    const max = 999999
    const range = max - min + 1
    
    const randomBytes = crypto.randomBytes(4)
    const randomNumber = randomBytes.readUInt32BE(0)

    return min + (randomNumber % range)
}

export function registerEmailCode(username: string, email: string, response: Response) {
    const targetCode = generateEmailCode()
}