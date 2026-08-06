# Auditoria de Segurança White-Box — inagaki-ai-systems

**Data:** 2026-08-06
**Escopo:** Repositório completo (`app/`, `components/`, `lib/`, `db/`, `worker/`, `examples/`, configs, dependências, histórico git)
**Metodologia:** Revisão manual de 100% dos arquivos-fonte rastreados, taint analysis das entradas do usuário até o destino, revisão de configuração de deploy/CSP/headers, revisão de histórico git em busca de segredos vazados.

---

## Resumo Executivo

A aplicação é um portfólio Next.js 16 (App Router, deploy na Vercel) com um assistente de chat RAG (`app/api/chat/route.ts`) que usa OpenRouter/DeepSeek sobre um dossiê profissional estático. Diferente da maioria dos portfólios, o projeto já implementa **defesa em profundidade deliberada** no único endpoint de risco real (`/api/chat`):

- Validação estrita de payload (shape, papéis alternados, tamanho, contagem de mensagens)
- Histórico de conversa **assinado com HMAC-SHA256** (`lib/chat-history.ts`) com `timingSafeEqual`, impedindo forjar turnos do assistente ou reescrever o histórico enviado de volta pelo cliente
- Cookie de sessão `HttpOnly; Secure; SameSite=Strict; Path=/api/chat`
- Checagem de mesma origem (`isSameOriginRequest`) como proteção CSRF adicional
- Rate limiting por cliente e global, com fallback local em memória e suporte a Redis distribuído (Upstash)
- Filtro de prompt injection na entrada **e** guarda de vazamento na saída do modelo (`guardModelOutput`), incluindo detecção de overlap com o material de referência via shingling, bloqueio de URLs não confiáveis e de blobs codificados
- CSP estrita com nonce por requisição, `strict-dynamic`, `frame-ancestors 'none'`, `object-src 'none'`, sem `unsafe-inline`/`unsafe-eval` em produção
- Nenhum uso de `Host` header não confiável para montar URLs (usa `VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL`, controlados pela plataforma)
- Nenhum sink de `exec`/`eval`/`child_process`, nenhuma leitura de arquivo com caminho controlado pelo usuário, nenhuma query SQL manual (o único código com DB é um scaffold morto usando Drizzle ORM parametrizado)

**Nenhuma vulnerabilidade Crítica ou Alta foi encontrada.** Os achados abaixo são de severidade Média/Baixa/Informativa, majoritariamente relacionados a robustez operacional (rate limit distribuído em produção) e higiene de repositório (logs de build versionados), não a falhas exploráveis de RCE/SSRF/XSS/SQLi/auth bypass.

