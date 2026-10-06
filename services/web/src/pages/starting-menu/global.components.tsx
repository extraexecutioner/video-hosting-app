import { useNavigate } from 'react-router-dom'

import sendRegisterRequest, { type RegisterRequestResponse } from './register-menu/handler'
import sendLoginRequest from './login-menu/handler'

import { getInputLimit } from './global.handler'

type InputFieldConfig = { status: "register" | "login" }

export function MainHeaderInfoField({status}: { status: "register" | "login" }): React.JSX.Element {
    const navigate = useNavigate()

    return (
        <header>
            {status === "register" ? (
                <h1>Register Or <span onClick={() => navigate("/login", { replace: true })}>Login</span></h1>
            ) : (
                <h1>Login!!</h1>
            )}

            <h2>video-hosting-app</h2>
            <h3>Made by Best Solo Software Architect & Enginner</h3>

            {status === "login" && (
                <p>No account? <span onClick={() => navigate("/register", { replace: true })}>Register</span></p>
            )}
        </header>
    )
}

function limitInputSymbols(event: React.ChangeEvent <HTMLInputElement, HTMLInputElement>) {
    const currentId = event.currentTarget.id

    if (
        !currentId || 
        currentId !== "password-input" &&
        currentId !== "username-input" &&
        currentId !== "email-input"
    ) { 
        throw new Error(`No Id provided, error!`) 
    } else {
        const limit: 12 | 16 | 36 = getInputLimit(currentId)

        const currentTarget =  event.currentTarget
        currentTarget.value = currentTarget.value.trim()

        const currentTargetValue = currentTarget.value

        if (currentTargetValue.length > limit) {
            currentTarget.value = currentTarget.value.slice(0, limit)
        }
    }
}

export function InputField({status}: InputFieldConfig): React.JSX.Element {
    const navigate = useNavigate()

    const submitFunc = async (event: React.SubmitEvent<HTMLFormElement>) => {
        const SendRequestFunc = status === "register" ? 
            sendRegisterRequest as (event: React.SubmitEvent<HTMLFormElement>) => Promise <RegisterRequestResponse> : 
            sendLoginRequest as (event: React.SubmitEvent<HTMLFormElement>) => Promise <RegisterRequestResponse>

        const [serverResponseSuccessed, localStorageValues] = await SendRequestFunc(event)

        if (serverResponseSuccessed) {
            for (const [key, name] of Object.entries(localStorageValues)) {
                localStorage.setItem(key, name)
            }

            navigate("/register/email-code", { replace: true })
        }
    }

    return (
        <main className="input-field">
            <form onSubmit={(event) => { event.preventDefault(); navigate("/loading", { replace: true }); submitFunc(event) }}>
                <p>{status} here:</p>

                <label htmlFor="username-input">username:</label>
                <input 
                    id="username-input" 
                    type="text"
                    autoComplete="off"
                    name="username"
                    placeholder="0-9"
                    onChange={limitInputSymbols}
                />

                <label htmlFor="password-input">password:</label>
                <input 
                    id="password-input" 
                    type="password"
                    autoComplete="off"
                    name="password"
                    placeholder="0-9, 8 min length, 12 max"
                    onChange={limitInputSymbols}
                />

                {status === "register" && (
                    <>
                        <label htmlFor="email-input">email:</label>
                        <input 
                            id="email-input" 
                            type="text"
                            name="email"
                            autoComplete="off"
                            placeholder="0-9@gmail.com"
                            onChange={limitInputSymbols}
                        />
                    </>
                )}

                <button type="submit">{status[0].toUpperCase() + status.slice(1)}</button>
            </form>
        </main>
    )
}