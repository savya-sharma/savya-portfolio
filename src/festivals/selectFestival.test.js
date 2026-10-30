import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FESTIVALS } from './calendar.js';
import { getActiveFestival, getNextBoundary, parseInstant } from './selectFestival.js';

const activeAt = (iso) => getActiveFestival(FESTIVALS, parseInstant(iso))?.id ?? null;

test('Halloween IST boundaries', () => {
  assert.equal(activeAt('2026-10-30T18:09:59+05:30'), null);
  assert.equal(activeAt('2026-10-30T18:10:00+05:30'), 'halloween');
  assert.equal(activeAt('2026-10-31T23:59:59+05:30'), 'halloween');
  assert.equal(activeAt('2026-11-01T00:00:00+05:30'), null);
});

test('same instants expressed in other timezones', () => {
  assert.equal(activeAt('2026-10-30T12:39:59Z'), null);
  assert.equal(activeAt('2026-10-30T12:40:00Z'), 'halloween');
  assert.equal(activeAt('2026-10-30T08:40:00-04:00'), 'halloween'); // New York
  assert.equal(activeAt('2026-10-31T18:30:00Z'), null);
});

test('next boundary lets an open tab switch on time', () => {
  assert.equal(
    getNextBoundary(FESTIVALS, parseInstant('2026-10-30T16:00:00+05:30')),
    parseInstant('2026-10-30T18:10:00+05:30'),
  );
  assert.equal(
    getNextBoundary(FESTIVALS, parseInstant('2026-10-31T20:00:00+05:30')),
    parseInstant('2026-11-01T00:00:00+05:30'),
  );
  assert.equal(getNextBoundary(FESTIVALS, parseInstant('2026-11-02T00:00:00+05:30')), null);
});

test('invalid and missing configuration is ignored safely', () => {
  const now = parseInstant('2026-10-31T12:00:00+05:30');
  const bad = [
    null,
    {},
    { id: 'no-offset', start: '2026-10-30T17:00:00', end: '2026-11-01T00:00:00' },
    { id: 'garbage', start: 'tomorrow', end: 'later' },
    { id: 'reversed', start: '2026-11-01T00:00:00+05:30', end: '2026-10-30T17:00:00+05:30' },
  ];
  assert.equal(getActiveFestival(bad, now), null);
  assert.equal(getActiveFestival(undefined, now), null);
  assert.equal(getActiveFestival(FESTIVALS, NaN), null);
  assert.equal(getActiveFestival([...bad, ...FESTIVALS], now)?.id, 'halloween');
});
