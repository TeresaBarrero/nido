import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con las claves públicas de .env.local.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local');
}

export const supabase = createClient(url, key);

/** URL pública de una foto del bucket de anuncios. */
export const photoUrl = (path: string) => supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
