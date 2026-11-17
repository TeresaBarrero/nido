-- Nido · datos de ejemplo (fase 2)
-- 12 anuncios del prototipo, sus vendedores, la usuaria Laura (Chamberí) y su bebé Lucía.
-- Las fotos se esperan en el bucket listing-photos, carpeta seed/ (p. ej. seed/banera.jpg).

-- Centro de Chamberí (Madrid): 40.4340, -3.7040

-- ------------------------------------------------------------
-- Perfiles de ejemplo (sin cuenta de usuario)
-- ------------------------------------------------------------
insert into public.profiles (id, name, neighborhood, lat, lng, verified, rating_avg, rating_count, tone) values
  ('00000000-0000-4000-8000-000000000001', 'Laura',     'Chamberí', 40.4340, -3.7040, true,  5.0, 11, 'sky'),
  ('00000000-0000-4000-8000-000000000011', 'Marta R.',  'Chamberí', 40.4302, -3.7012, true,  4.9, 32, 'peach'),
  ('00000000-0000-4000-8000-000000000012', 'Carlos M.', 'Chamberí', 40.4335, -3.7058, true,  4.8, 14, 'sky'),
  ('00000000-0000-4000-8000-000000000013', 'Ana G.',    'Chamberí', 40.4325, -3.7020, false, 5.0,  9, 'mint'),
  ('00000000-0000-4000-8000-000000000014', 'Javier L.', 'Chamberí', 40.4335, -3.7070, true,  4.7, 21, 'lavender'),
  ('00000000-0000-4000-8000-000000000015', 'Lucía P.',  'Chamberí', 40.4350, -3.7005, true,  4.9, 40, 'butter'),
  ('00000000-0000-4000-8000-000000000016', 'Irene S.',  'Chamberí', 40.4285, -3.7020, false, 4.6,  7, 'pink'),
  ('00000000-0000-4000-8000-000000000017', 'Sara V.',   'Chamberí', 40.4255, -3.7010, true,  4.8, 12, 'sky'),
  ('00000000-0000-4000-8000-000000000018', 'Pablo N.',  'Chamberí', 40.4450, -3.6930, true,  4.7, 18, 'mint'),
  ('00000000-0000-4000-8000-000000000019', 'Elena F.',  'Chamberí', 40.4300, -3.7050, true,  4.9,  6, 'lavender'),
  ('00000000-0000-4000-8000-000000000020', 'Diego A.',  'Chamberí', 40.4320, -3.7060, true,  4.8, 11, 'peach'),
  ('00000000-0000-4000-8000-000000000021', 'Nuria B.',  'Chamberí', 40.4270, -3.7030, false, 5.0,  4, 'butter'),
  ('00000000-0000-4000-8000-000000000022', 'Carmen',    'Chamberí', 40.4360, -3.7080, true,  4.9,  8, 'sky'),
  ('00000000-0000-4000-8000-000000000023', 'Íñigo',     'Chamberí', 40.4330, -3.6990, true,  4.8,  5, 'mint')
on conflict (id) do nothing;

insert into public.babies (profile_id, name, birth_date)
values ('00000000-0000-4000-8000-000000000001', 'Lucía', '2026-06-12');

