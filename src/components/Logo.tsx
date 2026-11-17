/** Logo de Nido: un nido con dos huevos. */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" className={className} style={{ flex: 'none' }}>
      <path d="M4 16c0 7 5.4 11 12 11s12-4 12-11z" fill="#4E6E9E" />
      <path
        d="M6.5 19.5c3 1.4 6 2 9.5 2s6.5-.6 9.5-2M8 23.5c2.4 1 5 1.4 8 1.4s5.6-.4 8-1.4"
        stroke="#DCEBF8" strokeWidth="1.6" strokeLinecap="round"
      />
      <ellipse cx="12.5" cy="12.5" rx="4" ry="4.8" fill="#F2A69B" />
      <ellipse cx="19.5" cy="12" rx="4" ry="5.2" fill="#FDE4D8" stroke="#F2A69B" strokeWidth="1.4" />
      <path d="M3 16h26" stroke="#4E6E9E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
