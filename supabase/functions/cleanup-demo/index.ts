// Nido · limpieza diaria de la demo
// La llama pg_cron (migración 20261119000000_demo_isolation.sql) con la cabecera x-cleanup-secret.
// 1) Pide las cuentas de invitada de más de 48 h, 2) borra su carpeta del bucket listing-photos
// con la API de Storage y 3) borra la cuenta y todo lo suyo. Si fallan las fotos de una cuenta,
// esa cuenta se queda para el día siguiente.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'listing-photos';
const PAGE = 1000;

async function listFolder(admin: SupabaseClient, prefix: string): Promise<string[]> {
  const paths: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: PAGE, offset });
    if (error) throw error;
    for (const item of data) {
      const path = `${prefix}/${item.name}`;
      // Las carpetas vienen sin id: se recorren también.
      if (item.id) paths.push(path);
      else paths.push(...(await listFolder(admin, path)));
    }
    if (data.length < PAGE) return paths;
  }
}

async function removeFolder(admin: SupabaseClient, userId: string) {
  const paths = await listFolder(admin, userId);
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from(BUCKET).remove(paths.slice(i, i + 100));
    if (error) throw error;
  }
  return paths.length;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('CLEANUP_SECRET');
  if (!secret || req.headers.get('x-cleanup-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: ids, error } = await admin.rpc('expired_demo_accounts', { p_limit: 200 });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const ready: string[] = [];
  let photos = 0;
  let failed = 0;
  for (const id of (ids ?? []) as string[]) {
    try {
      photos += await removeFolder(admin, id);
      ready.push(id);
    } catch (e) {
      failed++;
      console.error('cleanup-demo: fotos de', id, e);
    }
  }

  let purged = 0;
  if (ready.length) {
    const { data, error: e } = await admin.rpc('purge_demo_accounts', { p_ids: ready });
    if (e) return Response.json({ error: e.message, photos }, { status: 500 });
    purged = data as number;
  }

  const result = { found: ids?.length ?? 0, purged, photos, failed };
  console.log('cleanup-demo', result);
  return Response.json(result);
});
