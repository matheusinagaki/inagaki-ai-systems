# Auditoria de Segurança White-Box — inagaki-ai-systems

**Data:** 2026-10-04 (2ª rodada; substitui o relatório de 2026-08-06)
**Base:** `main` @ `fdc8837` (sincronizado com `origin/main`)
**Escopo:** 100% dos 55 arquivos rastreados + histórico git, `npm audit`, metadados de arquivos públicos (PDF/PNG/SVG) e testes dinâmicos contra `next start` local.

---

## Resumo Executivo

Portfólio Next.js (App Router, Vercel) com um único endpoint dinâmico: `POST /api/chat`, um assistente RAG (OpenRouter → `deepseek/deepseek-chat`) sobre dois arquivos estáticos. O código da aplicação já tinha defesa em profundidade sólida: histórico assinado com HMAC, checagem de origem, cookie `HttpOnly; SameSite=Strict`, limites de payload, guarda de entrada/saída do LLM e CSP com nonce.

O risco principal desta rodada estava nas **dependências**. O `next@16.2.6` tinha 12 advisories publicados, 3 deles **críticos** (RCE). Além disso, o `overrides` fixo em `postcss@8.5.19` forçava uma versão vulnerável em toda a árvore. O teste dinâmico também achou um **bypass da CSP** pelo matcher do `proxy.ts`.

Todos os itens corrigíveis em código foram corrigidos e validados: build, 13/13 testes, lint e `tsc` passam, e a bateria de ataques foi refeita contra o servidor de produção. **Nenhuma vulnerabilidade Crítica ou Alta permanece.** Restam uma Média que depende de configuração na Vercel e itens Baixos/Informativos.

| | Antes | Depois |
|---|---|---|
| `npm audit` (produção) | 1 crítica, 3 altas, 2 moderadas | **0** |
| `npm audit` (total) | 13 | 5 altas, só na toolchain de lint, sem correção upstream |
| Score | ~62/100 | **93/100** |

---

## Mapa da Superfície de Ataque

| Item | Detalhe |
|---|---|
| Stack | Next.js 16.3.8 (App Router, Turbopack), React 19.2.6, TypeScript, Tailwind 4 |
| Hosting | Vercel (`.vercel/repo.json`) |
| Middleware | `proxy.ts`: CSP com nonce por requisição e headers de segurança |
| Rotas | `/` (client), `/case/[slug]` (client + `generateMetadata`), `/robots.txt`, `/sitemap.xml`, `POST /api/chat` |
| Server Actions / next/image / next/og | Nenhum uso |
| Autenticação / RBAC | Não há (site público). O cookie `portfolio_chat_session` só vincula o histórico assinado |
| Banco | Nenhum (o scaffold morto `db/`, `examples/d1`, `worker/` foi removido) |
| Integrações externas | OpenRouter (LLM), Upstash Redis REST (opcional), Google Fonts (self-hosted no build) |
| Segredos | `OPENROUTER_API_KEY`, `CHAT_SIGNING_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN`. Só em `.env.local` (ignorado). **Nenhum segredo encontrado no histórico git** |
| Entradas do usuário | Body JSON do chat, header `Cookie`, `Origin`/`Host`/`X-Forwarded-*`, `params.slug`, `localStorage` (`theme`, `lang`, `desktop-rail`), headers de prefetch |
| CORS | Nenhum `Access-Control-Allow-*`; o preflight cross-origin não libera nada |
| Arquivos públicos | CV em PDF (sem JS/OpenAction/Launch; metadados limpos via pypdf), PNG sem chunks de texto, SVGs estáticos sem script |

### Taint analysis (resumo)

