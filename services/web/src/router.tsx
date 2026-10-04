import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useState } from 'react'

import LoadingMenu from './pages/loading-menu'
import MainPage from './pages/main-page'

import LoginMenu from './pages/starting-menu/login-menu/component'
import RegisterMenu from './pages/starting-menu/register-menu/component'

import VideoMenu from './pages/platform/video-menu/platform-menu'
import VideoUploadMenu from './pages/platform/video-upload-menu/video-upload-menu'

import ErrorMenu from './pages/error-menu'

window.history.replaceState(null, '', '/')

const router = createBrowserRouter([
    { path: '/loading', element: <LoadingMenu/> },
    { path: '/login', element: <LoginMenu/> },
    { path: '/register', element: <RegisterMenu/> },
    { path: 'videos/watch', element: <VideoMenu/> },
    { path: 'videos/upload', element: <VideoUploadMenu/> },
    { path: '/', element: <MainPage/> }
], { basename: '/' })

export let errorMsgStateOutDir: [string | null, React.Dispatch <React.SetStateAction <string | null>>] | null

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