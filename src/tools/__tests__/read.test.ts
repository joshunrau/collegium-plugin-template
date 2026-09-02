import { createTestContext } from '@collegium/sdk/testing';
import { describe, expect, it } from 'vitest';

import config from '../../config.ts';
import read from '../read.ts';

describe('example::read', () => {
  it('returns one record by id', async () => {
    const context = createTestContext(config);
    await context.storage.records.create({ body: 'hello', id: 'greeting', topic: 'chat' });
    expect(await read.execute({ id: 'greeting' }, context)).toBe('greeting (chat): hello');
  });

  it('reports a record that does not exist', async () => {
    const context = createTestContext(config);
    expect(await read.execute({ id: 'missing' }, context)).toBe('record "missing" not found');
  });

  it('narrows the listing to one topic', async () => {
    const context = createTestContext(config);
    await context.storage.records.create({ body: 'one', id: 'first', topic: 'chat' });
    await context.storage.records.create({ body: 'two', id: 'second', topic: 'notes' });
    expect(await read.execute({ topic: 'notes' }, context)).toBe('1 records\n- second (notes): two');
  });
});