-- ------------------------------------------------------------
-- Anuncios: la posición se calcula a partir de la distancia y un ángulo desde Chamberí
-- ------------------------------------------------------------
with src (id, seller, title, description, section, subcategory, spec_value, stages, condition, usage, includes,
          is_complete, hygiene, price, new_price, lot_count, meeting_point, dist_km, angle_deg) as (values
  (1, '00000000-0000-4000-8000-000000000011'::uuid, 'Bañera plegable con hamaca',
   'La usamos solo el primer mes porque pasamos a la bañera grande. Plegada cabe detrás de una puerta. Incluye la hamaca de baño para recién nacido.',
   'Baño y cambio', 'Bañeras', 'Plegable', array['0-3','3-6','6-12'], 'Como nuevo', 'Usada 1 mes', 'Hamaca de baño, tapón y manual',
   true, array['Lavada y desinfectada','Casa sin humo'], 25, 45, null::int, 'Plaza de Olavide', 0.8, 150),
  (2, '00000000-0000-4000-8000-000000000012'::uuid, 'Minicuna colecho de madera',
   'De haya, con laterales de malla transpirable y correa de sujeción a la cama. Por higiene, la vendo con un colchón nuevo sin estrenar.',
   'Dormir', 'Cunas y minicunas', 'Colchón nuevo', array['0-3','3-6'], 'Buen estado', 'Usada 5 meses', 'Kit de colecho, bolsa y manual. Colchón nuevo',
   true, array['Funda lavada','Colchón nuevo'], 90, 189, null, 'Metro Iglesia', 1.5, 60),
  (3, '00000000-0000-4000-8000-000000000013'::uuid, 'Lote 22 prendas recién nacido',
   'Colores neutros, varias prendas con etiqueta. Todo de la misma talla.',
   'Ropa y calzado', 'Bodies y pijamas', '56', array['0-3'], 'Como nuevo', 'Lote', 'Bodies, pijamas, chaquetas de punto, gorro, patucos y albornoz · talla 56 cm',
   true, array['Lavada','Casa sin mascotas'], 30, null, 22, 'Mercado de Chamberí', 2.1, 20),
  (4, '00000000-0000-4000-8000-000000000014'::uuid, 'Trona evolutiva de madera con baby set',
   'Algún arañazo leve en la base, todo funciona perfecto.',
   'Comida', 'Tronas', 'Evolutiva', array['6-12','12-24','24-48'], 'Buen estado', 'Usada 2 años', 'Baby set, bandeja y manual',
   true, array['Desinfectada'], 140, 259, null, 'Glorieta de Quevedo', 3.0, 300),
  (5, '00000000-0000-4000-8000-000000000015'::uuid, 'Mochila portabebés ergonómica',
   'Ergonómica desde recién nacido sin cojín reductor.',
   'Paseo y viaje', 'Portabebés y fulares', 'Una mano', array['0-3','3-6','6-12','12-24'], 'Como nuevo', 'Usada 3 meses', 'Completa, con manual',
   true, array['Lavada','Casa sin humo'], 70, 179, null, 'Plaza de Chamberí', 1.1, 90),
  (6, '00000000-0000-4000-8000-000000000016'::uuid, 'Hamaca balancín con base de madera',
   'Se mece con el movimiento del bebé, sin pilas. Funda de algodón desenfundable.',
   'Juego', 'Hamacas y balancines', '0-6 m', array['0-3','3-6','6-12'], 'Buen estado', 'Usada 8 meses', 'Completa, sin manual',
   false, array['Funda lavada'], 75, 189, null, 'Metro Bilbao', 4.2, 200),
  (7, '00000000-0000-4000-8000-000000000011'::uuid, '8 packs de toallitas Huggies Natural Care',
   'Compramos de más antes de nacer y nos han sobrado. Todos sin abrir.',
   'Baño y cambio', 'Higiene nueva', 'Precintado', array['0-3','3-6','6-12','12-24'], 'Nuevo precintado', 'Sin abrir', '8 packs ahorro precintados (4 × 128 toallitas cada uno)',
   true, array['Precintado'], 25, 40, null, 'Plaza de Olavide', 0.6, 160),
  (8, '00000000-0000-4000-8000-000000000017'::uuid, '5 bodies estampados 3-6 meses',
   'Algodón, dos de manga larga y tres de manga corta. Estampados de bosque, flores y rayas.',
   'Ropa y calzado', 'Bodies y pijamas', '68', array['3-6'], 'Como nuevo', 'Lote', '5 bodies · talla 68 cm',
   true, array['Lavada'], 10, null, 5, 'Calle Fuencarral', 1.9, 170),
  (9, '00000000-0000-4000-8000-000000000018'::uuid, 'Silla de paseo ligera plegable',
   'Se pliega con una mano y cabe en cabina de avión.',
   'Paseo y viaje', 'Carritos y sillas de paseo', 'Cabe en cabina', array['6-12','12-24','24-48'], 'Buen estado', 'Usada 1 año', 'Burbuja de lluvia y manual',
   true, array['Tapicería lavada'], 180, 349, null, 'Nuevos Ministerios', 6.8, 40),
  (10, '00000000-0000-4000-8000-000000000019'::uuid, 'Cómoda blanca con cambiador',
   'Seis cajones amplios y bandeja cambiador desmontable. Se entrega montada; cabe en un coche grande con los asientos bajados.',
   'Habitación', 'Cómodas y cambiadores', 'Blanco lacado', array['0-3','3-6','6-12','12-24','24-48'], 'Buen estado', 'Usada 2 años', 'Tablero cambiador y manual de montaje',
   true, array['Limpia'], 45, 129, null, 'Plaza de Olavide', 2.6, 230),
  (11, '00000000-0000-4000-8000-000000000020'::uuid, 'Barrera de seguridad extensible',
   'De 76 a 82 cm, ampliable hasta 89 cm con las extensiones. Sin taladrar.',
   'Seguridad en casa', 'Barreras', '76-90 cm', array['6-12','12-24','24-48'], 'Como nuevo', 'Usada 6 meses', '2 extensiones de 7 cm y anclajes',
   true, array['Limpia'], 20, 49, null, 'Metro Quevedo', 1.4, 280),
  (12, '00000000-0000-4000-8000-000000000021'::uuid, 'Gimnasio de madera con alfombra',
   'Alfombra acolchada lavable a máquina. Juguetes desmontables.',
   'Juego', 'Gimnasios y alfombras', '0-6 m', array['0-3','3-6'], 'Como nuevo', 'Usado 4 meses', 'Arco de madera, alfombra acolchada, 3 colgantes y libro de tela',
   true, array['Alfombra lavada','Casa sin humo'], 22, 60, null, 'Calle Fuencarral', 2.3, 185)
)
insert into public.listings (id, seller_id, title, description, section, subcategory, spec_value, stages, condition, usage,
  includes, is_complete, hygiene, price, new_price, lot_count, meeting_point, status, lat, lng)
