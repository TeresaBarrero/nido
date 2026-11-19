import styles from './MiniMap.module.css';

// Mapa pequeño y estático de la zona aproximada de un anuncio.
// Usa las teselas de OpenStreetMap (sin librerías ni claves) suavizadas con CSS para que encajen con Nido.
// Nunca marca un punto exacto: un círculo de unos 350 m alrededor de una ubicación que ya se desplaza al publicar.
const ZOOM = 14;
const TILE = 256;
const tileUrl = (x: number, y: number) => `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`;

/** Posición en píxeles del punto dentro del mapa del mundo a este zoom. */
function worldPixel(lat: number, lng: number) {
  const n = TILE * 2 ** ZOOM;
  const r = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n,
  };
}

export function MiniMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const { x, y } = worldPixel(lat, lng);
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  // Metros por píxel a esta latitud, para que el círculo mida ~350 m de radio.
  const mPerPx = (156543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** ZOOM;
  const radius = Math.round(350 / mPerPx);

  const tiles = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      tiles.push(
        <img
          key={`${dx}:${dy}`} src={tileUrl(tx + dx, ty + dy)} alt="" loading="lazy" decoding="async" draggable={false}
          style={{ left: (tx + dx) * TILE - x, top: (ty + dy) * TILE - y }}
        />,
      );
    }
  }

  return (
    <div className={styles.map} role="img" aria-label={`Mapa de la zona aproximada. ${label}`}>
      <div className={styles.origin} aria-hidden="true">{tiles}</div>
      <span className={styles.zone} style={{ width: radius * 2, height: radius * 2 }} aria-hidden="true" />
      <span className={styles.label} aria-hidden="true">{label}</span>
      <a className={styles.credit} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        © OpenStreetMap
      </a>
    </div>
  );
}
