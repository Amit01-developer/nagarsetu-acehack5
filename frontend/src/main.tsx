import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import OneSignal from 'react-onesignal'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

const oneSignalAppId =
  import.meta.env.VITE_ONESIGNAL_APP_ID || 'abdf5717-3fce-4c02-b77f-13147dd7a57d';

const bootstrap = async () => {
  try {
    if (oneSignalAppId) {
      await OneSignal.init({
        appId: oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
      });
    }
  } catch {
    // OneSignal can fail to load (adblock, unsupported browser, etc.)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

bootstrap()
