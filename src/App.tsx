import { useState, useEffect } from 'react'
import LoadingPage from './pages/LoadingPage'
import MainPage from './pages/MainPage'

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
    }, 3000) // 3 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="app-container">
      {!showMainPage && (
        <div className={`page-transition loading-page-container ${!isLoading ? 'fade-out' : ''}`}>
          <LoadingPage />
        </div>
      )}

      <div className={`page-transition main-page-container ${showMainPage ? 'fade-in' : ''}`}>
        <MainPage />
      </div>
    </div>
  )
}

export default App
