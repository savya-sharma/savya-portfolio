import { lazy, Suspense, useEffect } from 'react';
import useActiveFestival from './useActiveFestival';

// One lazy component per festival and slot, so festival code only downloads while it is active.
// Slots are loader functions on the festival entry: `load` (page layer), `loadLoader` (site loader).
const lazyCache = new Map();
function getLazyComponent(festival, slot = 'load') {
  if (typeof festival[slot] !== 'function') return null;
  const key = `${festival.id}:${slot}`;
  if (!lazyCache.has(key)) lazyCache.set(key, lazy(festival[slot]));
  return lazyCache.get(key);
}

// Festival decoration for the site Loader; renders nothing when no festival is active.
export const FestivalLoaderDecor = (props) => {
  const festival = useActiveFestival();
  const Component = festival && getLazyComponent(festival, 'loadLoader');
  if (!Component) return null;
  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  );
};

const FestivalLayer = () => {
  const festival = useActiveFestival();

  // Exposes the active festival for scoped CSS; removed so the default theme returns.
  useEffect(() => {
    if (!festival) return;
    document.documentElement.dataset.festival = festival.id;
    return () => {
      delete document.documentElement.dataset.festival;
    };
  }, [festival]);

  if (!festival) return null;
  const Component = getLazyComponent(festival);
  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
};

export default FestivalLayer;
