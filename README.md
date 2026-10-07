# ui

Component kit and design tokens for every Hogoshi app.

Repository: https://github.com/zhogoshi/ui

## What

| Package | Role |
| --- | --- |
| `@hogoshi/tokens` | Colors, type, radius, motion. Built from JSON with Style Dictionary. |
| `@hogoshi/ui` | React components on Base UI. Light and dark only. |

There is no app in this repository. Storybook is a separate repository.

## Why

One palette and one set of controls. Apps do not invent buttons, inputs, or tokens of their own.

## Install

```bash
pnpm add @hogoshi/ui @hogoshi/tokens
```

```ts
import "@hogoshi/ui/src/styles.css";
```

`@hogoshi/ui` also depends on Hugeicons Pro. The app that installs it needs `HUGEICONS_NPM_TOKEN`.

## Where

- Tokens: `packages/tokens`
- Components: `packages/ui`
- Published versions: `versions.env` in the navigator (`HOGOSHI_TOKENS_VERSION`, `HOGOSHI_UI_VERSION`)

## Develop

```bash
pnpm install
pnpm --filter @hogoshi/tokens build
pnpm typecheck
```
