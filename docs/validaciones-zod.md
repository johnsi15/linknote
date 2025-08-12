# Validaciones con Zod

Zod es una biblioteca de validación de esquemas que permite definir y validar datos de manera sencilla y efectiva. En este proyecto, Zod se utiliza para validar datos en formularios y en las rutas de la API, asegurando que los datos cumplan con los requisitos esperados antes de ser procesados.

## Instalación

Para utilizar Zod en el proyecto, asegúrate de que esté incluido en las dependencias. Si no está instalado, puedes agregarlo ejecutando:

```bash
pnpm add zod
```

## Definición de Esquemas

Los esquemas de validación se definen utilizando la API de Zod. A continuación se muestra un ejemplo de cómo definir un esquema para un formulario de creación de enlaces:

```typescript
import { z } from 'zod';

const linkSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  url: z.string().url('Debes proporcionar una URL válida'),
  tags: z.array(z.string()).optional(),
});
```

## Integración en Formularios

Para integrar Zod en los formularios, puedes utilizar la biblioteca `react-hook-form` junto con `@hookform/resolvers` para manejar la validación. Aquí hay un ejemplo de cómo hacerlo:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(linkSchema),
});

const onSubmit = (data) => {
  console.log(data);
};

// En el JSX del formulario
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('title')} />
  {errors.title && <span>{errors.title.message}</span>}
  
  <input {...register('url')} />
  {errors.url && <span>{errors.url.message}</span>}
  
  <button type="submit">Crear Enlace</button>
</form>
```

## Validaciones Comunes

Zod proporciona una variedad de métodos para realizar validaciones comunes, tales como:

- `min()`: Para establecer un valor mínimo en cadenas o números.
- `max()`: Para establecer un valor máximo.
- `email()`: Para validar direcciones de correo electrónico.
- `url()`: Para validar URLs.

## Manejo de Errores

Cuando se produce un error de validación, Zod devuelve un objeto de error que se puede utilizar para mostrar mensajes de error específicos en la interfaz de usuario. Asegúrate de manejar estos errores adecuadamente para mejorar la experiencia del usuario.

## Ejemplo Completo

Aquí hay un ejemplo completo que combina todo lo anterior:

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const linkSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  url: z.string().url('Debes proporcionar una URL válida'),
});

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(linkSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      
      <input {...register('url')} />
      {errors.url && <span>{errors.url.message}</span>}
      
      <button type="submit">Crear Enlace</button>
    </form>
  );
};
```

Con Zod, puedes asegurarte de que los datos que maneja tu aplicación sean válidos y estén en el formato correcto, lo que mejora la robustez y la confiabilidad de tu proyecto.