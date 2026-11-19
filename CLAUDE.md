# Nido · contexto para Claude Code

## Qué es
Nido es una app de compraventa de productos de bebé entre familias que viven cerca: ropa, muebles, paseo y productos de higiene nuevos. Es un proyecto de portfolio de diseño UX/UI de Teresa Barrero que ahora se convierte en una app real y navegable para que otras personas la prueben.

- **Objetivo:** una PWA (app web instalable en el móvil) publicada con un enlace, con datos reales y el pago simulado.
- **Referencia visual y de recorridos:** `docs/prototipo/index.html`. Ábrelo antes de diseñar cualquier pantalla: el aspecto, los textos y los flujos de la app deben coincidir con él.
- **Especificación completa:** `docs/spec.md`.
- **Tokens de diseño:** `src/styles/tokens.css` (y `docs/design-tokens.json`).
- **Fotos de ejemplo:** `public/img/` (generadas con IA, solo para datos de ejemplo).

## Cómo trabajar conmigo
- Soy diseñadora, no programadora experta. **Explícame cada paso en español sencillo**: qué vas a hacer, por qué y cómo lo veo funcionando.
- **Pregúntame antes de** crear cuentas o servicios externos (Supabase, Stripe, Vercel), de pegar claves o de borrar archivos.
- Trabaja por fases (`prompts/`). Al terminar cada fase: arranca la app (`npm run dev`), dime qué abrir y qué probar, y haz un commit con un mensaje claro.
- Nunca subas claves secretas al repositorio: van en `.env.local`, que está en `.gitignore`.

## Stack
- Vite + React + TypeScript, React Router.
- CSS propio con variables (`tokens.css`) y CSS Modules. Sin librerías de componentes pesadas.
- PWA con `vite-plugin-pwa`.
- Fase 2: Supabase (autenticación, base de datos Postgres, almacenamiento de fotos, tiempo real para el chat).
- Fase 3: Stripe en modo de prueba para el pago protegido.
- Despliegue: Vercel.
- Código, nombres de archivos y commits en inglés; **todos los textos de la interfaz en español de España**.

## Reglas de producto (no negociables)
1. **No se pueden publicar sillas de coche usadas.** Solo nuevas y precintadas, con revisión.
2. No se vende leche de fórmula ni alimentación infantil. Higiene solo nueva y precintada.
3. Entrega **en mano por defecto**; el envío es opcional.
4. Tallas de ropa **en centímetros**, con los meses como ayuda ("68 cm · 3-6 m").
5. El perfil del bebé es opcional y solo guarda fecha de nacimiento y nombre opcional. Nunca fotos del bebé.
6. Chat, quedada y pago siempre dentro de la app.

## Diseño
- Estilo minimalista, cálido y algo profesional: pasteles solo como fondo, textos y acciones en tonos oscuros, esquinas muy redondeadas.
- Tipografía: Nunito (títulos, 800-900) y Nunito Sans (texto).
- Productos sobre fondo neutro `--neutral`; los pasteles identifican secciones y estados.
- Accesibilidad: contraste AA, zonas táctiles de 44 px como mínimo, botones y enlaces reales, `aria-label` en botones de solo icono.
- Animaciones sutiles y con propósito; respetar siempre `prefers-reduced-motion`.

## Estructura prevista
```
src/
  app/          rutas y layout (barra inferior)
  screens/      Home, Search, Product, Chat, Checkout, Sell, Profile, Notifications, Onboarding
  components/   Card, Chip, Button, SectionTile, BabyStrip, TabBar…
  data/         datos de ejemplo (fase 1) y acceso a Supabase (fase 2)
  styles/       tokens.css, global.css
public/img/     fotos de ejemplo
docs/           especificación, tokens y prototipo de referencia
prompts/        instrucciones por fase
```
