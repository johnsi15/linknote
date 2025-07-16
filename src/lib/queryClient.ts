import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de cache por defecto (5 minutos)
      staleTime: 1000 * 60 * 5,
      // Tiempo antes de garbage collection (10 minutos)
      gcTime: 1000 * 60 * 10,
      // Reintentos automáticos
      retry: 3,
      // Intervalo de reintentos (exponencial)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch en focus de ventana
      refetchOnWindowFocus: false,
      // Refetch en reconexión
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentos para mutaciones
      retry: 1,
      // Tiempo de reintento para mutaciones
      retryDelay: 1000,
    },
  },
})
