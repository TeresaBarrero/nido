/** 25 € · 1.250 € */
export const euros = (n: number) => n.toLocaleString('es-ES') + ' €';

/** 1,25 € (siempre con dos decimales) */
export const eurosCents = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/** 0,8 km */
export const km = (d: number) => d.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' km';

/** 4,9 */
export const rating = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const initials = (name: string) => name.split(' ').map((w) => w[0]).join('');
export const firstName = (name: string) => name.split(' ')[0];

/** Protección Nido: 5 % del precio, mínimo 0,50 €. */
export const protectionFee = (price: number) => Math.max(0.5, Math.round(price * 0.05 * 100) / 100);
