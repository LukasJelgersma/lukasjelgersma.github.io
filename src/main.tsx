import ReactDOM from 'react-dom/client'
import router from './routes'
import './styles/main.scss'
import { RouterProvider } from 'react-router-dom'
import { StrictMode } from 'react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)