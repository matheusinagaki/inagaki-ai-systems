# Orientações do repositório

## Contexto e mapa

Portfólio bilíngue de Matheus Inagaki, com estudos de caso e assistente de carreira.
Usa Next.js App Router, React, TypeScript, Tailwind CSS e Framer Motion.

- `app/page.tsx`, `components/sections/` e `app/globals.css`: home e identidade visual.
- `app/case/[slug]/`: páginas de estudos de caso e metadados por projeto.
- `data/home.ts` e `data/cases.ts`: conteúdo público em português e inglês.
- `app/api/chat/route.ts`: integração server-side com OpenRouter pelo AI SDK.
- `lib/chat-*.ts` e `lib/data/`: segurança, histórico e contexto do assistente.
- `proxy.ts`, `next.config.ts` e `app/layout.tsx`: headers, CSP e nonce.

Leia os `AGENTS.md` dos diretórios envolvidos antes de editar seus arquivos.
Ao mudar contratos entre API, helpers e interface, confira os consumidores também.

## Execução e validação

- Use Node.js 22.x e npm; o lockfile do projeto é `package-lock.json`.
- Instale dependências com `npm ci` e inicie o ambiente com `npm run dev`.
- Para mudanças de código, execute `npm run lint` e `npm test`.
  `npm test` já executa o build de produção; não o duplique sem necessidade.
- Os testes usam `node:test`. `tests/rendered-html.test.mjs` inspeciona principalmente
  o código-fonte; não comprova renderização, interação ou acessibilidade no navegador.
- Para mudanças visuais, confira home e cases afetados em desktop e mobile,
  PT/EN, temas claro/escuro e movimento reduzido. Verifique teclado, overflow e layout.
- Mudanças apenas de documentação dispensam build e testes da aplicação.
  Informe qualquer validação que não tenha sido possível executar.

## Interface e conteúdo

- Preserve a identidade visual, os tokens de `app/globals.css` e a hierarquia
  tipográfica. Prefira os componentes e padrões existentes antes de adicionar bibliotecas.
- Mantenha PT/EN equivalentes e os estados de idioma e tema coerentes entre home e cases.
  O chat atualmente responde em português; ele tem uma política própria na API.
- Preserve nomes acessíveis, estados ARIA, navegação por teclado e suporte a
  `prefers-reduced-motion` em CSS, hooks e Framer Motion.
- O título animado usa o texto final invisível para definir largura e quebras de linha,
  com caracteres animados sobrepostos. Preserve essa reserva de espaço para evitar reflow.
- Preserve o texto legível no SSR e evite introduzir diferenças de hidratação.
- Fatos profissionais, métricas e resultados devem ter suporte no conteúdo confirmado.
  Não transforme propostas futuras em realizações já entregues.

## Segurança e configuração

- O nonce é gerado em `proxy.ts` e consumido pelo layout. Não confie no `x-nonce`
  enviado pelo cliente nem exclua prefetch da proteção CSP.
- Headers estáticos em `next.config.ts` também cobrem caminhos excluídos do proxy.
  Confira os dois arquivos ao mudar a política; não flexibilize CSP para resolver erros visuais.
- Mantenha chaves e contexto do chat no servidor. Use `.env.example` para documentar
  configuração; não versione segredos nem reproduza valores de `.env.local` em saídas.
- Ao atualizar dependências, mantenha `package.json` e o lockfile coerentes e confira
  o override de PostCSS: ele não deve rebaixar a dependência para uma versão vulnerável.
- `SECURITY_AUDIT_REPORT.md` registra uma auditoria histórica; confirme as condições
  atuais no código e na configuração antes de afirmar que uma pendência está resolvida.
