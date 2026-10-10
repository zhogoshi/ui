import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import type { TransformedToken } from "style-dictionary/types";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const tmp = resolve(root, ".tmp");

const cssName = (token: TransformedToken) => `--${token.path.join("-")}`;
const isAttribute = (token: TransformedToken) => token.filePath.includes("/attribute/");
const isColor = (token: TransformedToken) => token.filePath.includes("/color/");
const isDark = (token: TransformedToken) => token.filePath.endsWith("/dark.json");

StyleDictionary.registerTransform({
  name: "hogoshi/value",
  type: "value",
  filter: () => true,
  transform: (token) => token.value,
});

StyleDictionary.registerFormat({
  name: "hogoshi/js",
  format: ({ dictionary }) => {
    const tree: Record<string, unknown> = {};
    for (const token of dictionary.allTokens) {
      let node = tree;
      const path = [...token.path];
      const leaf = path.pop() as string;
      for (const segment of path) {
        node[segment] ??= {};
        node = node[segment] as Record<string, unknown>;
      }
      node[leaf] = `var(${cssName(token)})`;
    }
    return [
      "export const tokens = " + JSON.stringify(tree, null, 2) + ";",
      "export default tokens;",
      "",
    ].join("\n");
  },
});

StyleDictionary.registerFormat({
  name: "hogoshi/dts",
  format: () =>
    [
      "export type TokenTree = { [key: string]: string | TokenTree };",
      "export declare const tokens: TokenTree;",
      "export default tokens;",
      "",
    ].join("\n"),
});

StyleDictionary.registerFormat({
  name: "hogoshi/tailwind",
  format: ({ dictionary }) => {
    const lines = ["@theme inline {"];
    for (const token of dictionary.allTokens) {
      if (token.$type === "color" || token.type === "color") {
        lines.push(`  --color-${token.path.join("-")}: var(${cssName(token)});`);
      }
      if (token.path[0] === "shadow-sm" || token.path[0]?.startsWith("shadow-")) {
        lines.push(`  --shadow-${token.path[0].replace("shadow-", "")}: var(${cssName(token)});`);
      }
      if (token.path[0] === "font-sans" || token.path[0] === "font-mono") {
        const name = token.path[0] === "font-sans" ? "sans" : "mono";
        lines.push(`  --font-${name}: var(${cssName(token)});`);
      }
    }
    lines.push("  --default-transition-duration: var(--motion-duration);");
    lines.push("  --default-animation-duration: var(--motion-duration);");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
  },
});

StyleDictionary.registerFormat({
  name: "hogoshi/attributes",
  format: ({ dictionary }) => {
    const blocks: string[] = [];
    const byFile = new Map<string, TransformedToken[]>();
    for (const token of dictionary.allTokens) {
      const list = byFile.get(token.filePath) ?? [];
      list.push(token);
      byFile.set(token.filePath, list);
    }

    for (const [file, tokens] of byFile) {
      if (file.endsWith("/font-size.json")) {
        for (const token of tokens) {
          const step = token.path.at(-1);
          blocks.push(`:root[data-font-size="${step}"] { --text-base: ${token.value}; }`);
        }
      }
      if (file.endsWith("/radius.json")) {
        for (const token of tokens) {
          const step = token.path.at(-1);
          blocks.push(`:root[data-radius="${step}"] { --radius-md: ${token.value}; }`);
        }
      }
      if (file.endsWith("/density.json")) {
        const grouped = new Map<string, string[]>();
        for (const token of tokens) {
          const name = token.path[1];
          const prop = token.path.at(-1);
          const lines = grouped.get(name) ?? [];
          lines.push(`--${prop}: ${token.value};`);
          grouped.set(name, lines);
        }
        for (const [name, lines] of grouped) {
          blocks.push(`:root[data-density="${name}"] {\n  ${lines.join("\n  ")}\n}`);
        }
      }
      if (file.endsWith("/motion.json")) {
        for (const token of tokens) {
          const name = token.path.at(-1);
          blocks.push(`:root[data-motion="${name}"] { --motion-duration: ${token.value}; }`);
        }
      }
    }

    return blocks.join("\n\n") + "\n";
  },
});

const transforms = ["name/kebab", "hogoshi/value"];

const cssFile = (destination: string, selector: string, filter: (token: TransformedToken) => boolean) => ({
  destination,
  format: "css/variables",
  filter,
  options: { selector, outputReferences: true },
});

const shared = {
  source: [
    `${root}/tokens/base.json`,
    `${root}/tokens/primitive/*.json`,
    `${root}/tokens/color/light.json`,
    `${root}/tokens/attribute/*.json`,
  ],
  platforms: {
    root: {
      transforms,
      buildPath: `${tmp}/`,
      prefix: "",
      files: [
        cssFile("tokens.css", ":root", (token) => !isAttribute(token) && !isDark(token)),
        {
          destination: "attributes.css",
          format: "hogoshi/attributes",
          filter: isAttribute,
        },
        { destination: "tokens.js", format: "hogoshi/js", filter: (token: TransformedToken) => !isAttribute(token) && !isDark(token) },
        { destination: "tokens.d.ts", format: "hogoshi/dts" },
        {
          destination: "tailwind-theme.css",
          format: "hogoshi/tailwind",
          filter: (token: TransformedToken) => !isAttribute(token) && !isDark(token),
        },
      ],
    },
  },
};

const scheme = (mode: "light" | "dark", selector: string) =>
  new StyleDictionary({
    source: [`${root}/tokens/color/${mode}.json`],
    platforms: {
      [mode]: {
        transforms,
        buildPath: `${tmp}/`,
        prefix: "",
        files: [cssFile(`${mode}.css`, selector, isColor)],
      },
    },
  });

const dark = scheme("dark", ':root[data-mode="dark"], [data-mode="dark"]');
const light = scheme("light", '[data-mode="light"]');

const motionOff = `
:root[data-motion="off"] *,
:root[data-motion="off"] *::before,
:root[data-motion="off"] *::after {
  transition-duration: 0.01ms !important;
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  scroll-behavior: auto !important;
}
`;

const run = async () => {
  await rm(tmp, { recursive: true, force: true });
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const sd = new StyleDictionary(shared);
  await sd.buildAllPlatforms();
  await dark.buildAllPlatforms();
  await light.buildAllPlatforms();

  const read = (file: string) => readFile(`${tmp}/${file}`, "utf8");
  const [tokensCss, attributesCss, darkCss, lightCss, tokensJs, tokensDts, tailwindCss] = await Promise.all([
    read("tokens.css"),
    read("attributes.css"),
    read("dark.css"),
    read("light.css"),
    read("tokens.js"),
    read("tokens.d.ts"),
    read("tailwind-theme.css"),
  ]);

  const themes = [darkCss.trim(), "", lightCss.trim(), "", attributesCss.trim(), motionOff.trim(), ""].join("\n");

  await Promise.all([
    writeFile(`${dist}/tokens.css`, tokensCss),
    writeFile(`${dist}/themes.css`, themes),
    writeFile(`${dist}/tailwind-theme.css`, tailwindCss),
    writeFile(`${dist}/tokens.js`, tokensJs),
    writeFile(`${dist}/tokens.d.ts`, tokensDts),
  ]);

  await rm(tmp, { recursive: true, force: true });
};

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
