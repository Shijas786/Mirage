import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { WalletProvider } from './hooks/useWallet'
import { MirageProvider } from './hooks/useMirage'
import { RevealProvider } from './hooks/useReveal'
import './index.css'

if (!globalThis.Buffer) globalThis.Buffer = Buffer

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

const queryClient = new QueryClient()

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <WalletProvider>
          <MirageProvider>
            <RevealProvider>
              <App />
            </RevealProvider>
          </MirageProvider>
        </WalletProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
)
