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
  assert.match(html, /Arquitetando IA que/);
  assert.match(html, /20M\+/);
  assert.match(html, /92%/);
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
  assert.match(page, /event\.key === "Escape"/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:root\[data-theme="light"\]/);
  assert.match(css, /\.theme-toggle/);
  assert.match(css, /\.mobile-nav\.open/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /prefers-color-scheme: light/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
