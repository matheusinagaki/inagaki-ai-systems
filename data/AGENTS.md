# Conteúdo público do portfólio

Estas orientações complementam o `AGENTS.md` da raiz.

- `home.ts` contém textos, métricas, trajetória e cards da home; `cases.ts` contém
  os estudos completos usados nas páginas e nos metadados por slug.
- Atualize português e inglês juntos, preservando equivalência de fatos, métricas,
  datas e escopo profissional. Mantenha os formatos `Language` e `CaseStudy` coerentes.
- Slugs dos cards em `homeContent.pt.cases` e `homeContent.en.cases` devem apontar
  para entradas correspondentes em `casesData`. Confira links e metadados ao alterá-los.
- Preserve correspondência de métricas, tecnologias, títulos e resultados entre
  o resumo da home e o case completo, permitindo diferenças editoriais de apresentação.
- Não invente clientes, cargos, resultados ou números. Quando faltar comprovação,
  sinalize a lacuna; sugestões de evolução pertencem ao campo `future`.
- Arquiteturas e fluxos devem refletir o conteúdo confirmado do projeto. Ao criar
  diagramas, não acrescente componentes ou medições apenas por efeito visual.
- Mudanças de fatos também podem afetar `lib/data/`, os componentes de apresentação,
  os metadados e o currículo público; confira os pontos relevantes antes de concluir.
- `tests/rendered-html.test.mjs` fixa alguns textos e métricas intencionalmente.
  Em alterações editoriais aprovadas, atualize as expectativas correspondentes sem
  remover verificações de segurança, acessibilidade ou identidade profissional.
