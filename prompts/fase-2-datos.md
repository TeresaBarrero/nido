# Fase 2 · Datos reales con Supabase

Copia y pega esto en Claude Code:

---

Lee `CLAUDE.md` y la sección 4 de `docs/spec.md`.

Objetivo: que Nido funcione con datos reales usando Supabase (plan gratuito).

1. Explícame paso a paso cómo crear el proyecto en supabase.com y qué dos claves necesitas (URL y clave pública "anon"). Espérame a que te las dé. Guárdalas en `.env.local`, nunca en el repositorio.
2. Crea las tablas del modelo de datos con una migración SQL, con Row Level Security en todas.
3. Crea un bucket de almacenamiento para las fotos de los anuncios.
4. Carga los 12 productos de ejemplo y la usuaria Laura como datos iniciales (seed), subiendo las fotos de `public/img/`.
5. Añade inicio de sesión con enlace mágico por correo (sin contraseña).
6. Conecta las pantallas: Inicio y Buscar leen anuncios reales (con filtros y distancia), Vender sube fotos y crea el anuncio, Favoritos, Mis anuncios (editar y pausar), Chat en tiempo real con la propuesta de quedada, Notificaciones y Valoraciones.
7. Aplica las reglas de la sección 5 (sillas de coche, higiene) también en la base de datos, no solo en la interfaz.

Al terminar cada parte, dime qué probar y haz commit.
