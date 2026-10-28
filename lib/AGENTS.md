# Helpers e contexto do assistente

Estas orientações complementam o `AGENTS.md` da raiz e cobrem também `lib/data/`.

## Fronteira entre servidor e navegador

- `chat-security.ts` e `chat-history.ts` usam APIs do servidor. Não os importe em
  componentes client-side; `chat-links.ts`, `chat-constants.ts` e `utils.ts` são
  compartilhados com a interface e devem continuar seguros para uso no navegador.
- Preserve os imports relativos com extensão `.ts` usados pelos helpers:
  os testes importam esses módulos diretamente com o type stripping do Node.

## Invariantes de segurança

- Valide payloads não confiáveis, alternância de papéis, tamanhos e saudação inicial.
  Metadados de mensagens do assistente precisam ser verificados pelo servidor.
- Assinaturas HMAC vinculam texto, sequência do histórico, timestamps e sessão.
  Preserve expiração, comparação em tempo constante e rejeição de adulterações.
- Preserve o mínimo de força do segredo configurado e a derivação segura de fallback.
  Cookies de sessão devem manter escopo, `HttpOnly`, `SameSite=Strict` e `Secure` em HTTPS.
- O fallback de rate limit em memória vale por instância; não o descreva como um
  limite global de produção. Preserve o aviso de configuração ausente na Vercel.
- No limitador distribuído, mantenha consumo atômico, TTL e timeout. Uma falha do
  Redis configurado não deve liberar geração ilimitada nem cair silenciosamente no fallback.
- Confie em headers de proxy apenas nos contextos explicitamente habilitados.
- `safePublicProfileUrl` usa URLs HTTPS de perfis exatos. Não substitua a validação
  por correspondências de substring de domínio ou renderização de HTML do modelo.
- Guards de entrada e saída complementam o prompt. Não remova essas camadas por
  considerar que as instruções ao modelo bastam.

## Material de referência e testes

- `lib/data/summary.txt` e `knowledge_base.txt` contêm contexto profissional curado.
  Não acrescente dados privados, e-mails, telefones ou instruções executáveis para o modelo.
- Preserve nomes públicos reais e fatos confirmados. Ao mudar um fato compartilhado,
  confira também `data/home.ts` e `data/cases.ts` sem copiar conteúdo irrelevante entre bases.
- Cubra mudanças de segurança com testes de aceitação e rejeição relevantes em
  `tests/chat-security.test.mjs`. Para uma execução focada, use
  `node --experimental-strip-types --test tests/chat-security.test.mjs`.
  A validação completa de mudanças de código continua sendo a definida na raiz.
