import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoadingPage from './pages/LoadingPage'
import MainPage from './pages/MainPage'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showMainPage, setShowMainPage] = useState(false)

  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Small delay to start showing main page after loading finishes
      setTimeout(() => {
        setShowMainPage(true)
      }, 100)
    }, 0) // 3 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  return (
    <Router>
      <div className="app-container">
        {!showMainPage && (
          <div className={`page-transition loading-page-container ${!isLoading ? 'fade-out' : ''}`}>
            <LoadingPage />
          </div>
        )}

        <div className={`page-transition main-page-container ${showMainPage ? 'fade-in' : ''}`}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
