import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import DeclarativeApp from './DeclarativeApp.jsx'
import './example.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DeclarativeApp />
    </BrowserRouter>
  </StrictMode>,
)
