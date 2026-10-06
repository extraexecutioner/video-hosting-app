import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useState } from 'react'

import LoadingMenu from './pages/loading-menu'
import MainPage from './pages/main-page'

import LoginMenu from './pages/starting-menu/login-menu/component'
import RegisterMenu from './pages/starting-menu/register-menu/component'

import VideoMenu from './pages/platform/video-menu/platform-menu'
import VideoUploadMenu from './pages/platform/video-upload-menu/video-upload-menu'

import ErrorMenu from './pages/error-menu'
import EmailCodePage, { verifyEmailCodeApplication } from './pages/email-code-menu'

const router = createBrowserRouter([
    { path: '/loading', element: <LoadingMenu/> },
    { path: '/login', element: <LoginMenu/> },
    { path: '/register', element: <RegisterMenu/> },
    { path: '/register/email-code', element: <EmailCodePage/> },
    { path: '/videos/watch', element: <VideoMenu/> },
    { path: '/videos/upload', element: <VideoUploadMenu/> },
    { path: '/', element: <MainPage/> }
], { basename: '/' })

export let errorMsgStateOutDir: [string | null, React.Dispatch <React.SetStateAction <string | null>>] | null

function emailCodeConfigCheckup() {
    const startTimeOrigin = localStorage.getItem("email_code_time_origin")
    const emailAttemptsLeft = localStorage.getItem("email_attempts_left")
    const emailCodeMessage = localStorage.getItem("email_code_sending_message")

    if (
        window.location.href !== "/register/email-code" &&
        verifyEmailCodeApplication(startTimeOrigin, emailAttemptsLeft, emailCodeMessage)
    ) {
        window.history.replaceState(null, '', '/register/email-code')
    } else {
        localStorage.removeItem("email_code_time_origin")
        localStorage.removeItem("email_attempts_left")
        localStorage.removeItem("email_code_sending_message")

        window.history.replaceState(null, '', '/')
    }
}

emailCodeConfigCheckup()

export default function App() {
    const errorMsgState = useState <string | null> (null)
    errorMsgStateOutDir = errorMsgState

    return (
        <>
            {errorMsgState[0] ? (
                <ErrorMenu errorMsg={errorMsgState[0]}/>
            ) : (
                <RouterProvider router={router}/>
            )}
        </>
    )
}