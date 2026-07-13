import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://matheus-inagaki.example/", {
      headers: { accept: "text/html", host: "matheus-inagaki.example" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished portfolio and its professional metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Matheus Inagaki — AI Engineer<\/title>/i);
  assert.match(html, /IA que entende contexto/);
  assert.match(html, /Dossiês de produção/);
  assert.match(html, /20M\+/);
  assert.match(html, /92%/);
  assert.match(html, /JUN 2027/);
  assert.match(html, /conclusão prevista para junho de 2027/);
  assert.match(html, /href="https:\/\/github\.com\/mtsvi-moraes"/);
  assert.match(html, /href="https:\/\/linkedin\.com\/in\/mvinagaki"/);
  assert.match(html, /href="\/Matheus-Inagaki-CV\.pdf"/);
  assert.match(html, /content="https:\/\/matheus-inagaki\.example\/og\.png"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
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
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /prefers-color-scheme: light/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
