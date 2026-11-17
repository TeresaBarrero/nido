import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SectionName, StageKey } from '../data/catalog';
import { supabase } from '../data/supabase';
import { useAuth } from './Auth';

// Estado compartido: filtros de búsqueda (en memoria), avisos (toast) y, desde Supabase,
// favoritos, alertas y notificaciones de la persona con sesión.

export interface Filters {
  q: string;
  stage: StageKey | null;
  dist: number;
  section: SectionName | null;
  sub: string | null;
  spec: string | null;
  onlyNew: boolean;
  lots: boolean;
  verified: boolean;
}

export const freshFilters = (o: Partial<Filters> = {}): Filters => ({
  q: '', stage: null, dist: 5, section: null, sub: null, spec: null, onlyNew: false, lots: false, verified: false, ...o,
});

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface AppState {
  favorites: Set<number>;
  toggleFavorite: (id: number) => boolean;

  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;

  alerts: Set<string>;
  toggleAlert: (key: string, filters: Filters) => boolean;

  notifications: Notification[];
  unreadCount: number;
  markNotificationsRead: (id?: string) => void;

  toast: (msg: string) => void;
  toastMessage: string | null;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set());
  const [filters, setFilters] = useState<Filters>(() => freshFilters({ stage: '3-6' }));
  const [alerts, setAlerts] = useState<Map<string, string>>(() => new Map()); // clave → id
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);

  // Carga los datos personales al iniciar sesión y escucha notificaciones nuevas.
  useEffect(() => {
    setFavorites(new Set());
    setAlerts(new Map());
    setNotifications([]);
    if (!userId) return;
    let alive = true;

    (async () => {
      const [fav, al, no] = await Promise.all([
        supabase.from('favorites').select('listing_id').eq('profile_id', userId),
        supabase.from('alerts').select('id,filters').eq('profile_id', userId),
        supabase.from('notifications').select('*').eq('profile_id', userId).order('created_at', { ascending: false }).limit(50),
      ]);
      if (!alive) return;
      setFavorites(new Set((fav.data ?? []).map((r) => r.listing_id as number)));
      setAlerts(new Map((al.data ?? []).map((r) => [(r.filters as { key: string }).key, r.id as string])));
      setNotifications((no.data as Notification[]) ?? []);
    })();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${userId}` },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev]))
      .subscribe();

    return () => { alive = false; supabase.removeChannel(channel); };
  }, [userId]);

  const toggleFavorite = useCallback((id: number) => {
    if (!userId) return false;
    const added = !favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (added) next.add(id); else next.delete(id);
      return next;
    });
    const req = added
      ? supabase.from('favorites').insert({ profile_id: userId, listing_id: id })
      : supabase.from('favorites').delete().eq('profile_id', userId).eq('listing_id', id);
    req.then(({ error }) => {
      if (!error) return;
      // Si falla, se deshace el cambio.
      setFavorites((prev) => {
        const next = new Set(prev);
        if (added) next.delete(id); else next.add(id);
        return next;
      });
      toast('No se ha podido guardar. Revisa tu conexión.');
    });
    return added;
  }, [favorites, userId, toast]);

  const toggleAlert = useCallback((key: string, f: Filters) => {
    if (!userId) return false;
    const existing = alerts.get(key);
    if (existing) {
      setAlerts((prev) => { const n = new Map(prev); n.delete(key); return n; });
      supabase.from('alerts').delete().eq('id', existing).then();
      return false;
    }
    setAlerts((prev) => new Map(prev).set(key, 'pending'));
    supabase.from('alerts').insert({ profile_id: userId, filters: { key, ...f } }).select('id').single()
      .then(({ data, error }) => {
        if (error) {
          setAlerts((prev) => { const n = new Map(prev); n.delete(key); return n; });
          toast('No se ha podido crear la alerta.');
        } else {
          setAlerts((prev) => new Map(prev).set(key, data.id as string));
        }
      });
    return true;
  }, [alerts, userId, toast]);

  const markNotificationsRead = useCallback((id?: string) => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => (!id || n.id === id ? { ...n, read: true } : n)));
    const q = supabase.from('notifications').update({ read: true }).eq('profile_id', userId).eq('read', false);
    (id ? q.eq('id', id) : q).then();
  }, [userId]);

  const value = useMemo<AppState>(() => ({
    favorites, toggleFavorite,
    filters, setFilters,
    alerts: new Set(alerts.keys()), toggleAlert,
    notifications, unreadCount: notifications.filter((n) => !n.read).length, markNotificationsRead,
    toast, toastMessage,
  }), [favorites, toggleFavorite, filters, alerts, toggleAlert, notifications, markNotificationsRead, toast, toastMessage]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp debe usarse dentro de AppStateProvider');
  return v;
}
