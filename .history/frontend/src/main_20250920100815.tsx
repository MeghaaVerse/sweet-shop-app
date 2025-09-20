import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'

import { NotificationProvider } from './hooks/useNotifications'
import ErrorBoundary from './components/common/ErrorBoundary'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <ErrorBoundary>
   <AuthProvider>
    <NotificationProvider>

    <BrowserRouter>
      
        <App />
      
    </BrowserRouter>
     </NotificationProvider>
   </AuthProvider>
      </ErrorBoundary>
  </React.StrictMode>,
)