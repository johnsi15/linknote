# Yoopta Editor Documentation

## Introducción

El editor Yoopta es una herramienta poderosa utilizada en el proyecto para crear y editar contenido de manera efectiva. Proporciona una interfaz intuitiva y una serie de características que facilitan la manipulación de texto y la integración de elementos multimedia.

## Configuración

Para integrar el editor Yoopta en tu proyecto, sigue estos pasos:

1. **Instalación**: Asegúrate de que el paquete de Yoopta esté instalado en tu proyecto. Puedes hacerlo ejecutando el siguiente comando:

   ```
   pnpm install @yoopta/editor
   ```

2. **Importación**: Importa el componente del editor en el archivo donde deseas utilizarlo:

   ```javascript
   import { Editor } from '@yoopta/editor';
   ```

3. **Configuración del Editor**: Puedes personalizar el editor pasando propiedades específicas. Aquí hay un ejemplo básico de cómo configurarlo:

   ```javascript
   const MyEditor = () => {
     return (
       <Editor
         initialContent="<p>Escribe aquí tu contenido...</p>"
         onChange={(content) => console.log(content)}
       />
     );
   };
   ```

## Características

El editor Yoopta ofrece varias características útiles:

- **Formato de Texto**: Permite aplicar estilos como negrita, cursiva, subrayado, y más.
- **Elementos Multimedia**: Puedes insertar imágenes, videos y otros elementos multimedia fácilmente.
- **Deshacer y Rehacer**: Funcionalidades de deshacer y rehacer para facilitar la edición.
- **Soporte para Markdown**: Permite la entrada de texto en formato Markdown, lo que facilita la escritura y el formateo.

## Ejemplos de Uso

### Crear un Editor Básico

Aquí tienes un ejemplo de cómo crear un editor básico con Yoopta:

```javascript
import { Editor } from '@yoopta/editor';

const BasicEditor = () => {
  return (
    <Editor
      initialContent="<p>Comienza a escribir...</p>"
      onChange={(content) => console.log(content)}
    />
  );
};
```

### Integración con Formularios

Puedes integrar el editor dentro de un formulario para capturar el contenido del usuario:

```javascript
import { useForm } from 'react-hook-form';
import { Editor } from '@yoopta/editor';

const FormWithEditor = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Editor
        {...register('content')}
        initialContent="<p>Escribe tu contenido aquí...</p>"
      />
      <button type="submit">Enviar</button>
    </form>
  );
};
```

## Conclusión

El editor Yoopta es una herramienta versátil que mejora la experiencia de creación de contenido en el proyecto. Su fácil integración y características robustas lo convierten en una excelente opción para cualquier aplicación que requiera edición de texto enriquecido.