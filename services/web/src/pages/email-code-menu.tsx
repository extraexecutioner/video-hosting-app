import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import ErrorMenu from './error-menu'

export function calculateTime(startTime: number): number {
    const currentTime = Date.now()
    const secondsPassed = Math.floor((currentTime - startTime) / 1000)

    return Math.max(0, 60 - secondsPassed)
}

export function verifyEmailCodeApplication(startTimeOrigin: unknown, emailAttemptsLeft: unknown, emailCodeMessage: unknown): [true, null] | [false, string] {
    if (!startTimeOrigin || typeof startTimeOrigin !== "number" || calculateTime(startTimeOrigin) === 0) {
        return [false, `Failed to find email_code_time_origin localstorage element, restart the page!`]
    }

    if (!emailAttemptsLeft || typeof emailAttemptsLeft !== "number" || emailAttemptsLeft <= 0) {
        return [false, `Failed to find email_attempts_left localstorage element, restart the page!`]
    }

    if (!emailCodeMessage || typeof emailCodeMessage !== "string") {
        return [false, `Failed to find email_code_sending_message localstorage element, restart the page!`]
    }

    return [true, null]
}

export default function EmailCodePage(): React.JSX.Element {
    const navigate = useNavigate()
    const [errorMsg, setErrorMsgState] = useState <string | null> (null)

    const startTimeOrigin = localStorage.getItem("email_code_time_origin")
    const emailAttemptsLeft = localStorage.getItem("email_attempts_left")
    const emailCodeMessage = localStorage.getItem("email_code_sending_message")

    const [attempts, setAttemptsState] = useState <number> ((emailAttemptsLeft as any as number))
    const [timeLeft, setTimeLeftState] = useState <number> (calculateTime(startTimeOrigin as any as number))

    const onInputChanged = (event: React.ChangeEvent <HTMLInputElement, HTMLInputElement>) => {
        console.log(event)
    }

    const removeLocalStorageValues = () => {
        localStorage.removeItem("email_code_time_origin")
        localStorage.removeItem("email_attempts_left")
        localStorage.removeItem("email_code_sending_message")
    }

    const logout = () => {
        removeLocalStorageValues()
        navigate("/register", { replace: true })
    }

    const submitMiddleware = (code: unknown, emailAttemptsLeft: unknown): boolean => {
        if (!code || typeof code !== "string") {
            return false
        }

        if (!Number.isFinite(Number(code)) || code.trim().length !== 6) {
            return false
        }

        if (!emailAttemptsLeft || typeof emailAttemptsLeft !== "number") {
            return false
        }

        return true
    }

    const onSubmit = async (event: React.SubmitEvent <HTMLFormElement>) => {
        event.preventDefault()

        if (attempts === 0) {
            return logout()
        }

        const formData = new FormData(event.currentTarget)
        const code = formData.get("six-digit-code-input")

        if (!submitMiddleware(code, localStorage.getItem("email_attempts_left"))) {
            return console.error(`Failed to continue the code application!`)
        }

        localStorage.setItem("email_attempts_left", Math.max(attempts, 0) as number as any)
        setAttemptsState(localStorage.getItem("email_attempts_left") as any as number)

        try {
            const serverResponse = await fetch("/users/auths/codes", {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    code: Number(code)
                })
            })

            if (!serverResponse.ok) {
                const serverResponseData = await serverResponse.json() as { fail: true, errorMsg: string }
                console.error(`Failed to fetch the server: ${serverResponseData.errorMsg}`)

                removeLocalStorageValues()
                return setErrorMsgState(serverResponseData.errorMsg)
            }

            console.log(`Created an account!!!`)
        } catch (error: unknown) {
            console.error(`Failed to send a code request: ${error}`)

            removeLocalStorageValues()
            return setErrorMsgState("Failed to send a code request!")
        }
    }
    
    useEffect(() => {
        let secondsLeft = calculateTime((startTimeOrigin as any as number))
        let interval: number | null

        if (secondsLeft !== 0) {
            interval = setInterval(() => {
                secondsLeft = calculateTime((startTimeOrigin as any as number))
                setTimeLeftState(secondsLeft)

                if (secondsLeft === 0) {
                    clearInterval(interval as number)
                    logout()
                }
            }, 1000)
        }

        return () => { if (interval) clearInterval(interval) }
    }, [])
            
    return (
        <>
            {errorMsg ? (
                <ErrorMenu errorMsg={errorMsg}/>
            ) : (
                <section className="email-code-section">
                    <header>
                        <h1>{emailCodeMessage}</h1>
                        <h2>{timeLeft}s</h2>
                        <h3>Attempts: {attempts}</h3>
                    </header>
                    <main>
                        <form onSubmit={onSubmit}>
                            <label htmlFor="six-digit-code-input">Six-Digit Code:</label>
                            <input id="six-digit-code-input" name="six-digit-code-input" type="text" onChange={onInputChanged}/>
                            <button type="submit">Submit</button>
                        </form>
                    </main>
                </section>
            )}
        </>
    )
}