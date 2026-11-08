import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { StoreProvider } from './lib/store'
import { isEmbed } from './lib/supabase'
import './index.css'

// En el tablero de pantallas (embed) no se instala el service worker: así siempre se ve la última versión.
if (!isEmbed) registerSW({ immediate: true })

// HashRouter: las rutas viajan en el "#", así la app funciona desde cualquier carpeta o servidor estático
// (el tablero de pantallas, GitHub Pages, la app móvil) sin configurar redirecciones.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
)
