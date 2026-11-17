import type { CSSProperties } from 'react';

// Ilustraciones de línea de las secciones (120 × 120).
const ART = {
  bath: '<path d="M14 50h92c0 26-18 40-46 40S14 76 14 50z"/><path d="M30 90l-6 14M90 90l6 14"/><path d="M10 50h100"/><circle cx="44" cy="38" r="6"/><circle cx="60" cy="30" r="4"/><circle cx="74" cy="40" r="7"/>',
  crib: '<rect x="16" y="30" width="88" height="56" rx="8"/><path d="M30 30v56M44 30v56M58 30v56M72 30v56M86 30v56"/><path d="M16 86v16M104 86v16"/><path d="M16 60h88"/>',
  clothes: '<path d="M40 22l-22 12 8 18 10-5v51h48V47l10 5 8-18-22-12c-2 8-8 12-20 12s-18-4-20-12z"/><path d="M48 70h24"/>',
  highchair: '<path d="M38 16h44v40H38z"/><path d="M30 56h60"/><path d="M40 56l-12 50M80 56l12 50M34 84h52"/><path d="M50 36h20"/>',
  carrier: '<path d="M38 24c0-6 10-10 22-10s22 4 22 10v42c0 14-10 24-22 24S38 80 38 66z"/><path d="M38 30L22 44M82 30l16 14"/><path d="M46 52h28"/><path d="M50 90l-4 16M70 90l4 16"/>',
  bouncer: '<path d="M18 72c18 10 66 10 84 0"/><path d="M26 74l20-40c6-10 22-10 30 0l18 36"/><path d="M12 100c30-10 66-10 96 0"/><path d="M60 26v-8M52 18h16"/>',
  wipes: '<rect x="16" y="34" width="88" height="58" rx="16"/><ellipse cx="60" cy="54" rx="22" ry="9"/><path d="M50 52c6-8 14-8 20 0"/><path d="M30 78h60"/>',
  bodies: '<path d="M42 20h36l14 14-10 10-6-6v42l-10 14h-6l-6-10-6 10h-6l-10-14V38l-6 6-10-10z"/><path d="M60 30v10"/>',
  stroller: '<path d="M26 26c0 22 14 34 40 34h30c0-22-18-40-42-40"/><path d="M54 20v40"/><circle cx="36" cy="94" r="10"/><circle cx="88" cy="94" r="10"/><path d="M36 84l8-24M88 84l-8-24M96 60l10-18"/>',
  carseat: '<path d="M40 18c-8 0-12 6-12 14v34c0 14 10 24 24 24h30c8 0 14-6 14-14V70H62V32c0-8-6-14-14-14z"/><path d="M40 40v26M28 104h76M40 90l-6 14M86 90l6 14"/>',
  dresser: '<rect x="20" y="30" width="80" height="62" rx="8"/><path d="M20 52h80M20 72h80"/><path d="M52 41h16M52 62h16M52 82h16"/><path d="M28 92v12M92 92v12"/><path d="M26 30c4-10 64-10 68 0"/>',
  gate: '<rect x="18" y="26" width="84" height="74" rx="8"/><path d="M34 26v74M50 26v74M66 26v74M82 26v74"/><path d="M18 48h84"/><circle cx="96" cy="62" r="3"/>',
  gym: '<path d="M14 98h92"/><path d="M24 98c0-46 72-46 72 0"/><path d="M44 62v14M60 54v18M76 62v14"/><circle cx="44" cy="80" r="5"/><circle cx="60" cy="76" r="5"/><circle cx="76" cy="80" r="5"/>',
} as const;

export type ArtKey = keyof typeof ART;

export function Art({ name, color, className, style }: { name: ArtKey; color: string; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: ART[name] }}
    />
  );
}