Uma correção segura e de baixo risco já foi aplicada nesta sessão (ver [Vulnerabilidades Baixas → #2](#2-logs-de-deploy-versionados-no-git-corrigido)).

---

## Mapa da Superfície de Ataque

| Camada | Detalhes |
|---|---|
| Framework | Next.js 16.2.6 (App Router), React 19.2.6, TypeScript 5.9.3 |
| Hosting | Vercel (confirmado via `.vercel/repo.json`, `deploy*.log`) |
| Middleware | `proxy.ts` — nome novo do `middleware.ts` no Next 16, confirmado ativo (`.next/server/middleware.js` gerado) |
| Único endpoint dinâmico | `POST /api/chat` (`app/api/chat/route.ts`) — todo o resto é estático/prerenderizado |
| LLM | `deepseek/deepseek-chat` via OpenRouter (`@ai-sdk/openai` + `ai` SDK) |
| Autenticação | Nenhuma (site público). "Sessão" = cookie assinado apenas para integridade do histórico de chat, não para autorização de usuário |
| Banco de dados | Nenhum em produção. `db/`, `drizzle.config.ts`, `worker/index.ts`, `examples/d1/**` são scaffold morto de um template Cloudflare Workers/D1 (`vinext`) que **não está instalado** (`vinext` ausente de `package.json`/`node_modules`) e não é usado no build/deploy real |
| Segredos | `OPENROUTER_API_KEY`, `CHAT_SIGNING_SECRET` (opcional), `UPSTASH_REDIS_REST_URL/TOKEN` (opcional). Corretamente fora do git (`.env*` no `.gitignore`, exceto `.env.example`) |
| Cookies | `portfolio_chat_session` — `HttpOnly`, `Secure` (quando https), `SameSite=Strict`, `Path=/api/chat`, `Max-Age=24h` |
| CSP/Headers | `proxy.ts` define CSP com nonce, HSTS (prod), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP`, `X-Permitted-Cross-Domain-Policies` |
| CORS | Nenhum CORS explícito (sem `Access-Control-Allow-Origin`) — same-origin por padrão |
| Testes | `tests/chat-security.test.mjs` e `tests/rendered-html.test.mjs` cobrem boa parte dos controles acima como regressão |

---

## Vulnerabilidades Críticas

Nenhuma encontrada.

## Vulnerabilidades Altas

Nenhuma encontrada.

## Vulnerabilidades Médias

### 1. Rate limiting não é distribuído em produção (multiplicação de custo/quota via múltiplas instâncias serverless)

- **Severidade:** Média — CVSS 3.1 aproximado `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L` ≈ **5.3**
- **CWE:** CWE-799 (Improper Control of Interaction Frequency) / CWE-400 (Uncontrolled Resource Consumption)
- **OWASP:** API4:2023 (Unrestricted Resource Consumption)
- **Arquivo:** [lib/chat-security.ts](lib/chat-security.ts) — funções `checkChatRateLimit` (linha 137) e `getDistributedRateLimitConfig` (linha 356)
- **Risco:** O limitador local (`consumeRateLimit`) usa um `Map` em memória do processo (`rateLimitStore`, linha 37). Em uma plataforma serverless como a Vercel, cada instância/lambda tem sua própria memória isolada. O limite "global" de `150` requisições/10min e o limite "por cliente" de `12`/10min só são reais se a plataforma escalar para **uma única instância**. Sob carga (ou ataque distribuído com poucos IPs diferentes, ou repetição por região), múltiplas instâncias podem ser criadas em paralelo, cada uma com seu próprio contador zerado — multiplicando o número real de chamadas ao modelo pago (OpenRouter) muito além do limite anunciado.
- **Confirmação de exposição real:** o arquivo `.env.local` do projeto **não** define `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (nem `KV_REST_API_URL`/`KV_REST_API_TOKEN`), que são os únicos gatilhos para `checkDistributedRateLimit` (linha 362) ser usado em vez do fallback em memória. Se as mesmas variáveis não estiverem configuradas no ambiente de produção da Vercel, o app está rodando **apenas** com o limitador local, fragmentado por instância.
- **Exploração possível:** um atacante que dispare rajadas de requisições válidas (respeitando o schema/assinatura HMAC do histórico, o que é trivial pois o próprio endpoint retorna a assinatura necessária a cada resposta) a partir de várias regiões/conexões pode acionar múltiplas instâncias serverless simultâneas e consumir o orçamento de tokens/créditos do OpenRouter muito acima do esperado (~150 respostas/10min), gerando custo financeiro para o dono do projeto — uma forma de *Denial of Wallet*.
- **Impacto:** Financeiro/disponibilidade (esgotamento de créditos da API do LLM, possível suspensão do serviço). Sem impacto de confidencialidade/integridade — o `guardModelOutput` e a assinatura HMAC continuam protegendo mesmo sob esse cenário.
- **Como reproduzir:** Disparar >150 requisições válidas de `/api/chat` em <10 minutos a partir de conexões/IPs distintos o suficiente para provocar auto-scaling de funções na Vercel, e observar que o total de respostas geradas excede o limite documentado.
- **Código atual (trecho relevante):**
```ts
// lib/chat-security.ts
export async function checkChatRateLimit(request: Request): Promise<RateLimitResult> {
  const distributedConfig = getDistributedRateLimitConfig();
  if (distributedConfig) {
    return checkDistributedRateLimit(request, distributedConfig);
  }
  // fallback local em memória por instância — não é global entre instâncias
  ...
}
```
- **Correção recomendada:** Não é uma falha de código (o fallback distribuído já está implementado e testado) — é uma lacuna de **configuração de produção**. Ação recomendada:
  1. Provisionar um banco Upstash Redis (gratuito no tier básico) e configurar `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (ou usar o addon "Vercel KV", que expõe `KV_REST_API_URL`/`KV_REST_API_TOKEN` automaticamente) nas variáveis de ambiente de produção da Vercel.
  2. Opcionalmente, adicionar um teto de gasto ("spend cap") na conta OpenRouter como camada extra de proteção contra *Denial of Wallet*, independente do rate limit da aplicação.
- **Melhor prática:** Rate limiting em ambientes serverless multi-instância deve sempre usar um armazenamento compartilhado (Redis, banco, etc.); o fallback em memória só deve ser tratado como proteção "best-effort" para desenvolvimento local.
- **Referência:** OWASP API Security Top 10 2023 — API4 Unrestricted Resource Consumption; CWE-799.

---

## Vulnerabilidades Baixas

### 1. `CHAT_SIGNING_SECRET` opcional deriva do `OPENROUTER_API_KEY` quando ausente

- **Severidade:** Baixa — CVSS aproximado `AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N` ≈ **3.7**
- **CWE:** CWE-321 (Use of Hard-coded Cryptographic Key) — parcialmente aplicável; mais precisamente, acoplamento de dois segredos de domínios diferentes
- **Arquivo:** [app/api/chat/route.ts:56-57](app/api/chat/route.ts#L56-L57), [lib/chat-history.ts:34-38](lib/chat-history.ts#L34-L38)
- **Risco:** Quando `CHAT_SIGNING_SECRET` não está definida, o segredo usado para assinar o histórico do chat (HMAC-SHA256) é derivado deterministicamente da própria `OPENROUTER_API_KEY` (`deriveChatSigningSecret`). A derivação em si é criptograficamente correta (HMAC, não reversível, e o segredo derivado ≠ a chave original), então isso **não é explorável hoje**. O risco é operacional: (a) qualquer vazamento futuro da API key (ex. em um log mal configurado, num erro não tratado, numa integração de terceiros) também compromete a integridade do histórico de chat assinado; (b) rotacionar a API key invalida silenciosamente todas as sessões de chat ativas.
- **Confirmação:** `.env.local` do projeto não define `CHAT_SIGNING_SECRET` — apenas `OPENROUTER_API_KEY` e `VERCEL_OIDC_TOKEN`. Recomenda-se confirmar que a variável está de fato definida no ambiente de produção da Vercel (o `.env.example` já documenta isso corretamente).
- **Correção recomendada:** Definir explicitamente `CHAT_SIGNING_SECRET` (32+ bytes aleatórios, ex. `openssl rand -base64 32`) nas variáveis de ambiente de produção, isolando os dois segredos.
- **Referência:** CWE-321; princípio de separação de segredos por domínio de uso.

### 2. Logs de deploy versionados no git (CORRIGIDO nesta sessão)

- **Severidade:** Baixa — CVSS aproximado `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N` ≈ **2.0** (informativo/higiene)
- **CWE:** CWE-532 (Insertion of Sensitive Information into Log File), aplicado a versionamento
- **Arquivo:** `deploy.log`, `deploy2.log` (raiz do repositório)
- **Risco:** Os arquivos `deploy.log`/`deploy2.log` (saída do `vercel deploy`) estavam versionados no git, e **não** estavam cobertos pelo `.gitignore` (que só ignorava `npm-debug.log*`, `yarn-*.log*`, `.pnpm-debug.log*`). Inspecionei o conteúdo e todo o histórico do arquivo — não há segredos, tokens ou credenciais nos logs atuais, apenas nomes de projeto/organização Vercel e timings de build. Ainda assim, arquivos de log de deploy são exatamente o tipo de artefato que futuramente pode conter algo sensível (por exemplo, se alguém rodar `vercel --debug` ou a CLI passar a ecoar variáveis de ambiente), e não deveriam fazer parte do histórico do repositório.
- **Ação tomada:** Adicionado `deploy*.log` ao [.gitignore](.gitignore) e executado `git rm --cached deploy.log deploy2.log` (os arquivos continuam no disco local, apenas saem do rastreamento do git). **As mudanças estão staged mas não commitadas** — revise com `git status` e faça o commit quando quiser.
- **Recomendação adicional:** Como os arquivos já estão no histórico do git (commits anteriores), considere se vale reescrever o histórico (`git filter-repo`) — geralmente não vale a pena aqui, já que confirmei que não há segredos nesses commits.

### 3. Scaffold morto de Cloudflare Workers/D1/Vite aumenta a superfície auditável sem necessidade

- **Severidade:** Informativa/Baixa
- **CWE:** CWE-1164 (Irrelevant Code)
- **Arquivos:** `worker/index.ts`, `vite.config.ts`, `build/sites-vite-plugin.ts`, `db/index.ts`, `db/schema.ts`, `drizzle.config.ts`, `examples/d1/**`, `.openai/hosting.json`
- **Risco:** Esses arquivos implementam um caminho de deploy alternativo (Cloudflare Workers + D1 via `vinext`) que **não está instalado** (`vinext` não consta em `package.json`/`node_modules`) e não é usado pelos scripts reais (`next dev`/`next build`/`next start`). Não é explorável hoje, mas: (a) confunde a superfície real de ataque durante auditorias futuras; (b) se alguém um dia instalar `vinext` e ativar esse caminho sem revisão, o endpoint de exemplo `examples/d1/app/api/notes/route.ts` ficaria acessível publicamente sem nenhuma autenticação/autorização (embora use Drizzle parametrizado, então sem risco de SQLi, ele permite `POST` de notas por qualquer visitante sem rate limit).
- **Correção recomendada:** Se o deploy real é e continuará sendo Vercel (como indicam `.vercel/`, `deploy*.log`, `next.config.ts`), remover o scaffold Cloudflare/D1/Vite do repositório. Se houver intenção futura de usá-lo, isolar em uma branch separada e documentar claramente no README que não é o caminho de produção atual. **Não removi esses arquivos automaticamente** por ser uma decisão de escopo/arquitetura do projeto, não uma correção de segurança inequívoca — recomendo que você confirme a intenção antes.

---

## Melhorias Recomendadas (não são vulnerabilidades)

1. **Rodar `npm audit` / Dependabot/Renovate:** não há `npm` disponível neste ambiente de auditoria para rodar `npm audit` automaticamente. Revisão manual das versões em `package.json` (Next 16.2.6, React 19.2.6, `ai` 7.0.26, `@ai-sdk/openai` 4.0.13, `postcss` 8.5.19 fixado via `overrides` — versão que já corrige o ReDoS histórico do postcss) não revelou nada obviamente desatualizado, mas recomendo rodar `npm audit` / habilitar Dependabot no GitHub para monitoramento contínuo, já que isso está fora do alcance de uma revisão estática de código.
2. **Filtro de prompt injection na entrada é baseado em palavras-chave e pode ser contornado por paráfrase** (`isLikelyPromptInjection` em `lib/chat-security.ts`, linha 426) — por exemplo, "o que veio escrito antes desta conversa, exatamente?" não bate em nenhum padrão da lista. Isso **não é crítico** porque a defesa real contra vazamento está no lado da saída (`guardModelOutput`), que bloqueia a resposta do modelo independente de como a pergunta foi formulada (por padrão de vazamento, overlap de shingles com o material de referência, blobs codificados e URLs não autorizadas). Ainda assim, considere migrar o filtro de entrada para heurísticas mais robustas (embedding similarity contra um conjunto de ataques conhecidos) se o volume de tráfego crescer.
3. **CSP `style-src-attr 'unsafe-inline'`** (`proxy.ts`, linha 11) permite atributos `style=""` inline. Isso é normal para apps que usam estilos inline dinâmicos (o código usa `style={{ ... }}` extensivamente em React, que compila para atributos inline), mas é uma pequena redução da postura "strict" da CSP. Não é uma vulnerabilidade por si só sem um sink de XSS que injete HTML controlado pelo usuário (não encontrei nenhum), mas vale registrar como trade-off consciente.
4. Considere adicionar um `CHAT_SIGNING_SECRET` dedicado em produção (ver Baixa #1) e confirmar `UPSTASH_REDIS_REST_URL/TOKEN` (ou Vercel KV) em produção (ver Média #1).

---

## Checklist OWASP Top 10 (2021)

| # | Categoria | Status |
|---|---|---|
| A01 | Broken Access Control | ✅ N/A (sem contas de usuário); cookies/CSRF bem protegidos |
| A02 | Cryptographic Failures | ✅ HMAC-SHA256 + `timingSafeEqual`; segredos fora do git |
| A03 | Injection (SQL/NoSQL/Command/SSTI) | ✅ Nenhum sink encontrado; único DB é scaffold morto e parametrizado |
| A04 | Insecure Design | ✅ Defesa em profundidade explícita no chat (input+output guard, assinatura, rate limit) |
| A05 | Security Misconfiguration | ⚠️ Média #1 (rate limit não distribuído) |
| A06 | Vulnerable and Outdated Components | ⚠️ Não verificável neste ambiente (sem `npm`); recomendar `npm audit`/Dependabot |
| A07 | Identification and Authentication Failures | ✅ N/A (sem login) |
| A08 | Software and Data Integrity Failures | ✅ Lockfile presente; sem deserialização insegura |
| A09 | Security Logging and Monitoring Failures | ⚠️ Erros logados só no servidor (bom para não vazar ao cliente), mas sem monitoramento/alerta externo configurado — fora do escopo de código |
| A10 | Server-Side Request Forgery (SSRF) | ✅ Nenhuma URL controlada pelo usuário é usada para requisições server-side |

## Checklist OWASP API Security Top 10 (2023)

| # | Categoria | Status |
|---|---|---|
| API1 | Broken Object Level Authorization | ✅ N/A |
| API2 | Broken Authentication | ✅ N/A (sem auth de usuário) |
| API3 | Broken Object Property Level Authorization | ✅ N/A |
| API4 | Unrestricted Resource Consumption | ⚠️ Média #1 |
| API5 | Broken Function Level Authorization | ✅ N/A |
| API6 | Unrestricted Access to Sensitive Business Flows | ✅ Rate limit + validação de payload |
| API7 | Server Side Request Forgery | ✅ OK |
| API8 | Security Misconfiguration | ✅ CSP/headers fortes |
| API9 | Improper Inventory Management | ⚠️ Baixa #3 (scaffold morto) |
| API10 | Unsafe Consumption of APIs | ✅ Timeout (25s) e limite de tokens na chamada ao OpenRouter |

## Checklist ASVS (amostragem V2–V13, nível 1-2)

| Área | Status |
|---|---|
| V3 Session Management | ✅ Cookie HttpOnly/Secure/SameSite=Strict, HMAC assinado, expiração 24h |
| V4 Access Control | ✅ N/A |
| V5 Validation, Sanitization | ✅ Validação estrita de shape/tamanho/sequência de mensagens |
| V7 Error Handling and Logging | ✅ Mensagens genéricas ao cliente, detalhe só em log de servidor |
| V9 Communications | ✅ HSTS, HTTPS forçado em prod |
| V11 Business Logic | ⚠️ Média #1 |
| V12 Files and Resources | ✅ Sem upload; leitura de arquivo com caminho fixo, não controlado por usuário |
| V13 API and Web Service | ✅ Same-origin enforcement, CSP, sem CORS aberto |
| V14 Configuration | ⚠️ Baixa #1/#2/#3 |

## Checklist IA/LLM (OWASP LLM Top 10)

| # | Categoria | Status |
|---|---|---|
| LLM01 Prompt Injection | ✅ Defesa em profundidade (filtro de entrada + guarda de saída); ver Melhoria #2 |
| LLM02 Insecure Output Handling | ✅ Saída renderizada como texto React puro (sem `dangerouslySetInnerHTML`); apenas links de uma allowlist viram `<a>` |
| LLM03 Training Data Poisoning | ✅ N/A (sem fine-tuning; RAG usa arquivos estáticos versionados no repo) |
| LLM04 Model Denial of Service | ⚠️ Média #1 (mitigado parcialmente por `maxOutputTokens`, timeout, rate limit) |
| LLM05 Supply Chain | ✅ Modelo consumido via API (OpenRouter), sem pesos locais |
| LLM06 Sensitive Information Disclosure | ✅ `guardModelOutput` bloqueia overlap com material de referência, blobs codificados e prompt leakage; teste automatizado confirma ausência de PII no `knowledge_base.txt` |
| LLM07 Insecure Plugin Design | ✅ N/A (sem tool calling/plugins) |
| LLM08 Excessive Agency | ✅ N/A (sem ferramentas/ações autônomas) |
| LLM09 Overreliance | N/A (fora do escopo técnico) |
| LLM10 Model Theft | ✅ N/A (modelo de terceiros via API) |

---

## Score Geral de Segurança: **88/100**

Justificativa: nenhuma falha Crítica/Alta; uma falha Média de configuração operacional (rate limit distribuído ausente em produção); achados Baixos majoritariamente de higiene (um já corrigido nesta sessão). A postura geral do código — assinatura HMAC do histórico, guarda de saída do LLM, CSP com nonce, cookies corretos, ausência de sinks de injeção — está bem acima da média para um projeto deste porte.

---

## Próximos Passos Priorizados

1. **[Média]** Configurar `UPSTASH_REDIS_REST_URL`/`TOKEN` (ou Vercel KV) em produção para tornar o rate limit realmente global entre instâncias serverless.
2. **[Baixa]** Definir `CHAT_SIGNING_SECRET` dedicado em produção, independente da `OPENROUTER_API_KEY`.
3. **[Baixa]** Commitar a remoção de `deploy.log`/`deploy2.log` do rastreamento do git (já staged nesta sessão) e revisar se vale reescrever histórico.
4. **[Informativo]** Decidir o destino do scaffold Cloudflare Workers/D1/Vite morto (`worker/`, `vite.config.ts`, `db/`, `drizzle.config.ts`, `examples/d1/`, `.openai/`) — remover se não houver plano de uso, ou isolar/documentar claramente.
5. **[Operacional]** Rodar `npm audit` (ou habilitar Dependabot/Renovate) em um ambiente com `npm` disponível — não pude executar isso nesta sandbox.
6. **[Opcional]** Configurar um teto de gastos ("spend cap") na conta OpenRouter como segunda camada contra *Denial of Wallet*.

---

*Nenhuma segunda rodada de auditoria foi necessária (Etapa 12): não há vulnerabilidades Média/Alta/Crítica remanescentes que exijam correção de código — o único achado Médio é de configuração de ambiente de produção, fora do escopo de um patch de código.*
