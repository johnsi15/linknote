---
applyTo: 'src/app/api/**/*.ts'
description: Reglas para API Routes en Next.js 15
---

# API Routes en Next.js 15

- Ubica los handlers en `src/app/api/`
- Usa la firma recomendada para handlers:
  ```typescript
  export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { ... }
  ```
- No desestructures `{ params }` directamente, accede con `const { id } = await params`
- Valida datos con Zod antes de procesar
- Devuelve respuestas con `{ success: boolean, ... }` y errores claros
- Usa NextResponse para respuestas HTTP
- Implementa try/catch para manejo de errores
- Protege rutas sensibles con Clerk y verifica el usuario antes de procesar
