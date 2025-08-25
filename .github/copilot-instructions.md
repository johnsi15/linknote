# Copilot Instructions for Linknote

## Arquitectura y patrones principales

- **Stack:** Next.js 15.x (App Router), React, TanStack Query, Clerk (auth), Turso (DB), Drizzle ORM, Tailwind, Zod, Sonner.
- **Dominio:** Gestión de enlaces y etiquetas, con autosave, mutaciones optimistas y feedback inmediato.
- **Rutas protegidas:** Todo lo que está en `src/app/(protected)` requiere autenticación (Clerk).
- **API Routes:** CRUD para links y tags en `src/app/api/links` y `src/app/api/tags`. Los endpoints RESTful usan `/api/tags/[id]` para PUT/DELETE y `/api/tags` para GET/POST.

## Flujos de desarrollo

- **Desarrollo local:**

  - Instala dependencias con `pnpm install`
  - Corre el proyecto con `pnpm run dev`
  - Variables de entorno en `.env` (ver `.env.example`)

- **Mutaciones y queries:**

  - Usa hooks de TanStack Query para toda la comunicación con la API (`useLink`, `useLinks`, `useCreateTag`, `useUpdateTag`, etc.)
  - Las mutaciones invalidan automáticamente el cache relevante (`queryClient.invalidateQueries`)
  - Para transiciones tipo Notion (crear link/tag y navegar), usa `router.replace()` y actualiza el cache con `queryClient.setQueryData` antes de navegar.

- **Autosave:**
  - El autosave está implementado en el formulario de links (`src/components/dashboard/link-form.tsx`) usando un custom hook.
  - El submit manual y el autosave se diferencian por el parámetro `isAutoSaveEvent`.

## Convenciones y patrones

- **API Route Handlers:**

  - No desestructures `{ params }` directamente en los handlers. Usa la firma:
    ```typescript
    export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await params
        // ...
      } catch (error) {
        // ...manejo de error
      }
    }
    ```
  - Accede al id con `const { id } = await params`

- **Validaciones:**

  - Usa Zod para validar datos de formularios y API.
  - Los endpoints devuelven `{ success: boolean, ... }` y errores claros.

- **UI Feedback:**

  - Usa Sonner para notificaciones.
  - Los botones de acción muestran loaders (`Loader2` de Lucide) y se desactivan durante operaciones.

- **Optimistic UI:**
  - Al crear un link/tag, actualiza el cache antes de navegar para evitar loaders innecesarios.

## Ejemplos clave

- **Mutación de tag:**

  ```typescript
  const updateTag = useUpdateTag()
  updateTag.mutate({ id, name }, { onSuccess: ... })
  ```

- **API Route Handler:**

  ```typescript
  export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // ...
  }
  ```

- **Optimistic update + navegación:**
  ```typescript
  queryClient.setQueryData(linkKeys.detail(result.linkId), { ... })
  router.replace(`/links/${result.linkId}`)
  ```

## Directorios importantes

- `src/hooks/queries/` – Hooks para queries de links y tags
- `src/hooks/mutations/` – Hooks para mutaciones (create, update, delete)
- `src/app/api/` – Endpoints RESTful
- `src/components/dashboard/` – Componentes principales de UI

---
