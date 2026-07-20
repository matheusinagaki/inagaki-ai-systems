import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("keeps the finished portfolio content and professional metadata", async () => {
  const [page, layout, socialImage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    stat(new URL("../public/linkedin-thumbnail.png", import.meta.url)),
  ]);

  assert.match(layout, /title: "Matheus Inagaki — AI Systems Engineer"/);
  assert.match(layout, /VERCEL_PROJECT_PRODUCTION_URL/);
  assert.match(layout, /linkedin-thumbnail\.png/);
  assert.match(page, /IA que entende contexto/);
  assert.match(page, /Dossiês de produção/);
  assert.match(page, /20M\+/);
  assert.match(page, /92%/);
  assert.match(page, /JUN 2027/);
  assert.match(page, /conclusão prevista para junho de 2027/);
  assert.match(page, /decrypt-line-measure/);
  assert.match(page, /https:\/\/github\.com\/mtsvi-moraes/);
  assert.match(page, /https:\/\/linkedin\.com\/in\/matheusinagaki/);
  assert.match(page, /\/Matheus-Inagaki-CV\.pdf/);
  assert.ok(socialImage.size > 0);
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
  assert.match(css, /--bg: #F4F4F5/);
  assert.match(css, /--surface: #F4F4F5/);
  assert.match(css, /--accent: #047857/);
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
  assert.match(layout, /linkedin-thumbnail\.png/);
  assert.match(layout, /prefers-color-scheme: light/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("keeps the chat and browser security controls in place", async () => {
  const [route, chatSecurity, chatDrawer, proxy, packageJson, knowledgeBase] = await Promise.all([
    readFile(new URL("../app/api/chat/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/chat-security.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ui/chat-drawer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/data/knowledge_base.txt", import.meta.url), "utf8"),
  ]);

  assert.match(route, /checkChatRateLimit/);
  assert.match(route, /isSameOriginRequest/);
  assert.match(route, /maxOutputTokens: CHAT_LIMITS\.outputTokens/);
  assert.match(route, /AbortSignal\.timeout\(25_000\)/);
  assert.match(chatSecurity, /bodyBytes: 32_000/);
  assert.match(chatSecurity, /messageCharacters: 1_600/);
  assert.match(chatSecurity, /message\.role !== "user" && message\.role !== "assistant"/);
  assert.match(chatSecurity, /if \(role === "assistant"\) continue/);
  assert.match(chatDrawer, /overflow-wrap:anywhere/);
  assert.match(chatDrawer, /role="alert"/);
  assert.match(chatDrawer, /<textarea/);
  assert.match(chatDrawer, /requestSubmit/);
  assert.match(chatDrawer, /renderMessageText/);
  assert.match(chatDrawer, /event\.key === "Escape"/);
  assert.match(chatDrawer, /aria-label="Fechar assistente"/);
  assert.match(chatDrawer, /sm:h-\[calc\(100dvh-3rem\)\]/);
  assert.match(chatDrawer, /z-\[310\]/);
  assert.match(route, /linkedin\.com\/in\/matheusinagaki/);
  assert.match(route, /openrouter\.chat\("deepseek\/deepseek-chat"\)/);
  assert.match(proxy, /Content-Security-Policy/);
  assert.match(proxy, /frame-ancestors 'none'/);
  assert.match(proxy, /X-Content-Type-Options/);

  const parsedPackage = JSON.parse(packageJson);
  assert.equal(parsedPackage.dependencies.postcss, "8.5.19");
  assert.equal(parsedPackage.overrides.postcss, "8.5.19");
  assert.equal(parsedPackage.devDependencies.vercel, undefined);
  assert.doesNotMatch(knowledgeBase, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  assert.doesNotMatch(knowledgeBase, /(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)/);
});
