import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import ScreenBlock from './components/ScreenBlock.tsx'
import { bustIfVersionMismatch } from './lib/cache/camino_frontend_cache'

// Clear IndexedDB cache if build version changed
bustIfVersionMismatch()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScreenBlock>
        <App />
      </ScreenBlock>
    </BrowserRouter>
  </StrictMode>,
)
