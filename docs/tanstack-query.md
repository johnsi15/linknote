# TanStack Query

TanStack Query es una poderosa biblioteca para la gestión de caché y el manejo de datos en aplicaciones React. A continuación, se describen los conceptos clave y ejemplos de uso en el proyecto.

## Instalación

Asegúrate de tener instalada la biblioteca en tu proyecto. Puedes hacerlo ejecutando:

```bash
pnpm add @tanstack/react-query
```

## Configuración

Para utilizar TanStack Query, primero debes configurar un `QueryClient` y envolver tu aplicación con el `QueryClientProvider`. Esto se suele hacer en el archivo `providers.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Consultas

Las consultas se utilizan para obtener datos. Puedes crear un hook personalizado para manejar la consulta de enlaces, por ejemplo:

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchLinks } from '../lib/api';

export const useLinks = () => {
  return useQuery(['links'], fetchLinks);
};
```

### Ejemplo de uso

```typescript
const { data, error, isLoading } = useLinks();

if (isLoading) return <div>Cargando...</div>;
if (error) return <div>Error al cargar los enlaces</div>;

return (
  <ul>
    {data.map(link => (
      <li key={link.id}>{link.title}</li>
    ))}
  </ul>
);
```

## Mutaciones

Las mutaciones se utilizan para crear, actualizar o eliminar datos. Aquí hay un ejemplo de cómo crear un nuevo enlace:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLink } from '../lib/api';

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation(createLink, {
    onSuccess: () => {
      queryClient.invalidateQueries(['links']);
    },
  });
};
```

### Ejemplo de uso

```typescript
const createLinkMutation = useCreateLink();

const handleCreateLink = async () => {
  await createLinkMutation.mutateAsync({ title: 'Nuevo Enlace', url: 'https://example.com' });
};

// En el componente
<button onClick={handleCreateLink}>Crear Enlace</button>
```

## Manejo de caché

TanStack Query gestiona automáticamente la caché de las consultas y mutaciones. Puedes invalidar la caché de una consulta específica después de realizar una mutación, como se muestra en el ejemplo anterior.

## Conclusión

TanStack Query simplifica la gestión de datos en aplicaciones React, proporcionando una forma eficiente de manejar la caché y las operaciones de datos. Utilizando consultas y mutaciones, puedes optimizar la carga de datos y mejorar la experiencia del usuario en tu aplicación.