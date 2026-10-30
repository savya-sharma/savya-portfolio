// Requires an explicit offset (Z or ±HH:MM). Without one, Date.parse would
// silently fall back to the visitor's local timezone.
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export function parseInstant(value) {
  if (typeof value !== 'string' || !ISO_WITH_OFFSET.test(value)) return NaN;
  return Date.parse(value);
}

function toWindow(festival) {
  if (!festival || typeof festival.id !== 'string') return null;
  const start = parseInstant(festival.start);
  const end = parseInstant(festival.end);
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) return null;
  return { festival, start, end };
}

function validWindows(festivals) {
  if (!Array.isArray(festivals)) return [];
  return festivals.map(toWindow).filter(Boolean);
}

export function getActiveFestival(festivals, now) {
  if (!Number.isFinite(now)) return null;
  const match = validWindows(festivals).find(({ start, end }) => now >= start && now < end);
  return match ? match.festival : null;
}

// Next start/end boundary after `now`, so an open tab can switch on time.
export function getNextBoundary(festivals, now) {
  if (!Number.isFinite(now)) return null;
  const upcoming = validWindows(festivals)
    .flatMap(({ start, end }) => [start, end])
    .filter((t) => t > now);
  return upcoming.length ? Math.min(...upcoming) : null;
}

export function findFestival(festivals, id) {
  if (!Array.isArray(festivals)) return null;
  return festivals.find((f) => f && f.id === id) || null;
}

export function getInvalidFestivals(festivals) {
  if (!Array.isArray(festivals)) return [];
  return festivals.filter((f) => !toWindow(f));
}
