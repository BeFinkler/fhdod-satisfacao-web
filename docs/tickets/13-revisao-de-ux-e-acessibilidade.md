# 13 — Revisão de UX e acessibilidade: dashboard em seções, TV sem interação, tamanho do texto e Libras

**Issue:** [#25](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/25). O número não é o do ticket porque o 24 já era a issue do ticket 12.

**O que construir:** A revisão de experiência e acessibilidade antes da apresentação ao hospital. Os cinco blocos de testes passaram; o que falta é acabamento, sem refazer o visual nem mexer na API.

1. **Dashboard:** os blocos estavam todos com o mesmo peso, em pares que não tinham a ver um com o outro. A página passa a ter seções com propósito ("Visão geral", "Desempenho", "Comparação entre setores" e "Comentários dos pacientes"), com o NPS do período em destaque. Cada bloco ganha um botão de ajuda (abre com clique, toque ou teclado, não só passando o mouse), e a página, o guia "Como ler os indicadores", com o que cada número significa e como a API o calcula. Os filtros e a exportação continuam em cima de tudo.
2. **TV Wall:** a terceira visão, "Evolução do NPS", só dizia o número de cada semana passando o mouse no gráfico, e na TV ninguém toca. Ela sai da rotação. As visões que ficam se leem de longe, sem interação, e a troca entre elas fica suave.
3. **Acessibilidade:** um menu "Acessibilidade" no topo do painel, da pesquisa e do login, com o tamanho do texto em três níveis e a tradução para Libras pelo VLibras, do governo federal.

**Bloqueado por:** nenhum. É só no front, com o contrato atual da API.

**Relacionado:** a Ajuda no painel ([#24](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/24), ticket 12) pode reaproveitar os textos de `src/features/dashboard/ajuda.ts`, que explicam os indicadores pelas contas da API.

**Status:** done

**Critérios de aceite:**

- [x] O dashboard é dividido em seções com título e propósito, e o NPS do período é o número de maior destaque, com a média de 1 a 5 e as avaliações com nota baixa ao lado.
- [x] Cada bloco do dashboard e os filtros têm um botão de ajuda acessível (clique, toque e teclado; fecha com Esc), e o guia "Como ler os indicadores" reúne todos os textos. Os textos descrevem as contas da API, sem interpretação inventada.
- [x] "Avaliações com nota baixa" leva às respostas baixas e baixíssimas, com os mesmos filtros da tela.
- [x] Os filtros e a exportação continuam funcionando, no mesmo lugar.
- [x] A TV alterna só visões que se leem sem tocar: a visão geral, o NPS por setor (em partes, se os setores não couberem numa tela) e os destaques positivos. A evolução por semana sai da rotação.
- [x] A troca de visão na TV é suave e curta, sem atrapalhar a leitura, e respeita o "reduzir movimento".
- [x] A TV cabe inteira em 1366×768, 1920×1080 e 3840×2160.
- [x] O menu "Acessibilidade" fica no painel, na pesquisa e no login, com o tamanho do texto em três níveis, que vale para todas as telas enquanto a pessoa navega, sem nada guardado pelo front no navegador.
- [x] Com o texto ampliado, a página se rearruma sem texto cortado nem elementos sobrepostos, em tabelas, cartões, formulários e gráficos.
- [x] O VLibras abre pelo menu e pelo botão dele e traduz o texto tocado. Ele fica fora da TV e do totem.
- [x] Quem abre a pesquisa pelo QR Code não baixa o menu de acessibilidade antes de tocar nele.
- [x] A tela funciona em 360×740, 768×1024 e 1366×768, sem rolagem horizontal, com toque, mouse e teclado.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam, e a entrega fica registrada em `docs/registros/`.
