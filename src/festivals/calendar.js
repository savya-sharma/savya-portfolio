// Festival registry. Each window is [start, end): start inclusive, end exclusive.
// Boundaries must be ISO 8601 with an explicit UTC offset so they resolve to the
// same instant for every visitor, regardless of their browser timezone.
export const FESTIVALS = [
  {
    id: 'halloween',
    // Asia/Kolkata (IST, UTC+05:30, no DST)
    start: '2026-10-30T18:00:00+05:30',
    end: '2026-11-01T00:00:00+05:30',
    load: () => import('./halloween/HalloweenLayer.jsx'),
  },
];
