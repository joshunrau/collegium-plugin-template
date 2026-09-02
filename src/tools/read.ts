import { defineTool } from '@collegium/sdk';
import { z } from 'zod';

export default defineTool({
  description: 'Read one record by id, or list every record.',
  execute: async (args, { settings, storage }) => {
    if (args.id !== undefined) {
      const record = await storage.records.get(args.id);
      return record ? record.body : `record "${args.id}" not found`;
    }
    const records = await storage.records.list();
    const header = `${records.length}/${settings.maxRecords} records`;
    const lines = records.map(({ key, value }) => `- ${key}: ${value.body}`);
    return [header, ...lines].join('\n');
  },
  parameters: z.object({
    id: z.string().min(1).optional().describe('The id of one record; omit to list every record')
  }),
  retryable: true
});
