import './App.css'
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SeoManager from './components/SeoManager'
import PopupCampaign from './components/PopupCampaign'

const FrontendPage = lazy(() => import('./pages/FrontendPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const GameDetailPage = lazy(() => import('./pages/GameDetailPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))

function App() {
  return (
    <>
      <SeoManager />
      <PopupCampaign />
      <Suspense fallback={null}>
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
      </Suspense>
    </>
  )
}

export default App