| Fonte | Destino | Controle |
|---|---|---|
| `messages[].parts[].text` | Prompt do LLM | Shape/tamanho/papéis validados, filtro de injection, HMAC nos turnos do assistente |
| Saída do LLM | DOM | Texto React puro; só URLs de uma allowlist exata viram `<a>`; guarda de saída |
| `Cookie: portfolio_chat_session` | Chave HMAC | Regex `^[A-Za-z0-9_-]{43}$`; CRLF/valores inválidos geram uma nova sessão |
| `params.slug` | `casesData.find()` | Só comparação de igualdade; sem FS/DB |
| `localStorage` | `data-theme`, idioma | Valores em allowlist (`light`/`dark`, `pt`/`en`) |
| `x-nonce` (request) | Atributo `nonce` | **Era controlável pelo cliente via bypass do proxy (corrigido, ver B1)** |

---

## Vulnerabilidades Críticas

### C1. Next.js 16.2.6 com advisories críticos/altos publicados — CORRIGIDO

- **Severidade:** Crítica pelos advisories (CVSS até 9.x). **Risco efetivo neste app: Alto.** As RCEs de `next/og` e de Windows não se aplicam (sem uso/host). A da Image Optimization (AVIF) dependia do `/_next/image`, que estava habilitado por padrão.
- **CWE:** CWE-1395 (dependência vulnerável), CWE-94, CWE-918, CWE-444
- **OWASP:** A06:2021 Vulnerable and Outdated Components; API8:2023
- **Arquivo:** `package.json:22`, `package-lock.json`
- **Advisories:** GHSA-2xp9-vwfh-vxw4 (RCE Image Optimization/AVIF), GHSA-vcvr-r3jv-pc5j (RCE next/og), GHSA-p293-qw3h-jr36 (RCE Windows), GHSA-6gpp-xcg3-4w24 (bypass de Proxy), GHSA-68g3-v927-f742 e GHSA-4633-3j49-mh5q (cache confusion em requisições com body, relevante para `POST /api/chat`), GHSA-p9j2-gv94-2wf4 (SSRF em rewrites), entre outros. O `sharp` transitivo também tinha CVEs da libvips/libheif.
- **Reproduzir:** `npm audit` → `next 9.3.4-canary.0 - 16.3.5 critical`.
- **Antes:** `"next": "16.2.6"`, `"eslint-config-next": "16.2.6"`
- **Depois:** `"next": "16.3.8"`, `"eslint-config-next": "16.3.8"` (minor, sem breaking change; o build e a navegação foram validados)
- **Defesa extra:** `images: { unoptimized: true }` em `next.config.ts`, porque `next/image` não é usado. Validado: `/_next/image?...` → **404**. Isso remove a superfície de toda a classe de bugs do otimizador.
- **Melhor prática:** atualizações automáticas de segurança. Adicionado `.github/dependabot.yml` (semanal, com agrupamento de security updates).

## Vulnerabilidades Altas

Nenhuma remanescente. (O `sharp` vulnerável, que era alto, saiu junto com C1.)

## Vulnerabilidades Médias

### M1. Pin de `postcss@8.5.19` em `overrides` forçava versão vulnerável — CORRIGIDO

- **Severidade:** Moderada pelo advisory. Risco efetivo baixo, porque o PostCSS só processa o CSS do próprio repositório em build time.
- **CWE/Ref:** CWE-1395 · GHSA-fxqj-rqcc-2cmp (leitura arbitrária de `.map` via `sourceMappingURL`)
- **Arquivo:** `package.json:23,39`
- **Causa raiz:** o pin foi criado para corrigir um CVE antigo, mas o `overrides` **também rebaixava** a versão que o próprio Next exigia (`8.5.23`). Um "pin de segurança" virou vetor de vulnerabilidade.
- **Correção:** `postcss` e `overrides.postcss` → `8.5.28`. O teste deixou de travar uma versão exata e agora exige `>= 8.5.23` e `overrides == dependencies`.

### M2. Rate limit não distribuído em produção (Denial of Wallet) — PENDENTE (configuração)

