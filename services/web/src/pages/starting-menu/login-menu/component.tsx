// import styles from './style.module.css'

// import styles from './style.module.css'
// import checkIfUserIsAuthorized from '../global.handler'

import { InputField as MainField, MainHeaderInfoField as FieldHeader } from '../global.components'

export default function LoginMenu(): React.JSX.Element {
    return (
        <section className="register-menu">
            <FieldHeader status="login"/>
            <MainField status="login"/>
            <footer>
                <p>...</p>
            </footer>
        </section>
    )
}