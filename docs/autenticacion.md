# Autenticación y Protección de Rutas

Linknote utiliza Clerk para la autenticación de usuarios. Las rutas bajo `src/app/(protected)` requieren sesión activa.

- **Registro/Login**: OAuth y email/password vía Clerk.
- **Protección de rutas**: Middleware y layouts verifican sesión antes de renderizar.
- **Uso en componentes**: Hooks de Clerk (`useUser`, `useAuth`) para obtener datos del usuario.
- **API y Server Actions**: Validan el usuario antes de ejecutar mutaciones.

Consulta la documentación de Clerk y el middleware en `src/middleware.ts` para detalles avanzados.