- **Severidade:** Média — CVSS ≈ 5.3 (`AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L`)
- **CWE/OWASP:** CWE-799, CWE-400 · API4:2023 · LLM04 (Model DoS)
- **Arquivo:** `lib/chat-security.ts` (`checkChatRateLimit`)
- **Risco:** sem `UPSTASH_REDIS_REST_URL/TOKEN` (ou `KV_REST_API_*`), o limite de 12/cliente e 150/global por 10 min vale **por instância serverless**. Com escala horizontal, o teto real é multiplicado. O `.env.local` não define essas variáveis, e não foi possível confirmar o ambiente de produção da Vercel.
- **Mitigação aplicada em código:** um `console.warn` único em produção na Vercel quando o fallback em memória é usado, para a configuração faltante aparecer nos logs. Fail-closed não foi imposto porque derrubaria o chat se a variável não existir.
- **Ação necessária:** provisionar Upstash/Vercel KV e configurar as variáveis em *Production*. Também definir um **limite de crédito na chave do OpenRouter**.

## Vulnerabilidades Baixas

### B1. Bypass da CSP e nonce controlado pelo cliente via headers de prefetch — CORRIGIDO

- **Severidade:** Baixa — CVSS ≈ 3.7 (`AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N`). É um bypass de controle de defesa; sem sink de XSS e sem cache compartilhado, não há exploração direta contra terceiros.
- **CWE/OWASP:** CWE-693 (Protection Mechanism Failure), CWE-807 · A05:2021 · ASVS 14.4
- **Arquivo:** `proxy.ts:56-66` (antes)
- **Código vulnerável:**
  ```ts
  matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico).*)",
    missing: [{ type: "header", key: "next-router-prefetch" },
              { type: "header", key: "purpose", value: "prefetch" }] }]
  ```
- **Reproduzir (antes):** `curl -H "Purpose: prefetch" -H 'x-nonce: attacker' http://host/` devolvia HTML **sem `Content-Security-Policy`, sem `X-Frame-Options` e sem HSTS**, com `nonce="attacker…"` refletido no `<script>`. O React escapava o valor, por isso não havia XSS.
- **Correção:**
  ```ts
  export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
  ```
  Os headers estáticos (XFO, nosniff, HSTS, COOP, CORP, Referrer/Permissions-Policy) foram duplicados em `next.config.ts → headers()` para `/:path*`. Assim, até os caminhos excluídos do proxy (`_next/static`, `favicon.ico`) recebem esses headers.
- **Validado:** com os dois headers de prefetch, `CSP:1 attacker_nonce:0`. Assets estáticos agora têm `X-Frame-Options`, `nosniff` e `CORP`. A navegação client-side continua funcionando sem erros no console.

### B2. `CHAT_SIGNING_SECRET` fraco seria aceito — CORRIGIDO

- **Severidade:** Baixa — CVSS ≈ 3.1 · **CWE-326/CWE-521**
- **Arquivo:** `app/api/chat/route.ts:56`, `lib/chat-history.ts`
- **Risco:** um valor curto (ex.: `changeme`) tornaria a chave HMAC passível de força bruta offline, porque toda resposta devolve uma assinatura. Isso permitiria forjar turnos do "assistente" e facilitar jailbreak (impacto limitado à própria sessão do atacante).
- **Correção:** `resolveChatSigningSecret()` só aceita segredos com 32+ caracteres. Caso contrário, usa a derivação HMAC da API key e registra um aviso em produção. Teste de regressão adicionado.

### B3. Vulnerabilidades na toolchain de lint (dev only) — ACEITO

`braces`/`micromatch`/`fast-glob` via `eslint-config-next@16.3.8` (GHSA-vfj7-8cjw-p6xm). Não há versão corrigida (`range: *`). O ESLint só processa globs do próprio repositório; não vai para o runtime. O Dependabot avisará quando sair a correção.

### B4. Scaffold morto Cloudflare/D1/Vite — CORRIGIDO (removido)

