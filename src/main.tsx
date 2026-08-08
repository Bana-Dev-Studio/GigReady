import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getAppRoute } from './router'
import { PublicLanding } from './PublicLanding'

const pathname = window.location.pathname
const route = getAppRoute(pathname, import.meta.env.BASE_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {route === 'app' ? <App /> : <PublicLanding />}
  </StrictMode>,
)
