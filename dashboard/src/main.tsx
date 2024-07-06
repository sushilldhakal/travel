import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './Provider/themeProvider'


const queryClient = new QueryClient

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />

      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
