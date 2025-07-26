---
applyTo: 'src/components/**/*.tsx'
description: Reglas para Client Components en Next.js 15
---

# Client Components en Next.js 15

- Usa `"use client"` al inicio del archivo para marcarlo como Client Component
- Puedes usar hooks de React y APIs del navegador
- Mantén la lógica de UI interactiva y eventos en Client Components
- Evita data fetching directo en Client Components, pásalo como props desde Server Components
- Usa TanStack Query para mutaciones y sincronización de estado con la API
- Usa loaders visuales (`Loader2` de Lucide) y feedback con Sonner
- Mantén los componentes desacoplados y reutilizables
