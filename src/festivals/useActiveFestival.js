import { useEffect, useState } from 'react';
import { FESTIVALS } from './calendar';
import {
  findFestival,
  getActiveFestival,
  getInvalidFestivals,
  getNextBoundary,
  parseInstant,
} from './selectFestival';

// setTimeout overflows above ~24.8 days, so long waits are re-checked in chunks.
const MAX_TIMEOUT = 2 ** 31 - 1;

// Dev-only preview, stripped from production builds:
//   ?festival=halloween   force a festival on
//   ?festival=none        force all festivals off
//   ?festivalAt=2026-10-31T12:00:00+05:30   evaluate the schedule at this instant
function readDevOverride() {
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('festival');
  const at = params.get('festivalAt');

  if (id === 'none') return { festival: null };
  if (id) {
    const festival = findFestival(FESTIVALS, id);
    if (!festival) console.warn(`[festival] Unknown preview id "${id}"`);
    return { festival };
  }
  if (at) {
    const now = parseInstant(at);
    if (Number.isNaN(now)) {
      console.warn(`[festival] Invalid festivalAt "${at}", needs an ISO date with offset`);
      return null;
    }
    return { festival: getActiveFestival(FESTIVALS, now) };
  }
  return null;
}

function resolve() {
  const override = readDevOverride();
  if (override) return override.festival;
  return getActiveFestival(FESTIVALS, Date.now());
}

export default function useActiveFestival() {
  const [festival, setFestival] = useState(resolve);

  useEffect(() => {
    if (import.meta.env.DEV) {
      getInvalidFestivals(FESTIVALS).forEach((f) =>
        console.warn('[festival] Ignoring invalid config', f),
      );
    }
    if (readDevOverride()) return;

    let timer;
    const schedule = () => {
      setFestival(getActiveFestival(FESTIVALS, Date.now()));
      const next = getNextBoundary(FESTIVALS, Date.now());
      if (next === null) return;
      timer = setTimeout(schedule, Math.min(next - Date.now() + 50, MAX_TIMEOUT));
    };
    schedule();

    // Timers are throttled in background tabs; re-check when the tab returns.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return festival;
}
