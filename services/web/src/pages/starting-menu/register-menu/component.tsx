// import styles from './style.module.css'
// import checkIfUserIsAuthorized from '../global.handler'
import { InputField as MainField, MainHeaderInfoField as FieldHeader } from '../global.components'

export default function RegisterMenu(): React.JSX.Element {
    return (
        <section className="register-menu">
            <FieldHeader status="register"/>
            <MainField status="register"/>
            <footer>
                <p>...</p>
            </footer>
        </section>
    )
}