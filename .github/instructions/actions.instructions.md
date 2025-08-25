---
applyTo: 'src/actions/**/*.ts'
description: Reglas y convenciones para Server Actions en Linknote
---

# Server Actions en Linknote

- Ubica las server actions en `src/actions/`
- Usa `"use server"` al inicio si la acción será llamada desde componentes o rutas server
- Protege todas las acciones con Clerk: verifica el usuario con `getSecureSession()` antes de operar
- Valida los datos recibidos usando Zod antes de procesar
- Devuelve siempre un objeto con `{ success: boolean, ... }` y mensajes de error claros
- Usa `nanoid()` para generar IDs únicos
- Revalida rutas relevantes con `revalidatePath()` tras mutaciones
- Maneja errores con try/catch y loguea los errores en consola
- Para acciones de tags y links, asegúrate de que el usuario solo pueda operar sobre sus propios recursos
- Las acciones deben ser desacopladas y reutilizables por API routes y componentes

# Integración con Next.js 15 y convenciones generales

- Define Server Actions con la directiva `"use server"` al inicio del archivo.
- Las Server Actions pueden ser llamadas desde Server y Client Components para mutaciones de datos.
- Organiza las acciones por dominio (ej: `links.ts`, `tags.ts`) y mantén la lógica desacoplada.
- Usa las utilidades de Next.js 15 como `revalidatePath` para mantener la UI sincronizada tras mutaciones.
- Prefiere pasar datos validados y tipados (usando Zod) entre acciones y componentes.
- Implementa loading y error states en los componentes que consumen acciones, usando feedback visual y loaders.
- No mezcles lógica de cliente (hooks, browser APIs) en archivos de Server Actions.
- Si usas Server Actions en formularios, aprovecha `useFormStatus`, `useFormState` y `useOptimistic` en los Client Components para UX avanzada.
- Mantén la seguridad: nunca expongas datos sensibles ni permitas operaciones sobre recursos de otros usuarios.
- Documenta cada acción con comentarios claros sobre su propósito y uso.

# Ejemplo de Server Action recomendada

```typescript
'use server'
import { getSecureSession } from '@/lib/auth/server'
import { linkSchema } from '@/lib/validations/link'
import { nanoid } from 'nanoid'
import { db } from '@/db'

export async function createLink(formData) {
  const { userId } = await getSecureSession()

  if (!userId) return { success: false, error: 'Unauthorized' }

  const validated = linkSchema.parse(formData)
  const linkId = nanoid()

  await db.insert(links).values({ ...validated, id: linkId, userId })
  // ...relaciones y lógica extra
  return { success: true, linkId }
}
```

# Dos y Donts

- Do: Valida y tipa todos los datos recibidos
- Do: Protege cada acción con verificación de usuario
- Do: Revalida rutas tras mutaciones
- Dont: No mezcles lógica de cliente en acciones server
- Dont: No expongas datos sensibles ni permitas acceso a recursos ajenos
