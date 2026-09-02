import { createTestContext, PluginToolFailureError } from '@collegium/sdk/testing';
import { describe, expect, it } from 'vitest';

import config from '../../config.ts';
import write from '../write.ts';

describe('example::write', () => {
  it('stores the record and returns its minted id', async () => {
    const context = createTestContext(config);
    const result = await write.execute({ body: 'hello', topic: 'chat' }, context);
    const [record] = await context.storage.records.findMany();
    expect(result).toBe(`record ${record!.id} written`);
    expect(record).toMatchObject({ body: 'hello', topic: 'chat' });
  });

  it('refuses a write past the configured limit', async () => {
    const context = createTestContext(config, { settings: { maxRecords: 1 } });
    await write.execute({ body: 'one', topic: 'chat' }, context);
    await expect(write.execute({ body: 'two', topic: 'chat' }, context)).rejects.toThrow(PluginToolFailureError);
  });
});
