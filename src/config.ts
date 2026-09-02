import { defineConfig } from '@collegium/sdk';
import { z } from 'zod';

declare module '@collegium/sdk' {
  interface Register {
    config: typeof config;
  }
}

const config = defineConfig({
  settings: z.object({
    maxRecords: z.number().int().positive().default(100)
  }),
  storage: {
    records: z.object({
      body: z.string().min(1),
      topic: z.string().min(1)
    })
  }
});

export default config;
