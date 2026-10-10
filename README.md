# ui

Component kit and design tokens for every Hogoshi app.

Repository: https://github.com/zhogoshi/ui

## What

| Package | Role |
| --- | --- |
| `@hogoshi/tokens` | Colors, type, radius, motion. Built from JSON with Style Dictionary. Public on npm. |
| `@hogoshi/ui` | React components on Base UI. Light and dark only. Public on npm. |

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

Apps import one stylesheet. It pulls the token CSS. Safe-area variables, the notch navbar, and theme motion live in the kit. A new version is staged from the navigator and is installable only after it is approved on npm.

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
