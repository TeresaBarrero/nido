import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SectionName, StageKey } from '../data/catalog';

// Estado de la demo (fase 1). Vive en memoria; en la fase 2 lo sustituirá Supabase.

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

export interface ChatState {
  accepted: boolean;
  sent: string[];
}

export type MyListingStatus = 'none' | 'live' | 'paused';

interface AppState {
  onboarded: boolean;
  completeOnboarding: () => void;
  resetDemo: () => void;

  favorites: Set<number>;
  toggleFavorite: (id: number) => boolean;

  notificationsRead: boolean;
  markNotificationsRead: () => void;

  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;

  alerts: Set<string>;
  toggleAlert: (key: string) => boolean;

  chat: (productId: number) => ChatState;
  sendMessage: (productId: number, text: string) => void;
  acceptMeeting: (productId: number) => void;

  myListing: MyListingStatus;
  setMyListing: (s: MyListingStatus) => void;

  toast: (msg: string) => void;
  toastMessage: string | null;
}

const Ctx = createContext<AppState | null>(null);
const ONBOARDED_KEY = 'nido.onboarded';

function readOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(readOnboarded);
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set([4]));
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => freshFilters({ stage: '3-6' }));
  const [alerts, setAlerts] = useState<Set<string>>(() => new Set());
  const [chats, setChats] = useState<Record<number, ChatState>>({});
  const [myListing, setMyListing] = useState<MyListingStatus>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2300);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
    try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch { /* sin almacenamiento: no pasa nada */ }
  }, []);

  const resetDemo = useCallback(() => {
    try { localStorage.removeItem(ONBOARDED_KEY); } catch { /* idem */ }
    setOnboarded(false);
    setFavorites(new Set([4]));
    setNotificationsRead(false);
    setFilters(freshFilters({ stage: '3-6' }));
    setAlerts(new Set());
    setChats({});
    setMyListing('none');
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const added = !favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (added) next.add(id); else next.delete(id);
      return next;
    });
    return added;
  }, [favorites]);

  const toggleAlert = useCallback((key: string) => {
    const added = !alerts.has(key);
    setAlerts((prev) => {
      const next = new Set(prev);
      if (added) next.add(key); else next.delete(key);
      return next;
    });
    return added;
  }, [alerts]);

  const chat = useCallback((id: number) => chats[id] ?? { accepted: false, sent: [] }, [chats]);
  const sendMessage = useCallback((id: number, text: string) => {
    setChats((prev) => {
      const c = prev[id] ?? { accepted: false, sent: [] };
      return { ...prev, [id]: { ...c, sent: [...c.sent, text] } };
    });
  }, []);
  const acceptMeeting = useCallback((id: number) => {
    setChats((prev) => {
      const c = prev[id] ?? { accepted: false, sent: [] };
      return { ...prev, [id]: { ...c, accepted: true } };
    });
  }, []);

  const value = useMemo<AppState>(() => ({
    onboarded, completeOnboarding, resetDemo,
    favorites, toggleFavorite,
    notificationsRead, markNotificationsRead: () => setNotificationsRead(true),
    filters, setFilters,
    alerts, toggleAlert,
    chat, sendMessage, acceptMeeting,
    myListing, setMyListing,
    toast, toastMessage,
  }), [onboarded, completeOnboarding, resetDemo, favorites, toggleFavorite, notificationsRead, filters, alerts, toggleAlert, chat, sendMessage, acceptMeeting, myListing, toast, toastMessage]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp debe usarse dentro de AppStateProvider');
  return v;
}
