import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError, readEnvelope } from './envelope.ts';
import { labFeed } from './format.ts';
import { appRoute } from './routes.ts';

test('readEnvelope returns data and turns an error envelope into ApiError', () => {
  assert.deepEqual(readEnvelope(200, { data: { ok: 1 }, meta: {} }), { ok: 1 });
  assert.throws(
    () =>
      readEnvelope(404, {
        error: { code: 'not_found', message: 'Not found.' },
      }),
    (error: unknown) =>
      error instanceof ApiError &&
      error.code === 'not_found' &&
      error.status === 404 &&
      error.message === 'Not found.',
  );
  assert.throws(
    () => readEnvelope(502, null),
    (error: unknown) => error instanceof ApiError && error.code === 'server_error',
  );
});

test('appRoute maps website paths to app screens and leaves the rest to the browser', () => {
  assert.equal(appRoute('/projects/p1'), '/project/p1');
  assert.equal(appRoute('/research/areas/computer-vision'), '/area/computer-vision');
  assert.equal(appRoute('/research/perception'), '/theme/perception');
  assert.equal(appRoute('/people/a?x=1'), '/person/a');
  assert.equal(appRoute('/join'), null);
  assert.equal(appRoute('/research'), null);
});

test('labFeed merges news and project updates, newest first', () => {
  const feed = labFeed({
    news: [{ slug: 'n1', title: 'Lab opens', category: 'ANNOUNCEMENT', date: '2026-10-01T00:00:00.000Z' }],
    updates: [
      {
        id: 'u1',
        title: 'Pilot done',
        summary: 'Agreement is where we hoped.',
        postedAt: '2026-10-05T00:00:00.000Z',
        project: { slug: 'p1', title: 'Discourse markers' },
      },
    ],
  });
  assert.deepEqual(
    feed.map((item) => [item.key, item.meta]),
    [
      ['update:u1', 'Discourse markers · 5 Oct 2026'],
      ['news:n1', 'Announcement · 1 Oct 2026'],
    ],
  );
});
