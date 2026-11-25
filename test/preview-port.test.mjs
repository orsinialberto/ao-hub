import test from 'node:test';
import assert from 'node:assert/strict';
import { PREVIEW_PORT } from '../scripts/lib/preview-port.mjs';

// fetch di Node applica la stessa lista di porte vietate dei browser (standard Fetch)
test('the preview port is one that browsers are allowed to open', async () => {
  let reason = '';
  try {
    await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`, { signal: AbortSignal.timeout(2000) });
  } catch (error) {
    reason = error.cause?.message ?? error.message;
  }
  assert.notEqual(reason, 'bad port', `port ${PREVIEW_PORT} is blocked by browsers`);
});
