import { useLayoutEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { ProjectPage } from './pages/ProjectPage'
import { PuppiesPage } from './pages/PuppiesPage'

function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

/** Client-side links keep the previous scroll; reset so project pages start at the top. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual'
    scrollWindowToTop()
    // Browser restoration can run after this effect; win that race on the next frame.
    const frame = requestAnimationFrame(scrollWindowToTop)
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

export default function App() {
  return (
    // Enables useNavigate, Link, useParams, useLocation everywhere under it
    <BrowserRouter>
      <ScrollToTop />
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
