---
applyTo: 'src/hooks/**/*.ts'
description: Reglas para hooks personalizados y TanStack Query
---

# Hooks personalizados y TanStack Query

- Ubica hooks de queries en `src/hooks/queries/` y de mutaciones en `src/hooks/mutations/`
- Usa TanStack Query para toda la comunicación con la API
- Las mutaciones deben invalidar el cache relevante con `queryClient.invalidateQueries`
- Implementa optimistic updates cuando sea posible para mejor UX
- Los hooks deben ser desacoplados y reutilizables
- Usa tipos estrictos para los datos y respuestas de la API
- Los hooks de autosave deben diferenciar entre eventos manuales y automáticos

# Ejemplos prácticos

## Hook de query (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query'
import { getLinkById } from '@/actions/links'

export function useLink(id: string) {
  return useQuery({
    queryKey: ['link', id],
    queryFn: () => getLinkById(id),
    enabled: !!id && id !== 'new',
  })
}
```

## Hook de mutación (TanStack Query)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLink } from '@/actions/links'

export function useCreateLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })
}
```

## Autosave y diferenciación de eventos

- Usa un parámetro `isAutoSaveEvent` para distinguir entre guardado automático y manual en los hooks y componentes.
- Ejemplo:

```typescript
const handleSubmit = (values, isAutoSaveEvent = false) => {
  // ...
}
```

## Recomendaciones

- Tipa estrictamente los datos y respuestas de la API en los hooks.
- Implementa manejo de errores y feedback visual en los componentes que usan hooks.
- Mantén los hooks desacoplados y reutilizables.
- Las mutaciones deben invalidar el cache relevante para mantener la UI sincronizada.
