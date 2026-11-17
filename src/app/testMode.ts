// Modo prueba para testers: 3 tareas guiadas y un cuestionario al final.
// El progreso se guarda en este navegador (localStorage); las respuestas, en Supabase.
import { useEffect, useState } from 'react';

export type TaskKey = 'publish' | 'find' | 'reserve';

export const TASKS: { key: TaskKey; label: string; hint: string; to: string }[] = [
  { key: 'publish', label: 'Publica la bañera', hint: 'Vender · añade una foto y rellena la ficha', to: '/vender' },
  { key: 'find', label: 'Encuentra algo para un bebé de 6 meses a menos de 5 km', hint: 'Buscar · filtra por etapa y distancia', to: '/buscar' },
  { key: 'reserve', label: 'Reserva y paga un artículo', hint: 'Chatea, acepta la quedada y paga (simulado)', to: '/' },
];

interface TestState { done: TaskKey[]; hidden: boolean; answered: boolean }

const EVENT = 'nido:test-mode';
const key = (userId: string) => `nido.test.${userId}`;

function read(userId: string | null): TestState {
  const empty = { done: [], hidden: false, answered: false };
  if (!userId) return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(key(userId)) ?? '{}') };
  } catch {
    return empty;
  }
}

function write(userId: string, patch: Partial<TestState>) {
  try {
    localStorage.setItem(key(userId), JSON.stringify({ ...read(userId), ...patch }));
  } catch { /* sin almacenamiento: el modo prueba sigue funcionando en memoria */ }
  window.dispatchEvent(new Event(EVENT));
}

export function completeTask(userId: string | null, task: TaskKey) {
  if (!userId) return;
  const s = read(userId);
  if (!s.done.includes(task)) write(userId, { done: [...s.done, task] });
}

export function useTestMode(userId: string | null) {
  const [state, setState] = useState(() => read(userId));
  useEffect(() => {
    const sync = () => setState(read(userId));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [userId]);

  return {
    ...state,
    allDone: TASKS.every((t) => state.done.includes(t.key)),
    hide: () => userId && write(userId, { hidden: true }),
    show: () => userId && write(userId, { hidden: false }),
    markAnswered: () => userId && write(userId, { answered: true, hidden: true }),
  };
}
