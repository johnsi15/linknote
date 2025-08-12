# Arquitectura General de Linknote

Linknote es una aplicación fullstack moderna basada en Next.js 15 (App Router), React 19 y una arquitectura orientada a la experiencia offline-first y sincronización eficiente.

## Diagrama de alto nivel

- **Frontend (React/Next.js)**: UI, hooks, TanStack Query, integración con Clerk, Yoopta Editor, Sonner.
- **Backend (API Routes y Server Actions)**: CRUD de enlaces y etiquetas, validaciones con Zod, lógica de sincronización.
- **Base de datos**: Turso (SQLite cloud) + Drizzle ORM.
- **Offline**: Dexie.js (IndexedDB) para almacenamiento local y sincronización.
- **Autenticación**: Clerk.
- **AI**: Extracción de metadatos y sugerencias con AI SDK/OpenAI.

## Flujos clave

- **Protección de rutas**: Middleware y layouts en `(protected)`.
- **Autosave y mutaciones optimistas**: Formularios con autosave y feedback inmediato.
- **Sincronización offline**: Dexie + hooks personalizados.
- **Validaciones**: Zod en frontend y backend.

Consulta los archivos de docs para detalles de cada tecnología.
