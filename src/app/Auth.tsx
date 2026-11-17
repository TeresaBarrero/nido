import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Tone } from '../data/catalog';
import { setHomePoint } from '../data/listings';
import { supabase } from '../data/supabase';

// Sesión de Supabase (correo con enlace mágico o invitada de la demo), perfil y bebé.

export interface Profile {
  id: string;
  name: string;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  rating_avg: number;
  rating_count: number;
  tone: Tone;
  onboarded: boolean;
}

export interface Baby {
  id: string;
  name: string | null;
  birth_date: string;
}

interface AuthState {
  /** undefined mientras se comprueba si hay sesión. */
  session: Session | null | undefined;
  userId: string | null;
  profile: Profile | null;
  baby: Baby | null;
  /** true si es una cuenta de invitada (modo demo). */
  isDemo: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  startDemo: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async (id: string) => {
    const [p, b] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('babies').select('id,name,birth_date').eq('profile_id', id).order('birth_date', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const prof = (p.data as Profile | null) ?? null;
    setProfile(prof);
    setBaby((b.data as Baby | null) ?? null);
    if (prof?.lat != null && prof.lng != null) setHomePoint({ lat: prof.lat, lng: prof.lng });
    setLoadedFor(id);
  }, []);

  useEffect(() => {
    if (userId) load(userId);
    else { setProfile(null); setBaby(null); setLoadedFor(null); }
  }, [userId, load]);

  const refresh = useCallback(async () => { if (userId) await load(userId); }, [userId, load]);

  const startDemo = useCallback(async () => {
    let id = userId;
    if (!id) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      id = data.user!.id;
    }
    const { error } = await supabase.rpc('setup_demo');
    if (error) throw error;
    await load(id);
  }, [userId, load]);

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(() => ({
    session,
    userId,
    profile,
    baby,
    isDemo: Boolean(session?.user.is_anonymous),
    ready: session !== undefined && (!userId || loadedFor === userId),
    refresh, startDemo, sendMagicLink, signOut,
  }), [session, userId, profile, baby, loadedFor, refresh, startDemo, sendMagicLink, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return v;
}

/** Mensaje de error comprensible a partir de un error de Supabase. */
export function errorMessage(e: unknown, fallback = 'Algo no ha ido bien. Inténtalo de nuevo.') {
  const msg = (e as { message?: string } | null)?.message ?? '';
  if (/rate limit|too many/i.test(msg)) return 'Has pedido demasiados enlaces seguidos. Espera unos minutos.';
  if (/network|fetch/i.test(msg)) return 'Sin conexión. Revisa internet y vuelve a intentarlo.';
  if (/[áéíóúñ¿]/i.test(msg)) return msg; // mensajes propios de Nido, ya en español
  return fallback;
}
