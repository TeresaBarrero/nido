# Fase 1 · La app con datos de ejemplo

Copia y pega esto en Claude Code:

---

Lee `CLAUDE.md`, `docs/spec.md` y abre `docs/prototipo/index.html` para entender cómo debe verse y funcionar Nido.

Objetivo de esta fase: convertir el prototipo en una app real con Vite + React + TypeScript, todavía con **datos de ejemplo** (sin base de datos).

1. Crea el proyecto con Vite (React + TypeScript) en esta misma carpeta, sin borrar `docs/`, `prompts/`, `public/img/`, `src/styles/tokens.css` ni `CLAUDE.md`.
2. Instala React Router y `vite-plugin-pwa`. Configura la PWA con nombre "Nido", colores de la marca e icono provisional basado en el logo del prototipo.
3. Crea `src/styles/global.css` con las fuentes Nunito y Nunito Sans y los estilos base usando `tokens.css`.
4. Pasa los 12 productos de ejemplo del prototipo a `src/data/products.ts`, con sus fotos de `public/img/`.
5. Construye las pantallas y componentes de la tabla de `docs/spec.md` (sección 2) con el mismo aspecto, textos y recorridos que el prototipo: bienvenida y onboarding, Inicio, Buscar con secciones y filtros, Ficha, Chat, Pago, Reservado, Vender en 3 pasos (incluida la pantalla de silla de coche), Mensajes, Perfil y Notificaciones.
6. Incluye las animaciones descritas en la spec (sección 7), respetando `prefers-reduced-motion`.
7. Diseño móvil primero. En pantallas grandes, muestra la app centrada con ancho de móvil.

Trabaja en pasos pequeños. Después de cada bloque de pantallas, arranca `npm run dev`, dime qué dirección abrir y qué probar, y haz un commit. Al final, sube los cambios a GitHub.
