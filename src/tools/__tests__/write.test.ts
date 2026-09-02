import { createTestContext, PluginToolFailureError } from '@collegium/sdk/testing';
import { describe, expect, it } from 'vitest';

import config from '../../config.ts';
import write from '../write.ts';

describe('example::write', () => {
  it('stores the record under its id', async () => {
    const context = createTestContext(config);
    expect(await write.execute({ body: 'hello', id: 'greeting' }, context)).toBe('record greeting written');
    expect(await context.storage.records.get('greeting')).toStrictEqual({ body: 'hello' });
  });

  it('refuses a write past the configured limit', async () => {
    const context = createTestContext(config, { settings: { maxRecords: 1 } });
    await write.execute({ body: 'one', id: 'first' }, context);
    await expect(write.execute({ body: 'two', id: 'second' }, context)).rejects.toThrow(PluginToolFailureError);
  });
});
