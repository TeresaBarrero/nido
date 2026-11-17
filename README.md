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
| 3 · Pago | Pago protegido simulado (sin pasarela: se registra como pagado, sin cargos reales) |
| 4 · Publicar | App online en Vercel, instalable en el móvil, con modo prueba para testers |

## Cómo funciona la demo

- **Probar la demo**: entra como invitada sin registrarse (Supabase, inicio de sesión anónimo). Se crea una cuenta de ejemplo con perfil de Laura, bebé Lucía, anuncios propios, valoraciones y notificaciones.
- **Entrar con mi correo**: enlace mágico, sin contraseña.
- Las familias de ejemplo **responden solas en el chat** y proponen un punto de entrega.
- Los anuncios de ejemplo **no se agotan**: cada tester ve su propia reserva y entrega.
- **Modo prueba**: en Inicio hay 3 tareas y, al final, un cuestionario (`/opinion`). Las respuestas se ven en `/resultados`, solo para administradoras.

### Dar acceso a /resultados

1. Entra una vez en la app con tu correo (Entrar con mi correo).
2. En Supabase › SQL Editor ejecuta (cambiando el correo):
   ```sql
   insert into public.admins (profile_id) select id from auth.users where email = 'TU_CORREO';
   ```

## Base de datos

Las migraciones están en `supabase/migrations/` (ejecutar en orden en el SQL Editor) y los datos de ejemplo en `supabase/seed.sql`.
Reglas de producto aplicadas también en la base de datos: sillas de coche e higiene solo nuevas y precintadas, sillas de coche siempre a revisión, cada usuaria solo puede modificar lo suyo (Row Level Security).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y rellena la URL y la clave publicable de Supabase
npm run dev
```

## Publicación (Vercel)

1. Importa el repositorio en Vercel (Framework: Vite).
2. Variables de entorno: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Añade la URL de Vercel en Supabase › Authentication › URL Configuration (Site URL y Redirect URLs).
