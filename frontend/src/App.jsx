import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import FrontendPage from './pages/FrontendPage'
import AdminPage from './pages/AdminPage'
import GamesPage from './pages/GamesPage'
import GameDetailPage from './pages/GameDetailPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import SeoManager from './components/SeoManager'
import PopupCampaign from './components/PopupCampaign'

function App() {
  return (
    <>
      <SeoManager />
      <PopupCampaign />
      <Routes>
        <Route path="/" element={<FrontendPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:slug" element={<GameDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
