import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import checkIfUserIsAuthorized from './starting-menu/global.handler'
import LoadingMenu from './loading-menu'

export default function MainPage(): React.JSX.Element {
    const navigate = useNavigate()
            
    const isUsedAuthorized = async () => {
        const isUserAuthorized = await checkIfUserIsAuthorized()

        if (isUserAuthorized) {
            return navigate("/", { replace: true })
        }

        navigate("/register", { replace: true })
    }
    
    useEffect(() => {
        isUsedAuthorized()
    }, [])

    return <LoadingMenu/>
}