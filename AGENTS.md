# AGENTS.md

This file is the contract for a Collegium plugin and the working style on top of it.

## Commands

Package manager is pnpm (>=11). Node version: see `.nvmrc`.

```sh
pnpm format        # prettier --write
pnpm lint          # tsc, then eslint --fix (mutates files)
pnpm test          # vitest
```

## Context

Collegium runs a set of LLM agents in one process. Agents talk to humans and each other over
Mattermost, and call tools under an approval-gated policy.

A plugin extends what an agent can do. 

- A **tool** is one operation the agent calls in a turn. Your tools appear alongside the built-ins.
- A **skill** is a markdown document the agent loads for guidance during a turn.

**Settings** parameterize the plugin per agent. Every tool call receives the parsed settings,
so the same tool can behave differently for different agents. **Storage** is a set of named record 
collections scoped to your plugin. Tools read and write them across turns.

The deployment compiles the plugin at boot and grants its tools and skills to the agents that
need them.

## Layout

```
src/
  config.ts             the settings schema and the storage collections
  tools/<name>.ts       one tool per file, name in snake_case
  skills/<name>.md      one skill per file, name in dashed-case
```

Put shared helpers anywhere else under `src/` and import by relative path. `src/tools/__tests__/`
is yours to organize.

## Config

`src/config.ts` default-exports `defineConfig`. It takes two optional keys: `settings` and
`storage`.

`settings` is a Zod schema for the configuration each agent supplies to this plugin.

`storage` names one record collection per key. Each value is the Zod schema for a record's own
fields. The store stamps `id`, `createdAt`, and `updatedAt` on every record, so your schema must
not declare those.

Every tool call receives the parsed settings and typed collection handles on its context:

```ts
execute: async (args, { settings, storage }) => { /* ... */ }
```

To make those fields infer from your schema, augment the SDK's `Register` interface with your
config. TypeScript merges the block from anywhere in `src/`; the template keeps it beside
`defineConfig`:

```ts
declare module '@collegium/sdk' {
  interface Register {
    config: typeof config;
  }
}
```

Without it, `settings` and `storage.<key>` are untyped in every tool.

## Storage

Each collection handle has `create`, `findById`, `findMany`, `updateById`, and `deleteById`. Rows
are scoped to your plugin.

`create` mints a cuid2 unless you pass an `id`. Every read parses the row against your current
schema. A row an older schema wrote fails loudly before it reaches a tool.

`findMany` without a query returns every record in insertion order. With a query it takes `limit`
and a `where` clause. `where` ANDs conditions over the record's own top-level scalar fields:

- a value, for equality
- `{ in: [...] }`, for membership
- `{ contains: '...' }`, for a case-insensitive substring of a string

Object, array, and date fields are not queryable.

```ts
const recent = await storage.records.findMany({
  limit: 20,
  where: { body: { contains: 'invoice' }, topic: 'billing' }
});
```

## Tools

Each `src/tools/<name>.ts` default-exports `defineTool`. Its `parameters` is a Zod object. The SDK
parses the model's call against it, so do not re-validate inside `execute`.

A tool with `approval` is gated. The callback renders what the human reads before the call, and
the tool never runs without their approval. A tool without `approval` runs on its own.

A read tool may set `retryable: true` when a timed-out call is safe to report as a failure. Never
mark a mutation retryable.

`execute` returns the text the model reads. Raise a failure through `err`:

- `err.invalidArguments(message)` returns the message to the model. The turn continues.
- `err.unresolved(message)` ends the turn as an unconfirmed side effect.

Any other throw ends the turn as an error. Use it only for programmer error.

## Skills

Each `src/skills/<name>.md` is a markdown document with `title` and `description` frontmatter.

## What the Deployment Enforces

- Runtime `dependencies` is `@collegium/sdk` and `zod`, nothing else. Tooling goes in
  `devDependencies`.
- Your declared SDK range must match the version the deployment carries. Re-declare on each
  release.
- A plugin file may import `@collegium/sdk`, `zod`, `node:` builtins, or its own files by relative
  path. Any other bare specifier fails boot.
- A file under `src/tools/` or `src/skills/` that breaks its naming rule fails boot.
- No build step. The deployment compiles your source against its own copies of the SDK and zod.
  Your `node_modules` serves your editor, `tsc`, and your tests only.

## Tests

Test files live under `src/tools/__tests__/` and call `execute` directly.

```ts
import { createTestContext, PluginToolFailureError } from '@collegium/sdk/testing';
import { expect, it } from 'vitest';

import config from '../../config.ts';
import write from '../write.ts';

it('refuses a write past the configured limit', async () => {
  const context = createTestContext(config, { settings: { maxRecords: 1 } });
  await write.execute({ body: 'one', topic: 'chat' }, context);
  await expect(
    write.execute({ body: 'two', topic: 'chat' }, context)
  ).rejects.toThrow(PluginToolFailureError);
});
```

`createTestContext(config, options?)` returns a context with in-memory storage for each collection
and settings parsed through your schema. Its `err` raisers throw `PluginToolFailureError`, so
tests assert on that. Pass `turn` in `options` to change the agent, channel, or post the tool
sees.

## Hard Rules

- No new runtime dependencies.
- Run `pnpm lint` and `pnpm test` after any change. Fix failures before declaring the task done.
