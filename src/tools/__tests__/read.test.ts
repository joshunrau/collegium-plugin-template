import { createTestContext } from '@collegium/sdk/testing';
import { describe, expect, it } from 'vitest';

import config from '../../config.ts';
import read from '../read.ts';

describe('example::read', () => {
  it('returns the body of a stored record', async () => {
    const context = createTestContext(config);
    await context.storage.records.put('greeting', { body: 'hello' });
    expect(await read.execute({ id: 'greeting' }, context)).toBe('hello');
  });

  it('reports a record that does not exist', async () => {
    const context = createTestContext(config);
    expect(await read.execute({ id: 'missing' }, context)).toBe('record "missing" not found');
  });

  it('lists every record under a header', async () => {
    const context = createTestContext(config, { settings: { maxRecords: 5 } });
    await context.storage.records.put('first', { body: 'one' });
    await context.storage.records.put('second', { body: 'two' });
    expect(await read.execute({}, context)).toBe('2/5 records\n- first: one\n- second: two');
  });
});
