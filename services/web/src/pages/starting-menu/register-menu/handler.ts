import type React from 'react'

import { checkIfInputsValid } from '../global.handler'
import { errorMsgStateOutDir as errorMsgState } from '../../../router'

interface RegisterStatistics {
    username: string;
    password: string;
    email: string;
}

type ServerDataResponse = { fail: false, errorMsg: null } | { fail: true, errorMsg: string }
type StatisticsResult = [RegisterStatistics, null] | [null, string]

function getStatistics(event: React.SubmitEvent <HTMLFormElement>): StatisticsResult {
    const targetValue = new FormData(event.currentTarget)

    const elements = Object.fromEntries(targetValue.entries())
    const neededValues = ["username", "password", "email"]

    let invalidValue: string | null = null

    const checkIfElementsAreValid = (elements: Record <any, any>): elements is RegisterStatistics => {
        for (const value of neededValues) {
            if (!Object.hasOwn(elements, value)) {
                invalidValue = value
                return false
            }
        }

        return true
    }

    const elementsValid = checkIfElementsAreValid(elements)
    if (!elementsValid) return [null, invalidValue as any as string]

    const [elementsValuesValid, errorMsg] = checkIfInputsValid(elements)
    if (!elementsValuesValid) return [null, errorMsg]

    return [elements, null]
}

export default async function sendRegisterRequest(event: React.SubmitEvent <HTMLFormElement>) {
    event.preventDefault()
    const [requestBody, invalidValue] = getStatistics(event)

    if (invalidValue || !requestBody) {
        console.error(invalidValue)
        return errorMsgState![1](invalidValue)
    }

    try {
        const serverResponse = await fetch("/users/auths", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(requestBody)
        })

        if (serverResponse.status !== 404) {
            const serverDataResponse = await serverResponse.json() as ServerDataResponse
            
            if (!serverResponse.ok || serverDataResponse.fail) {
                errorMsgState![1](`Failed To Fetch the server: ${serverDataResponse.errorMsg}`)
                return console.error(`Failed To Fetch the server: ${serverDataResponse.errorMsg}`)
            }
        } else {
            errorMsgState![1](`Failed To Fetch the server!`)
            return console.error(`Failed To Fetch the server!`)
        }

    } catch (errorMsg: unknown) {
        console.error(`Failed to fetch server: ${errorMsg}`)
        return errorMsgState![1]("Failed To Fetch the server!")
    }
}