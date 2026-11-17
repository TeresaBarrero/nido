# Nido

Compraventa de productos de bebé entre familias del mismo barrio. Proyecto de portfolio UX/UI de Teresa Barrero, convertido en app real (PWA) con Claude Code.

- Prototipo de referencia: `docs/prototipo/index.html`
- Especificación: `docs/spec.md`
- Contexto para Claude Code: `CLAUDE.md`
- Instrucciones por fases: `prompts/`

> Demo de portfolio. Datos de ejemplo, pagos de prueba e imágenes de producto generadas con IA con fines ilustrativos.

## Cómo empezar (paso a paso)

1. **Descomprime** este kit en una carpeta llamada `nido` (por ejemplo, en Documentos).
2. **Abre la carpeta en VS Code:** Archivo › Abrir carpeta › `nido`.
3. **Abre la terminal integrada:** Terminal › Nueva terminal.
4. **Arranca Claude Code con tu cuenta de Nido:** escribe `claude-nido` (el alias que configuramos) y pulsa Enter. La primera vez te pedirá iniciar sesión con esa cuenta.
5. **Pega el prompt de la fase 0** (`prompts/fase-0-git.md`) para subir el kit a GitHub.
6. Sigue con las fases 1, 2, 3 y 4, una por sesión.

## Fases

| Fase | Resultado |
|---|---|
| 0 · Git | Kit subido a github.com/TeresaBarrero/nido |
| 1 · Base | App navegable con datos de ejemplo, igual que el prototipo |
| 2 · Datos | Cuentas, anuncios con fotos, búsqueda, chat y favoritos reales (Supabase) |
| 3 · Pago | Pago protegido simulado con Stripe en modo de prueba |
| 4 · Publicar | App online en Vercel, instalable en el móvil, con modo prueba para testers |
