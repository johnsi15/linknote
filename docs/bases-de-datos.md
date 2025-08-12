# Estructura y Uso de Bases de Datos en el Proyecto

Este documento detalla la estructura y el uso de las bases de datos en el proyecto Linknote. A continuación, se describen los aspectos clave relacionados con la configuración, conexión y operaciones CRUD básicas.

## Configuración de la Base de Datos

El proyecto utiliza Turso como base de datos. Para configurarla, asegúrate de tener las credenciales necesarias y de haber creado una instancia de la base de datos en el servicio de Turso.

### Conexión a la Base de Datos

La conexión a la base de datos se realiza a través de un cliente que se inicializa en el archivo `src/lib/db.ts`. Asegúrate de importar y utilizar este cliente en los lugares donde necesites interactuar con la base de datos.

```typescript
import { db } from '../lib/db';

// Ejemplo de uso
const fetchData = async () => {
  const data = await db.links.findMany();
  return data;
};
```

## Operaciones CRUD Básicas

### Crear

Para crear un nuevo registro en la base de datos, utiliza el método correspondiente del cliente de base de datos. Por ejemplo, para crear un nuevo enlace:

```typescript
const createLink = async (linkData) => {
  await db.links.create({
    data: linkData,
  });
};
```

### Leer

Para leer datos, puedes utilizar métodos como `findMany` o `findUnique`:

```typescript
const getLinks = async () => {
  return await db.links.findMany();
};

const getLinkById = async (id) => {
  return await db.links.findUnique({
    where: { id },
  });
};
```

### Actualizar

Para actualizar un registro existente, utiliza el método `update`:

```typescript
const updateLink = async (id, updatedData) => {
  await db.links.update({
    where: { id },
    data: updatedData,
  });
};
```

### Eliminar

Para eliminar un registro, utiliza el método `delete`:

```typescript
const deleteLink = async (id) => {
  await db.links.delete({
    where: { id },
  });
};
```

## Conclusión

La gestión de bases de datos en el proyecto Linknote se realiza de manera eficiente utilizando Turso. Asegúrate de seguir las mejores prácticas al realizar operaciones CRUD y de manejar adecuadamente los errores que puedan surgir durante la interacción con la base de datos.