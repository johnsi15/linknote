# Linknote

[Linknote](https://linknote.dev/) es una plataforma web creada para que desarrolladores de todos los niveles puedan guardar, organizar y descubrir enlaces útiles relacionados con la programación de manera intuitiva y eficiente. Imagina un centro personal y colaborativo donde encontrar recursos, documentación, tutoriales o compartir tus hallazgos es cuestión de segundos.

<div align="center">
  <div align="center">
    <a href="https://linknote.dev/">
      <img
      src="https://github.com/johnsi15/linknote/blob/main/public/screen-shot.png?raw=true"
      alt="seocheckai"/>
    </a>

     
  </div>

![Next.js Badge](https://img.shields.io/badge/Next.js&nbsp;14-000?logo=nextdotjs&logoColor=fff&style=flat)
![OpenAI](https://img.shields.io/badge/OpenAI-blue?logo=openai&logoColor=white&labelColor=gray)
![GitHub stars](https://img.shields.io/github/stars/johnsi15/linknote)
![GitHub releases](https://img.shields.io/github/release/johnsi15/linknote)
![GitHub issues](https://img.shields.io/github/issues/johnsi15/linknote)
</div>

> 🚀 <b>Linknote está en producción activa y en mantenimiento continuo.</b> ¡Ayúdanos a mejorarlo y comparte tu feedback!

## ✨ Características

- 🔍 Búsqueda y Filtrado Avanzado: Explora y filtra tus enlaces por etiquetas personalizadas, rango de fechas y texto. Encuentra rápidamente el recurso exacto que necesitas para tu próximo proyecto.
- 🏷️ Etiquetas Inteligentes: Organiza tus enlaces con etiquetas personalizadas y sugerencias automáticas potenciadas por IA.
- ✍️ Gestión Sencilla: Añade títulos, descripciones enriquecidas y etiquetas a cada enlace para mantener tu biblioteca siempre ordenada.
- 📊 Estadísticas Rápidas: Visualiza de un vistazo la cantidad de enlaces y etiquetas que has guardado.
- 🤖 Agrupación de etiquetas por IA: Descubre relaciones entre tus etiquetas gracias a la agrupación automática.
- ⚡ UI Optimista y Feedback Inmediato: Mutaciones optimistas, loaders y notificaciones modernas para una experiencia fluida.
- 🔒 Seguridad y Autenticación: Rutas protegidas con Clerk y middleware seguro.
- 🧩 Modularidad: Hooks personalizados para queries y mutaciones, estructura clara y escalable.
- 🐞 Reporte de bugs y sugerencias desde la propia app.

## 🛠️ Tecnologías Utilizadas

* Next.js – Framework web moderno para aplicaciones rápidas y optimizadas.
* React – Para la creación de componentes interactivos y dinámicos.
* Tailwind CSS – Para estilos rápidos y responsivos.
* Clerk – Para autenticación de usuarios segura y sencilla.
* Turso – Base de datos en la nube robusta y escalable.
* Drizzle ORM – Acceso a base de datos tipado y seguro.
* Zod – Validación de formularios y datos.
* Sonner – Notificaciones modernas y personalizables.
* TanStack Query – Manejo eficiente de datos y cache.
* OpenAI – Sugerencias inteligentes.
* Upstash Vector – Búsqueda semántica y embeddings para etiquetas.

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

- Registro e inicio de sesión de usuarios mediante OAuth (por ejemplo, GitHub).
- Protección de rutas: solo los usuarios autenticados pueden crear y gestionar enlaces.
- Middleware para asegurar la seguridad de las páginas privadas.

## 🧑‍💻 Contribuye o reporta bugs

- ¿Tienes ideas o encontraste un bug? Usa la opción de "Report bug" en la app o abre un issue en GitHub.
- ¡Las contribuciones son bienvenidas! Consulta la documentación y los issues para empezar.

## ⭐ ¡Dale una estrella al repositorio!

Si te gusta este proyecto o te ha resultado útil, considera [darle una estrella en GitHub](https://github.com/johnsi15/linknote). ¡Tu apoyo ayuda a que más personas lo descubran!

## 🌐 Enlaces

- 🔗 Enlace al proyecto: https://linknote.dev
- 📚 Documentación: próximamente

---

## 📄 Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0 (GPLv3)**.
Consulta el archivo `LICENSE` para más detalles.