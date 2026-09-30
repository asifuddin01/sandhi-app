import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError, readEnvelope } from './envelope.ts';
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
