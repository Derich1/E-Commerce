import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoutes from './routes/routes.tsx'
import { store, persistor } from './Redux/store.ts'
import { Provider } from "react-redux"
import "./index.css"
import { AuthProvider } from './AuthContext.tsx'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'

// const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  
    <Provider store={store}>
      <AuthProvider>
        <PersistGate loading={<div>Carregando...</div>} persistor={persistor}>
        {/* <QueryClientProvider client={queryClient}> */}
          <StrictMode>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StrictMode>
        {/* </QueryClientProvider> */}
        </PersistGate>
      </AuthProvider>
    </Provider>
  ,
)