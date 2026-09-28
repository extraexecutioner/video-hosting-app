import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoadingMenu from './pages/loading-menu'

const router = createBrowserRouter([
    { path: '/', element: <LoadingMenu/> }
], { basename: '/' })

export default function App() {
    return <RouterProvider router={router}/>
}