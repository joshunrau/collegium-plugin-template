import { defineTool } from '@collegium/sdk';
import { z } from 'zod';

export default defineTool({
  approval: (args) => ({ body: `write record "${args.id}": ${args.body}`, presentation: 'verbatim' }),
  description: 'Store a record under an id.',
  execute: async (args, { err, settings, storage }) => {
    const existing = await storage.records.list();
    if (existing.length >= settings.maxRecords) {
      err.invalidArguments(`record limit of ${settings.maxRecords} reached`);
    }
    await storage.records.put(args.id, { body: args.body });
    return `record ${args.id} written`;
  },
  parameters: z.object({
    body: z.string().min(1).describe('The text to store'),
    id: z.string().min(1).describe('A short identifier to store the record under')
  }),
  traceDetail: (args) => `${args.id}: ${args.body}`
});
