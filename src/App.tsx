import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { ProjectPage } from './pages/ProjectPage'
import { PuppiesPage } from './pages/PuppiesPage'

/**
 * Top-level routes for the portfolio SPA.
 * Order matters: `/puppies` is registered before `/:slug` so the live
 * dog-search page wins over the generic project template.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Interactive API demo — not just a write-up */}
        <Route path="/puppies" element={<PuppiesPage />} />
        {/* Static project pages from src/data/projects.ts */}
        <Route path="/:slug" element={<ProjectPage />} />
        {/* Unknown paths bounce home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
