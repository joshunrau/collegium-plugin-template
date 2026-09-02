# Collegium Plugin Template

A starting point for a [Collegium](https://collegium.sh) plugin. A plugin is a directory of TypeScript that a deployment compiles at boot and grants to the agents that need it. This template ships a working plugin named `example` with the whole contract in place: settings, a storage collection, a gated tool, an ungated tool, a skill, and tests that run without a deployment.

## Start a Plugin

1. Click **Use this template** on GitHub and name the new repository after your plugin. The directory the deployment clones it into is the plugin's name and namespace. The name must be lowercase `snake_case`, such as `contacts` or `crm_sync`.
2. Clone your repository and install:

   ```sh
   pnpm install
   ```

3. Replace `example` in `package.json` and in the `config.json` snippets below with your plugin's name. Nothing else carries it.
4. Edit `src/` until the plugin does what you need, then delete what you don't.

## Layout

```
src/
  config.ts             the settings schema and the storage collections
  tools/<name>.ts       one tool per file, named by its filename
  skills/<name>.md      one skill per file, granted as <plugin>::<name>
  testing/context.ts    a fake tool context for tests; not part of the plugin
```

The deployment reads `src/config.ts`, the direct children of `src/tools/`, and the direct children of `src/skills/`. Every child of `src/tools/` must be `<snake_case>.ts` with no further extension. Every child of `src/skills/` must be `<dashed-name>.md`. A file that breaks either rule stops the deployment from booting; nothing is skipped. Subdirectories such as `src/tools/__tests__/` are yours, and the deployment ignores them. Put shared helpers anywhere else under `src/` and import them by relative path.

### Config

`src/config.ts` default-exports `defineConfig` with two optional keys. `settings` is the schema an agent's `toolSettings` for this plugin are parsed against. `storage` names one collection per key. The deployment validates every write against the collection's schema and scopes the rows to your plugin. The `declare module` block below the config types `settings` and `storage` in every tool.

### Tools

Each `src/tools/<name>.ts` default-exports `defineTool`. `write.ts` is gated: `approval` renders what a human reads before the call, and the tool never runs without their approval. `read.ts` has no `approval`, so it runs without one. It is marked `retryable` because a timed-out read is safe to report as a failure. Never mark a mutation retryable.

`execute` returns the text the model reads. Through `err` it raises the two failures a tool may raise itself. `err.invalidArguments` returns the message to the model, and the turn continues. `err.unresolved` ends the turn as an unconfirmed side effect. Any other throw ends the turn as an error.

### Skills

Each `src/skills/<name>.md` is a markdown document with `title` and `description` frontmatter. An agent granted `example::keeping-records` can load it during a turn.

## What the Deployment Enforces

- `dependencies` holds `@collegium/sdk` and `zod` and nothing else. Tooling goes in `devDependencies`.
- The deployment checks each declared range against the version it carries and refuses to boot on a mismatch. The SDK is released with Collegium and shares its version, so the range you declare names the deployment you wrote for. Re-declare it when you move to a new release.
- A plugin file imports `@collegium/sdk`, `zod` (never a subpath), `node:` builtins, and its own files by relative path. Any other bare specifier is a boot failure.
- There is no build step. The deployment compiles your source against its own copies of the SDK and zod. The copies in your `node_modules` serve your editor, `tsc`, and your tests. `tsconfig.json` is yours alone; the deployment never reads it.

## Develop

```sh
pnpm lint      # tsc, then eslint --fix
pnpm test      # vitest
pnpm format    # prettier --write
```

Tests live under `src/tools/__tests__/` and call a tool's `execute` directly. `createTestContext` in `src/testing/context.ts` builds the context a tool receives: in-memory storage for every collection declared in `src/config.ts`, settings parsed through your schema so defaults apply, an `err` whose raisers throw `TestToolFailure`, and a stub turn. Adding a collection or a setting needs no change to the helper.

```ts
const context = createTestContext({ settings: { maxRecords: 1 } });
await write.execute({ body: 'one', id: 'first' }, context);
await expect(write.execute({ body: 'two', id: 'second' }, context)).rejects.toThrow(TestToolFailure);
```

CI runs the same checks plus `prettier --check` on every push and pull request.

## Install and Grant

Clone the plugin into the directory `PLUGINS_ROOT` in the deployment's `.env` points at, under the plugin's name:

```sh
git clone https://github.com/you/example plugins/example
```

Declare it in `config.json`, then grant it to an agent. `"example"` grants every tool, including ones a later version adds; `"example::read"` grants one. Skills are granted separately.

```json
"plugins": ["example"],
"agents": {
  "clara": {
    "tools": ["example"],
    "toolSettings": { "example": { "maxRecords": 500 } },
    "skills": ["example::keeping-records"]
  }
}
```

Restart the deployment. It refuses to start if the plugin is named but not mounted, if settings fail the schema, or if a grant names a tool nothing provides. The log names the plugin and the file.

## Further Reading

- [Write a Plugin](https://collegium.sh/docs/guides/write-a-plugin), the guide this template follows
- [`@collegium/sdk`](https://www.npmjs.com/package/@collegium/sdk), the authoring surface
- [SPEC.md §3.14](https://github.com/joshunrau/collegium/blob/main/SPEC.md), the plugin contract in full
