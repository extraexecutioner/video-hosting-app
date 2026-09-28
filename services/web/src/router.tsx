import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoadingMenu from './pages/loading-menu'

import LoginMenu from './pages/starting-menu/login-menu/component'
import RegisterMenu from './pages/starting-menu/register-menu/component'

const router = createBrowserRouter([
    { path: '/', element: <LoadingMenu/> },
    { path: '/login', element: <LoginMenu/> },
    { path: '/register', element: <RegisterMenu/> }
], { basename: '/' })

export default function App() {
    return <RouterProvider router={router}/>
}