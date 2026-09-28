import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './router'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>
)