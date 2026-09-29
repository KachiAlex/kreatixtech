import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BRAND } from './brand'
import './index.css'

document.title = BRAND.name

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
