import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import ReportPage from './pages/ReportPage'
import RequestPage from './pages/RequestPage'
import OfferPage from './pages/OfferPage'
import NearbyPage from './pages/NearbyPage'
import CommunityPage from './pages/CommunityPage'
import CoordinationPage from './pages/CoordinationPage'
import ProfilePage from './pages/ProfilePage'
import TutorialPage from './pages/TutorialPage'
import AuthPage from './pages/AuthPage'
import NotificationsPage from './pages/NotificationsPage'
import { useStore } from './lib/store'
import { recuperando } from './lib/auth'

/** Con la cuenta real, todo lo que usa datos compartidos exige haber iniciado sesión. */
function Protegida({ children }: { children: ReactElement }) {
  const { mode, authReady, session } = useStore()
  if (mode === 'demo') return children
  if (!authReady) return <p role="status" className="p-8 text-center font-bold">Cargando…</p>
  if (!session || recuperando()) return <Navigate to="/acceso" replace />
  return children
}

const p = (el: ReactElement) => <Protegida>{el}</Protegida>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/acceso" element={<AuthPage />} />
      <Route path="/tutorial" element={<TutorialPage />} />
      <Route path="/inicio" element={p(<Home />)} />
      <Route path="/mapa" element={p(<MapPage />)} />
      <Route path="/reportar" element={p(<ReportPage />)} />
      <Route path="/solicitar" element={p(<RequestPage />)} />
      <Route path="/ofrecer" element={p(<OfferPage />)} />
      <Route path="/solicitudes" element={p(<NearbyPage />)} />
      <Route path="/comunidad" element={p(<CommunityPage />)} />
      <Route path="/notificaciones" element={p(<NotificationsPage />)} />
      <Route path="/coordinacion" element={p(<CoordinationPage />)} />
      <Route path="/perfil" element={p(<ProfilePage />)} />
      <Route path="*" element={p(<Home />)} />
    </Routes>
  )
}
