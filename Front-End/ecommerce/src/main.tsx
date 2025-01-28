import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes.tsx'
import { store } from './Redux/store.ts'
import { Provider } from "react-redux"

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <AppRoutes />
    </StrictMode>
  </Provider>,
)
