import { lazy, Suspense, useEffect } from 'react';
import useActiveFestival from './useActiveFestival';

// One lazy component per festival, so festival code only downloads while it is active.
const lazyCache = new Map();
function getLazyComponent(festival) {
  if (typeof festival.load !== 'function') return null;
  if (!lazyCache.has(festival.id)) lazyCache.set(festival.id, lazy(festival.load));
  return lazyCache.get(festival.id);
}

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
