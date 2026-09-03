# Collegium Plugin Template

A starting point for a [Collegium](https://collegium.sh) plugin. 

## Start a Plugin

1. Click **Use this template** on GitHub and name the new repository after your plugin. The directory the deployment clones it into is the plugin's name and namespace. The name must be lowercase `snake_case`, such as `contacts` or `crm_sync`.
2. Clone your repository and install:

   ```sh
   pnpm install
   ```

3. Replace `example` in `package.json` and in the `config.json` snippets below with your plugin's name.
4. Edit `src/` until the plugin does what you need, then delete what you don't.

## Develop

```sh
pnpm format    # prettier --write
pnpm lint      # tsc, then eslint --fix
pnpm test      # vitest
```

CI runs the same checks plus `prettier --check` on every push and pull request.