select id, seller, title, description, section, subcategory, spec_value, stages, condition, usage,
  includes, is_complete, hygiene, price, new_price, lot_count, meeting_point, 'live',
  40.4340 + (dist_km / 111.32) * cos(radians(angle_deg)),
  -3.7040 + (dist_km / (111.32 * cos(radians(40.4340)))) * sin(radians(angle_deg))
from src
on conflict (id) do nothing;

-- Anuncios de Laura (aparecen en su perfil)
insert into public.listings (id, seller_id, title, section, subcategory, spec_value, stages, condition, usage, price, lot_count, status, lat, lng, meeting_point) values
  (13, '00000000-0000-4000-8000-000000000001', 'Lote 18 prendas niña 0-3 meses', 'Ropa y calzado', 'Bodies y pijamas', '56', array['0-3'], 'Como nuevo', 'Lote', 28, 18, 'reserved', 40.4340, -3.7040, 'Plaza de Chamberí'),
  (14, '00000000-0000-4000-8000-000000000001', 'Capazo Joolz Day+', 'Paseo y viaje', 'Capazos', null, array['0-3','3-6'], 'Buen estado', 'Usado 6 meses', 120, null, 'sold', 40.4340, -3.7040, 'Plaza de Chamberí'),
  (15, '00000000-0000-4000-8000-000000000001', 'Cojín de lactancia', 'Dormir', 'Sacos y ropa de cuna', null, array['0-3'], 'Buen estado', 'Usado 4 meses', 15, null, 'sold', 40.4340, -3.7040, 'Plaza de Chamberí')
on conflict (id) do nothing;

-- Los próximos anuncios empiezan después de los de ejemplo.
select setval(pg_get_serial_sequence('public.listings', 'id'), (select max(id) from public.listings));

-- ------------------------------------------------------------
-- Fotos (bucket listing-photos, carpeta seed/)
-- ------------------------------------------------------------
insert into public.listing_photos (listing_id, path, position) values
  (1, 'seed/banera.jpg', 0), (2, 'seed/minicuna.jpg', 0), (3, 'seed/lote-ropa.jpg', 0),
  (4, 'seed/trona.jpg', 0), (5, 'seed/mochila.jpg', 0), (6, 'seed/hamaca.jpg', 0),
  (7, 'seed/toallitas.jpg', 0), (8, 'seed/bodies.jpg', 0), (9, 'seed/silla-paseo.jpg', 0),
  (10, 'seed/comoda.jpg', 0), (11, 'seed/barrera.jpg', 0), (12, 'seed/gimnasio.jpg', 0),
  (13, 'seed/lote-ropa.jpg', 0);

-- ------------------------------------------------------------
-- Valoraciones de Laura
-- ------------------------------------------------------------
insert into public.reviews (author_id, target_id, stars, text, created_at) values
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000001', 5,
   'La cuna estaba impecable y Laura fue puntualísima. Repetiría.', now() - interval '14 days'),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000001', 5,
   'Todo tal cual en las fotos. Muy fácil quedar en la plaza.', now() - interval '1 month');

-- El trigger recalcula la media con las 2 reseñas; se restaura el historial del prototipo.
update public.profiles set rating_avg = 5.0, rating_count = 11 where id = '00000000-0000-4000-8000-000000000001';
