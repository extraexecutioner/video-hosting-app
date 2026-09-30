import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoadingMenu from './pages/loading-menu'
import MainPage from './pages/main-page'

import LoginMenu from './pages/starting-menu/login-menu/component'
import RegisterMenu from './pages/starting-menu/register-menu/component'

import VideoMenu from './pages/platform/video-menu/platform-menu'
import VideoUploadMenu from './pages/platform/video-upload-menu/video-upload-menu'

const router = createBrowserRouter([
    { path: '/loading', element: <LoadingMenu/> },
    { path: '/login', element: <LoginMenu/> },
    { path: '/register', element: <RegisterMenu/> },
    { path: 'videos/watch', element: <VideoMenu/> },
    { path: 'videos/upload', element: <VideoUploadMenu/> },
    { path: '/', element: <MainPage/> }
], { basename: '/' })

export default function App() {
    return <RouterProvider router={router}/>
}