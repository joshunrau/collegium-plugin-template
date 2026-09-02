import type { ToolContext } from '@collegium/sdk';
import type { z } from 'zod';

import config from '../config.ts';

type Collections = typeof config.storage;

type Collection<TValue> = {
  delete(key: string): Promise<boolean>;
  get(key: string): Promise<null | TValue>;
  list(): Promise<{ key: string; value: TValue }[]>;
  put(key: string, value: TValue): Promise<void>;
};

type Storage = { [K in keyof Collections]: Collection<z.output<Collections[K]>> };

type TestContextOptions = {
  settings?: z.input<typeof config.settings>;
};

function createCollection<TSchema extends z.ZodType>(schema: TSchema): Collection<z.output<TSchema>> {
  const rows = new Map<string, z.output<TSchema>>();
  return {
    delete: (key) => Promise.resolve(rows.delete(key)),
    get: (key) => Promise.resolve(rows.get(key) ?? null),
    list: () => Promise.resolve([...rows].map(([key, value]) => ({ key, value }))),
    put: (key, value) => {
      rows.set(key, schema.parse(value));
      return Promise.resolve();
    }
  };
}

function createStorage(): Storage {
  const entries = Object.entries(config.storage).map(([name, schema]) => [name, createCollection(schema)] as const);
  return Object.fromEntries(entries) as Storage;
}

export class TestToolFailure extends Error {
  constructor(
    readonly kind: 'invalid-arguments' | 'unresolved',
    message: string
  ) {
    super(message);
    this.name = 'TestToolFailure';
  }
}

export function createTestContext(options: TestContextOptions = {}): ToolContext {
  return {
    err: {
      invalidArguments: (message) => {
        throw new TestToolFailure('invalid-arguments', message);
      },
      unresolved: (message) => {
        throw new TestToolFailure('unresolved', message);
      }
    },
    settings: config.settings.parse(options.settings ?? {}),
    storage: createStorage(),
    turn: {
      agentUsername: 'tester',
      channelId: 'test-channel',
      triggeringPostId: null,
      turnId: 'test-turn'
    }
  };
}
