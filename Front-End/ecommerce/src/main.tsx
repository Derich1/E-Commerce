import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoutes from './routes/routes.tsx'
import { store } from './Redux/store.ts'
import { Provider } from "react-redux"
import "./index.css"
import { AuthProvider } from './AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Provider store={store}>
      <StrictMode>
        <AppRoutes />
      </StrictMode>
    </Provider>
  </AuthProvider>,
)
