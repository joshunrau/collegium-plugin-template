import { defineTool } from '@collegium/sdk';
import { z } from 'zod';

export default defineTool({
  approval: (args) => ({ body: `file under "${args.topic}": ${args.body}`, presentation: 'verbatim' }),
  description: 'Store a record under a topic. The store mints its id, which is returned.',
  execute: async (args, { err, settings, storage }) => {
    const existing = await storage.records.findMany();
    if (existing.length >= settings.maxRecords) {
      err.invalidArguments(`record limit of ${settings.maxRecords} reached`);
    }
    const record = await storage.records.create({ body: args.body, topic: args.topic });
    return `record ${record.id} written`;
  },
  parameters: z.object({
    body: z.string().min(1).describe('The text to store'),
    topic: z.string().min(1).describe('A short subject to file the record under')
  }),
  traceDetail: (args) => `${args.topic}: ${args.body}`
});
