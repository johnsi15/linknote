---
applyTo: "src/app/**/*.tsx"
description: Reglas para Server Components en Next.js 15
---

# Server Components en Next.js 15

- Usa Server Components por defecto para data fetching y rendering
- No uses hooks de cliente ni APIs del navegador
- Usa `Suspense` para loading granular
- Prefiere `fetch` con opciones de revalidación para caching
- Implementa `generateStaticParams` para rutas dinámicas estáticas
- Usa `unstable_noStore` para rendering dinámico sin cache
- Usa `Promise.all` y `React.cache` para paralelismo y deduplicación
