import { useNavigate } from 'react-router-dom'

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

export function InputField({status}: { status: "register" | "login" }): React.JSX.Element {
    const limitInputSymbols = (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        let limit: 12 | 16 | 36
        const currentId = event.currentTarget.id

        if (
            !currentId || 
            currentId !== "password-input" &&
            currentId !== "username-input" &&
            currentId !== "email-input"
        ) { 
            throw new Error(`No Id provided, error!`) 
        } else {
            switch (currentId) {
                case "username-input":
                    limit = 12
                    break
                case "password-input":
                    limit = 16
                    break
                case "email-input": 
                    limit = 36
                    break
            }

            const currentTarget =  event.currentTarget
            currentTarget.value = currentTarget.value.trim()

            const currentTargetValue = currentTarget.value

            if (currentTargetValue.length > limit) {
                currentTarget.value = currentTarget.value.slice(0, limit)
            }
        }
    }

    return (
        <main className="input-field">
            <form>
                <p>{status} here:</p>

                <label htmlFor="username-input">username:</label>
                <input 
                    id="username-input" 
                    type="text"
                    placeholder="0-9"
                    onChange={limitInputSymbols}
                />

                <label htmlFor="password-input">password:</label>
                <input 
                    id="password-input" 
                    type="password"
                    placeholder="0-9, 8 min length, 12 max"
                    onChange={limitInputSymbols}
                />

                {status === "register" && (
                    <>
                        <label htmlFor="email-input">email:</label>
                        <input 
                            id="email-input" 
                            type="text"
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