`worker/`, `vite.config.ts`, `build/`, `db/`, `drizzle*`, `examples/d1/`, `.openai/hosting.json`. Eles importam pacotes **não instalados** (`vinext`, `@cloudflare/vite-plugin`, `drizzle-orm`). Se alguém instalar esses pacotes e ativar esse caminho, `examples/d1/.../notes/route.ts` vira um endpoint público de escrita sem auth/rate limit e vaza `error.message`. Removido nesta rodada, junto com as referências em `tsconfig.json`, `.gitignore` e no script de lint (CWE-1164 · API9:2023).

## Informativos

| # | Achado | Observação |
|---|---|---|
| I1 | `/case/<qualquer-coisa>` responde **200** (soft 404) | Sem impacto de segurança; SEO. Pode usar `notFound()` |
| I2 | A CSP do proxy sobrescreve a `default-src 'none'` definida no `/api/chat` | Resposta `text/event-stream`/JSON com `nosniff`; não renderizável |
| I3 | `isSameOriginRequest` aceita `Host == Origin` de clientes não-browser | Não é CSRF (browser não forja os dois); DNS rebinding é barrado pelo roteamento por host da Vercel + `SameSite=Strict` |
| I4 | Um atacante com muitos IPs pode esgotar o limite global e indisponibilizar o chat para todos | Trade-off consciente (teto de custo > disponibilidade) |
| I5 | Conversas dos visitantes vão para OpenRouter/DeepSeek sem aviso na UI | LGPD/privacidade: adicionar aviso curto no drawer e considerar `data_collection: "deny"` no OpenRouter |
| I6 | Jailbreak pode gerar conteúdo fora do tema "em nome" do portfólio | Só aparece para quem pediu; risco reputacional |
| I7 | E-mail em texto puro no HTML | Intencional; sujeito a scraping/spam |
| I8 | `.env.local` com permissão `644` | Local; recomendado `chmod 600 .env.local` |

---

## Checklist OWASP Top 10 (2021)

| # | Status |
|---|---|
| A01 Broken Access Control | ✅ Sem recursos com dono; CSRF bloqueado (validado: sem Origin, Origin maliciosa e `null` → 403) |
| A02 Cryptographic Failures | ✅ HMAC-SHA256 + `timingSafeEqual`; segredo mínimo agora imposto |
| A03 Injection | ✅ Sem SQL/NoSQL/shell/eval/template; prompt injection tratada no LLM01 |
| A04 Insecure Design | ✅ Defesa em profundidade no chat |
| A05 Security Misconfiguration | ✅ Bypass da CSP corrigido; headers globais; otimizador de imagem desligado |
| A06 Vulnerable Components | ✅ 0 vulnerabilidades em produção; Dependabot adicionado |
| A07 Identification & Auth Failures | ✅ N/A (sem login); sessão do chat sem privilégio, fixation irrelevante |
| A08 Software & Data Integrity | ✅ Lockfile, `npm ci`, sem desserialização insegura; prototype pollution testada |
| A09 Logging & Monitoring | ⚠️ Logs sem dados sensíveis; avisos de configuração adicionados; sem alertas externos |
| A10 SSRF | ✅ Nenhuma URL do usuário chega ao servidor; file parts rejeitadas; `/_next/image` desligado |

## Checklist OWASP API Security Top 10 (2023)

| # | Status |
|---|---|
| API1 BOLA / API3 BOPLA / API5 BFLA | ✅ N/A |
| API2 Broken Authentication | ✅ N/A |
| API4 Unrestricted Resource Consumption | ⚠️ M2 (configuração) — limites de body/mensagens/tokens/timeout ok |
| API6 Sensitive Business Flows | ✅ Rate limit + validação |
| API7 SSRF | ✅ |
| API8 Security Misconfiguration | ✅ após B1 |
| API9 Improper Inventory | ✅ scaffold morto removido (B4) |
| API10 Unsafe Consumption of APIs | ✅ Timeout 25s, `maxRetries: 1`, resposta do Redis validada, fail-closed |

