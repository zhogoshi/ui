# ui

`@hogoshi/tokens` and `@hogoshi/ui`. https://github.com/zhogoshi/ui

Tokens are JSON, built with Style Dictionary. Components are React on Base UI, light and dark. Both packages are public. No app in this repo.

```bash
pnpm add @hogoshi/ui @hogoshi/tokens
```

```ts
import "@hogoshi/ui/src/styles.css";
```

The app that installs the kit needs `HUGEICONS_NPM_TOKEN`. Source is `packages/tokens` and `packages/ui`.

```bash
pnpm install
pnpm --filter @hogoshi/tokens build
pnpm typecheck
```
