import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("keeps the finished portfolio content and professional metadata", async () => {
  const [page, layout, ogImage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(layout, /title: "Matheus Inagaki — AI Engineer"/);
  assert.match(layout, /VERCEL_PROJECT_PRODUCTION_URL/);
  assert.match(layout, /\/og\.png/);
  assert.match(page, /IA que entende contexto/);
  assert.match(page, /Dossiês de produção/);
  assert.match(page, /20M\+/);
  assert.match(page, /92%/);
  assert.match(page, /JUN 2027/);
  assert.match(page, /conclusão prevista para junho de 2027/);
  assert.match(page, /https:\/\/github\.com\/mtsvi-moraes/);
  assert.match(page, /https:\/\/linkedin\.com\/in\/mvinagaki/);
  assert.match(page, /\/Matheus-Inagaki-CV\.pdf/);
  assert.ok(ogImage.size > 0);
  assert.doesNotMatch(page, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the bilingual experience and responsive foundation in source", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type Language = "pt" \| "en"/);
  assert.match(page, /aria-pressed/);
  assert.match(page, /document\.documentElement\.lang/);
  assert.match(page, /localStorage\.setItem\("theme"/);
  assert.match(page, /aria-controls="mobile-navigation"/);
  assert.match(page, /aria-controls="desktop-navigation"/);
  assert.match(page, /localStorage\.setItem\("desktop-rail"/);
  assert.match(page, /desktopRailOpen \? "rail-open" : "rail-collapsed"/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /selectedExperience === index/);
  assert.match(page, /setSelectedExperience\(index\)/);
  assert.match(page, /aria-pressed=\{selectedExperience === index\}/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /\.header-actions \{ flex: 0 0 auto; width: auto; height: 42px/);
  assert.match(css, /\.theme-toggle \{ flex: 0 0 42px; width: 42px; height: 42px/);
  assert.match(css, /\.menu-toggle \{ flex: 0 0 42px; width: 42px; height: 42px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:root\[data-theme="light"\]/);
  assert.match(css, /--bg: #ded8cc/);
  assert.match(css, /--surface: #eae4d8/);
  assert.match(css, /--accent: #ff6535/);
  assert.match(css, /\.orbital-system::after \{ content: none; display: none; \}/);
  assert.match(css, /\.site-header \{ position: fixed; inset: 0 auto 0 0/);
  assert.match(css, /\.theme-toggle/);
  assert.match(css, /\.mobile-nav\.open/);
  assert.match(css, /main\.rail-collapsed \{ --rail: 76px; \}/);
  assert.match(css, /\.rail-collapsed \.brand-name \{ display: none; \}/);
  assert.match(css, /\.rail-collapsed \.rail-toggle \{ width: 48px;/);
  assert.match(css, /\.language-switch:hover, \.language-switch:focus-within, \.theme-toggle:hover, \.menu-toggle:hover/);
  assert.match(css, /\.rail-collapsed \.desktop-nav/);
  assert.match(css, /\.timeline-item\.selected/);
  assert.match(css, /--accent-secondary:/);
  assert.match(layout, /VERCEL_PROJECT_PRODUCTION_URL/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /prefers-color-scheme: light/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