## Checklist ASVS 4.0 (L1/L2, áreas aplicáveis)

| Área | Status |
|---|---|
| V1 Arquitetura / Threat model | ✅ |
| V3 Sessão | ✅ `HttpOnly`, `Secure` (https), `SameSite=Strict`, `Path=/api/chat`, 24h, ID de 256 bits |
| V5 Validação | ✅ Allowlist de shape/papéis/tamanho; JSON parse isolado |
| V7 Erros e logs | ✅ Mensagens genéricas ao cliente; sem stack trace; source maps → 404 |
| V8 Proteção de dados | ⚠️ I5 (aviso de privacidade) |
| V9 Comunicação | ✅ HSTS 2 anos + `upgrade-insecure-requests` |
| V10 Código malicioso / dependências | ✅ após C1/M1 |
| V12 Arquivos | ✅ Sem upload; leitura de FS com caminho fixo; PDF sem conteúdo ativo |
| V13 API | ✅ Só POST (GET → 405), sem CORS |
| V14 Configuração / headers | ✅ CSP nonce + `strict-dynamic`, XFO, COOP, CORP, Permissions-Policy, nosniff |

## Checklist IA/LLM (OWASP LLM Top 10)

| Item | Status |
|---|---|
| Prompt Injection (direta) | ✅ Filtro de entrada normalizado (NFKD, zero-width, fullwidth: validado) + guarda de saída. O filtro é heurístico e contornável por paráfrase; a garantia real é a guarda de saída + ausência de ferramentas |
| Indirect Injection / RAG / Context poisoning | ✅ A base é estática no repo, tratada como "untrusted data" no prompt; sem retrieval externo |
| Prompt / data leakage | ✅ Overlap por shingles, blobs codificados, termos de vazamento, URLs fora da allowlist |
| Forged history / Agent injection | ✅ Turnos do assistente assinados por sessão; papel `system` rejeitado; greeting exato |
| Tool abuse / MCP / Excessive agency / Confused deputy / Cross-agent | ✅ N/A: sem ferramentas, agentes ou MCP |
| Insecure output handling | ✅ Sem `dangerouslySetInnerHTML` na saída; links por allowlist com `noopener noreferrer` |
| Model DoS / token consumption | ⚠️ `maxOutputTokens: 500`, 8k chars, 25s; teto global depende de M2 |
| Sensitive info disclosure | ✅ KB sem e-mail/telefone (teste automatizado) |

---

## Score Geral de Segurança: **93/100**

−5 por M2 (configuração não verificada em produção), −2 por I5 (privacidade/LGPD).

## Próximos Passos Priorizados

1. **Deploy** desta correção (C1/M1/B1 só valem em produção depois do redeploy).
2. **[M2]** Configurar `UPSTASH_REDIS_REST_URL/TOKEN` (ou Vercel KV) em Production e definir um limite de crédito na chave do OpenRouter.
3. **[B2]** Definir `CHAT_SIGNING_SECRET` com `openssl rand -base64 32` em Production.
4. **[I5]** Aviso de privacidade no chat + `data_collection: "deny"` no OpenRouter.
5. Habilitar Dependabot alerts/security updates no GitHub (o arquivo de config já foi adicionado).

## Arquivos alterados nesta rodada

`package.json`, `package-lock.json`, `next.config.ts`, `proxy.ts`, `app/api/chat/route.ts`, `lib/chat-history.ts`, `lib/chat-security.ts`, `tests/chat-security.test.mjs`, `tests/rendered-html.test.mjs`, `.github/dependabot.yml` (novo), `tsconfig.json`, `.gitignore`, `SECURITY_AUDIT_REPORT.md`; removidos: `worker/`, `vite.config.ts`, `build/`, `db/`, `drizzle.config.ts`, `drizzle/`, `examples/`, `.openai/`.
