# CLAUDE.md

`@lensapp-eu/lens-js`: the public npm client that sends debug payloads to the
Lens desktop app (`127.0.0.1:23600`) and Lens Cloud (`https://app.lensapp.eu`).

## Layout

- `lens.js`: the whole client, one UMD-style script for Node and browsers. No
  build step and no runtime dependencies; `http`/`https` are required lazily
  so the file also loads in a browser.
- `lens.d.ts`: hand-written types (`export =`, CommonJS). Keep it in sync with
  the functions on `lens`.

Env vars it reads: `LENS_PROJECT_KEY`, `LENS_CLOUD_URL`, `LENS_LOCAL`,
`LENS_CLOUD`.

## Scripts

```bash
npm run lint         # @ultimatelemon-eu/eslint-config/base, plain JS
npm run typecheck    # tsc on lens.d.ts
npm run format       # @ultimatelemon-eu/prettier-config
```

## Releases

Bump `version` in `package.json`, then publish a GitHub Release. The
`Release` workflow runs Code Quality and `npm publish` through npm Trusted
Publishing (OIDC, no token). The trusted publisher on npm points at
`release.yml`: renaming that file breaks publishing.

Public repository: CI runs on GitHub-hosted runners and shared-actions `@v1`,
never on our own runners. `engines.node` stays `>=14` because it constrains
the users of the package, not our tooling.
