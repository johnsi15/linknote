---
description: Reglas y convenciones para almacenamiento offline con Dexie.js y sincronización en Linknote
applyTo: 'src/lib/db.ts'
---

# Dexie.js para Almacenamiento Offline

## Configuración de la Base de Datos

- Instala `dexie` y `dexie-react-hooks` con `pnpm add dexie dexie-react-hooks`
- Crea el archivo `src/lib/db.ts` para definir el esquema de la base de datos
- Define tablas y sus índices usando la sintaxis de Dexie
- Ejemplo:

```typescript
import Dexie, { Table } from 'dexie'

export class LinknoteDB extends Dexie {
  links!: Table<Link, string>
  tags!: Table<Tag, string>
  constructor() {
    super('linknote')
    this.version(1).stores({
      links: 'id, title, url, updatedAt',
      tags: 'id, name',
    })
  }
}
export const db = new LinknoteDB()
```

## Sincronización con Backend

- Implementa un sistema de cola para operaciones offline (add, update, delete)
- Guarda las operaciones en una tabla `queue` con tipo, datos y timestamp
- Crea un servicio de sincronización que procese la cola cuando el usuario recupere conexión
- Maneja conflictos: si hay cambios en el backend, resuelve con la última versión o solicita intervención del usuario
- Usa hooks de Dexie para leer y escribir datos en React Components
- Sincroniza periódicamente o al detectar reconexión

## Recomendaciones

- Mantén el esquema de la base de datos sincronizado con el backend
- Documenta los tipos y operaciones soportadas en la cola
- Implementa feedback visual para el usuario cuando esté offline o en proceso de sincronización
- Testea la persistencia y recuperación de datos en distintos navegadores

# Ejemplo de uso: Hook y componente para agregar links offline

## Hook personalizado

```typescript
// src/hooks/useAddLinkOffline.ts
import { useState } from 'react'
import { db } from '@/lib/db'

export function useAddLinkOffline(defaultValues = { title: '', url: '', description: '', tags: [] }) {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function addLink(linkData) {
    setLoading(true)
    try {
      const id = await db.links.add(linkData)
      setStatus(`Link "${linkData.title}" agregado offline. ID: ${id}`)
    } catch (error) {
      setStatus(`Error al agregar link: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return { addLink, status, loading }
}
```

## Componente de formulario

```tsx
// src/components/dashboard/AddLinkOfflineForm.tsx
import { useState } from 'react'
import { useAddLinkOffline } from '@/hooks/useAddLinkOffline'

export function AddLinkOfflineForm() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const { addLink, status, loading } = useAddLinkOffline()

  function handleSubmit(e) {
    e.preventDefault()
    addLink({
      title,
      url,
      description,
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    })
    setTitle('')
    setUrl('')
    setDescription('')
    setTags('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>{status}</p>
      <input type='text' placeholder='Título' value={title} onChange={e => setTitle(e.target.value)} required />
      <input type='url' placeholder='URL' value={url} onChange={e => setUrl(e.target.value)} required />
      <input type='text' placeholder='Descripción' value={description} onChange={e => setDescription(e.target.value)} />
      <input type='text' placeholder='Tags (separados por coma)' value={tags} onChange={e => setTags(e.target.value)} />
      <button type='submit' disabled={loading}>
        {loading ? 'Guardando...' : 'Agregar offline'}
      </button>
    </form>
  )
}
```

# Ejemplo de consulta y renderizado con Dexie

## Componente para listar links offline

```tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function LinkListOffline() {
  const links = useLiveQuery(() => db.links.toArray())

  return (
    <ul>
      {links?.map(link => (
        <li key={link.id}>
          {link.title} - {link.url}
        </li>
      ))}
    </ul>
  )
}
```

## Componente con parámetros de consulta

```tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function LinkListByTagOffline({ tag }) {
  const links = useLiveQuery(async () => {
    // Consulta todos los links que tengan el tag indicado
    const allLinks = await db.links.toArray()
    return allLinks.filter(link => link.tags?.includes(tag))
  }, [tag])

  return (
    <ul>
      {links?.map(link => (
        <li key={link.id}>
          {link.title} - {link.url}
        </li>
      ))}
    </ul>
  )
}
```

## Ejemplo de integración en la app

```tsx
export const AppOffline = () => (
  <>
    <h1>Linknote Offline</h1>
    <h2>Agregar Link</h2>
    <AddLinkOfflineForm />
    <h2>Links guardados</h2>
    <LinkListOffline />
    <h2>Links por tag</h2>
    <LinkListByTagOffline tag='react' />
  </>
)
```
