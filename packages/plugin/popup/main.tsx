import '~/styles'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@web-archive/shared/components/theme-provider'
import PopupContainer from './PopupPage'
import '@web-archive/shared/global.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PopupContainer></PopupContainer>
    </ThemeProvider>
  </React.StrictMode>,
)
