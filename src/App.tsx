import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { ProjectPage } from './pages/ProjectPage'
import { PuppiesPage } from './pages/PuppiesPage'
import { SyncConsultingPage } from './pages/SyncConsultingPage'

export default function App() {
  return (
    // Enables useNavigate, Link, useParams, useLocation everywhere under it
    <BrowserRouter>
      {/* Sticky header — stays mounted across page changes */}
      <Nav />

      {/*
        Only ONE matching Route renders at a time.
        More specific paths must be listed BEFORE parameterized ones,
        otherwise `/:slug` would steal `/puppies`.
      */}
      <Routes>
        {/* Resume / landing page */}
        <Route path="/" element={<Home />} />

        {/*
          Live dog-breed search demo.
          Hits the Django API via relative /api/puppies/… URLs
          (Vite proxies in dev; Caddy proxies in production).
        */}
        <Route path="/puppies" element={<PuppiesPage />} />

        {/*
          Website Builder host. Nav is this SPA; the iframe loads the Sync app
          from /sync-app/ (Vite proxies to :5174 in dev; Caddy in production).
        */}
        <Route path="/sync" element={<SyncConsultingPage />} />

        {/*
          Generic project write-up.
          `:slug` is a URL param (e.g. /puppies would match here too if the
          dedicated route above did not exist). Looked up in data/projects.ts.
        */}
        <Route path="/:slug" element={<ProjectPage />} />

        {/*
          Anything else (typos, old bookmarks) → send the user home.
          `replace` avoids adding a junk entry to browser history.
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
