import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

axios.defaults.withCredentials = true

const rootElement = document.getElementById('root')

// Si hay HTML renderizado por react-snap, usamos hydrate
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, 
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

reportWebVitals()
