import { defineTool } from '@collegium/sdk';
import { z } from 'zod';

export default defineTool({
  description: 'Read one record by id, or list the records, optionally narrowed to a topic or a phrase.',
  execute: async (args, { settings, storage }) => {
    if (args.id !== undefined) {
      const record = await storage.records.findById(args.id);
      return record ? `${record.id} (${record.topic}): ${record.body}` : `record "${args.id}" not found`;
    }
    const records = await storage.records.findMany({
      limit: settings.maxRecords,
      where: { body: args.phrase === undefined ? undefined : { contains: args.phrase }, topic: args.topic }
    });
    const lines = records.map((record) => `- ${record.id} (${record.topic}): ${record.body}`);
    return [`${records.length} records`, ...lines].join('\n');
  },
  parameters: z.object({
    id: z.string().min(1).optional().describe('The id of one record; omit to list records'),
    phrase: z.string().min(1).optional().describe('Keep only records whose body contains this phrase'),
    topic: z.string().min(1).optional().describe('Keep only records filed under this topic')
  }),
  retryable: true
});
