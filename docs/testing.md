# Testing en Linknote

## E2E
- Se usa Playwright (`e2e/`).
- Comando: `pnpm test:e2e` o `pnpm test:e2e:headed`.
- Los tests cubren flujos de autenticación, dashboard, creación y edición de enlaces.

## Unitarios
- Se recomienda agregar tests unitarios para hooks y lógica crítica (no implementados por defecto).

## Buenas prácticas
- Agrega tests para nuevas features.
- Usa mocks para dependencias externas.
- Consulta los archivos en `e2e/` como referencia.
