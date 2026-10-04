interface NeededInputs {
    username: string;
    email?: string;
    password: string;
}

type InputTypes = "username-input" | "password-input" | "email-input"

export default async function checkIfUserIsAuthorized(): Promise <boolean> {
    return false
}

export function checkIfInputsValid(inputs: NeededInputs): [true, null] | [false, string] {
    const entries = Object.entries(inputs) as [keyof NeededInputs, string][]

    for (const [inputName, inputValue] of entries) {
        const limit: number | null = getInputLimit(`${inputName}-input`) || null
        const inputValueLength = inputValue.trim().length

        if (inputValueLength > limit || inputValueLength < (limit / 2)) {
            const status: "short" | "long" = inputValueLength > limit ? "long" : "short"
            return [false, `${inputName[0].toUpperCase() + inputName.slice(1)} is too ${status}!`]
        }

        if (inputName === "email" && !inputValue.endsWith("@gmail.com")) {
            return [false, "Invalid email endpoint, excepted @gmail.com!"]
        }
    }

    return [true, null]
}

export function getInputLimit(currentId: InputTypes): 12 | 16 | 36 {
    switch (currentId) {
        case "username-input":
            return 12
        case "password-input":
            return 16
        case "email-input": 
            return 36
        }
}