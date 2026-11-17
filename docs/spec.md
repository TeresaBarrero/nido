# Nido · especificación funcional

Referencia visual: `docs/prototipo/index.html` (ábrelo en el navegador). Si algo de este documento y el prototipo no coinciden, manda el prototipo en lo visual y este documento en las reglas.

## 1. Propuesta
Todo lo que tu bebé necesita, de familias de tu barrio, con la tranquilidad de comprarlo nuevo.

Principios: por etapas (no por categorías) · la confianza se ve · cerca primero · vender cuesta lo mínimo · la seguridad va antes que la venta.

## 2. Pantallas
| Ruta | Pantalla | Contenido clave |
|---|---|---|
| `/bienvenida` | Splash + onboarding (3 pasos) | Ubicación · perfil del bebé (opcional) · cómo funciona el pago protegido |
| `/` | Inicio | Saludo y ubicación, campana con no leídas, buscador, 8 secciones, franja del bebé (etapa + aviso "ya no le vale"), "Cerca de ti" (rejilla), "Lo que necesitará pronto" |
| `/buscar` | Buscar | Sección (con subcategorías y filtro propio), etapa, distancia, verificados, lotes, nuevos, crear alerta, resultados |
| `/producto/:id` | Ficha | Galería, precio y ahorro frente a nuevo, estado, uso, etapa, distancia, incluye, etiquetas de higiene, vendedor verificado, punto de entrega, pago protegido |
| `/chat/:id` | Chat | Producto y estado, aviso de seguridad, mensajes, tarjeta de propuesta de quedada, preguntas rápidas |
| `/pagar/:id` | Pago | Resumen, entrega, protección 5 %, total, método de pago |
| `/reservado/:id` | Reserva confirmada | Código de entrega de 4 cifras, "¿y si no se presenta?", simular entrega, valoración |
| `/vender` | Vender (3 pasos) | Fotos → análisis → revisar ficha (sección, etapa, estado, completo, higiene, precio sugerido, entrega) → publicado |
| `/mensajes` | Mensajes | Conversaciones + ayuda rápida (FAQ) |
| `/perfil` | Perfil | Datos y verificación, estadísticas, perfil del bebé, mis anuncios (editar, pausar), valoraciones, invitar |
| `/notificaciones` | Notificaciones | Lista con no leídas y enlace a su pantalla |

Barra inferior fija: Inicio · Buscar · **Vender** (botón central coral) · Mensajes · Perfil.

## 3. Secciones y filtros
| Sección | Subcategorías | Filtro propio |
|---|---|---|
| Ropa y calzado | Bodies y pijamas · Conjuntos · Abrigos · Calzado · Accesorios | Talla: 56/62/68/74/80 cm (con meses) |
| Paseo y viaje | Carritos y sillas de paseo · Capazos · Portabebés y fulares · Accesorios de paseo · Sillas de coche (solo nuevas) | Plegado: una mano / cabe en cabina |
| Dormir | Cunas y minicunas · Moisés y colecho · Sacos y ropa de cuna · Vigilabebés | Colchón: nuevo / sin colchón |
| Habitación | Cómodas y cambiadores · Armarios y estanterías · Lámparas y decoración | Acabado |
| Baño y cambio | Bañeras · Hamacas de baño · Cambiadores portátiles · Orinales y reductores · Higiene nueva | Formato: plegable / precintado |
| Comida | Tronas · Biberones y esterilizadores · Sacaleches · Vajilla infantil | Tipo de trona |
| Juego | Hamacas y balancines · Gimnasios y alfombras · Correpasillos y andadores · Juguetes · Libros | Edad recomendada |
| Seguridad en casa | Barreras · Protectores · Cierres | Ancho de paso |

Filtros comunes: etapa (0-3 m, 3-6 m, 6-12 m, 1-2 años, 2-4 años) · distancia (2/5/10/20 km, por defecto 5) · precio · estado (nuevo precintado, nuevo sin etiqueta, como nuevo, buen estado, con señales de uso) · entrega · verificados · completo con manual · solo lotes.

## 4. Modelo de datos (fase 2, Supabase)
- `profiles`: id, name, neighborhood, lat, lng, verified, rating_avg, rating_count, created_at
- `babies`: id, profile_id, name (opcional), birth_date
- `listings`: id, seller_id, title, description, section, subcategory, stages[], condition, usage, includes, is_complete, hygiene[], price, new_price, delivery ('hand' | 'hand_ship'), lot_count, spec_value, status ('live' | 'paused' | 'reserved' | 'sold'), lat, lng, created_at
- `listing_photos`: id, listing_id, path, position
- `favorites`: profile_id, listing_id
- `alerts`: id, profile_id, filters (json)
- `conversations`: id, listing_id, buyer_id, seller_id
- `messages`: id, conversation_id, sender_id, body, kind ('text' | 'meeting_proposal'), payload (json), created_at
- `reservations`: id, listing_id, buyer_id, meeting_place, meeting_at, amount, fee, status ('paid' | 'delivered' | 'cancelled'), delivery_code
- `reviews`: id, reservation_id, author_id, target_id, stars, text
- `notifications`: id, profile_id, kind, title, body, link, read

Seguridad: Row Level Security en todas las tablas (cada usuario solo edita lo suyo; los anuncios activos son públicos).

## 5. Reglas
- Si la sección es Paseo y viaje y la subcategoría es Sillas de coche, solo se permite el estado "Nuevo precintado", y el anuncio queda pendiente de revisión.
- Si se detecta o elige una silla de coche usada al publicar, mostrar la pantalla "Parece una silla de coche" con la explicación.
- Higiene nueva: solo "Nuevo precintado".
- Protección Nido: 5 % del precio (mínimo 0,50 €), pagada por quien compra.
- El pago se libera cuando el vendedor introduce el código de entrega; si se cancela por ausencia, se devuelve en 24 h.

## 6. Datos de ejemplo
Los 12 productos del prototipo (array `P` en `docs/prototipo/index.html`) con sus fotos en `public/img/`. Usuaria de ejemplo: Laura, Chamberí (Madrid), bebé Lucía nacida el 12/06/2026.

## 7. Animaciones
Escaneo de fotos al publicar y campos que aparecen uno a uno · tarjeta que se expande a la ficha (View Transitions) · corazón con "pop" · check que se dibuja y código que aparece · esqueletos de carga · barra de etapa que se llena. Todas desactivadas con `prefers-reduced-motion`.
