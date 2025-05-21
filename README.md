# Linknote

Linknote es una plataforma web creada para que desarrolladores de todos los niveles puedan guardar, organizar y descubrir enlaces útiles relacionados con la programación de manera intuitiva y eficiente. Imagina un centro personal y colaborativo donde encontrar recursos, documentación, tutoriales o compartir tus hallazgos es cuestión de segundos.

## ✨ Características

🔍 Búsqueda y Filtrado Avanzado: Explora y filtra tus enlaces por etiquetas personalizadas, rango de fechas y texto. Encuentra rápidamente el recurso exacto que necesitas para tu próximo proyecto.

🏷️ Etiquetas Inteligentes: Organiza tus enlaces con etiquetas personalizadas y sugerencias automáticas potenciadas por IA.

✍️ Gestión Sencilla: Añade títulos, descripciones enriquecidas y etiquetas a cada enlace para mantener tu biblioteca siempre ordenada.

📊 Estadísticas Rápidas: Visualiza de un vistazo la cantidad de enlaces y etiquetas que has guardado.

## 🛠️ Tecnologías Utilizadas

Next.js – Framework web moderno para aplicaciones rápidas y optimizadas.
React – Para la creación de componentes interactivos y dinámicos.
Tailwind CSS – Para estilos rápidos y responsivos.
Clerk – Para autenticación de usuarios segura y sencilla.
Turso – Base de datos en la nube robusta y escalable.
Drizzle ORM – Acceso a base de datos tipado y seguro.
Zod – Validación de formularios y datos.
Sonner – Notificaciones modernas y personalizables.

## 🚀 Cómo iniciar el proyecto en modo desarrollo

1. Clona el repositorio:
```bash
git clone https://github.com/johnsi15/linknote.git
cd linknote
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Crea un archivo `.env.local` con tus variables de entorno necesarias (consulta `.env.example`).

4. Inicia el servidor de desarrollo:
```bash
pnpm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔐 Uso de Clerk 

Linknote utiliza Clerk como sistema de autenticación principal, permitiendo:

Registro e inicio de sesión de usuarios mediante OAuth (por ejemplo, GitHub).
Protección de rutas: solo los usuarios autenticados pueden crear y gestionar enlaces.
Middleware para asegurar la seguridad de las páginas privadas.

## ⭐ ¡Dale una estrella al repositorio!

Si te gusta este proyecto o te ha resultado útil, considera [darle una estrella en GitHub](https://github.com/johnsi15/linknote). ¡Tu apoyo ayuda a que más personas lo descubran!

## 🌐 Enlaces

🔗 Enlace al proyecto: https://linknotejs.netlify.app/