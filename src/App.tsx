import { Route, Routes } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/inicio" element={<Home />} />
      <Route path="/mapa" element={<MapPage />} />
      <Route path="/reportar" element={<ReportPage />} />
      <Route path="/solicitar" element={<RequestPage />} />
      <Route path="/ofrecer" element={<OfferPage />} />
      <Route path="/solicitudes" element={<NearbyPage />} />
      <Route path="/comunidad" element={<CommunityPage />} />
      <Route path="/coordinacion" element={<CoordinationPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/tutorial" element={<TutorialPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
