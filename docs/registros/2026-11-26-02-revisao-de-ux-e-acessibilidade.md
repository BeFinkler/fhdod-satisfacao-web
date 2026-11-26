# Revisão de UX e acessibilidade: dashboard em seções, TV sem interação, tamanho do texto e Libras

26/11/2026 · Agente (Claude Code)

> Ticket [13](../tickets/13-revisao-de-ux-e-acessibilidade.md), issue [#25](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/25). Só no front, com o contrato atual da API.
>
> Os cinco blocos de testes passaram e o time gostou do visual. Esta entrega é acabamento para a apresentação ao hospital: o dashboard ganha hierarquia e ajuda, a TV deixa de ter informação que só aparece passando o mouse, e o sistema ganha o tamanho do texto e a tradução para Libras.

## O que foi feito

### Dashboard (`/painel`)

- **Seções com propósito**, na ordem em que a gestão lê os números (`Secao`, em `Pagina.tsx`):
  1. **Visão geral:** o NPS do período em destaque (o número maior da página), com a média de 1 a 5 e as avaliações com nota baixa ao lado.
  2. **Desempenho:** a evolução do NPS e as notas por categoria.
  3. **Comparação entre setores:** o NPS por setor e os melhores e piores pontos.
  4. **Comentários dos pacientes.**
- **Antes**, os blocos tinham todos o mesmo peso, em pares sem relação entre si (o NPS por setor ao lado da evolução; as categorias ao lado do ranking), e os pares tinham alturas muito diferentes, com buracos brancos. O número de respostas aparecia duas vezes, e a legenda de detratores, neutros e promotores quebrava no meio ("notas de 0 a / 6").
- **Visão geral:** a legenda traz o número e o percentual de cada parte. O cartão "Avaliações com nota baixa" leva às respostas baixas e às baixíssimas, com os mesmos filtros da tela ("Ver as baixas", "Ver as baixíssimas"). O link só aparece para quem tem `respostas:ver`.
- **Ajuda contextual:** um botão "?" ao lado do título de cada bloco e dos filtros (`Ajuda`, um *toggletip* com o Popover do Radix). Ele abre com clique, toque ou teclado e fecha com Esc ou tocando fora. O guia "Como ler os indicadores", no topo da página, reúne todos os textos num painel lateral.
- **Os textos da ajuda** ficam num lugar só (`src/features/dashboard/ajuda.ts`) e descrevem as contas da API (`calcular-nps.ts`, `classificar-nota.ts`, `ranking-de-pontos.ts`, `notas-da-escala.ts` e o `dashboard.service.ts`), conferidas no código:
  - promotor, neutro e detrator, e o arredondamento do NPS;
  - por que o NPS do período não é a média dos setores;
  - os limites de nota baixa e baixíssima;
  - o mínimo de 5 notas e o desempate do ranking;
  - a semana de segunda a domingo da evolução;
  - a data do atendimento contra a do envio;
  - quem recebe o telefone na exportação.
- **Filtros:** num painel próprio, separados dos números. A mesma mudança vale para a lista de respostas, que usa o mesmo componente. O menu "Exportar" diz que o arquivo sai com os filtros da tela.
- **Layout pelo espaço do bloco:** os blocos do dashboard e os filtros se rearrumam pela largura que têm (`@container`), e não pela largura da tela. Assim, com o texto ampliado, a página passa a uma coluna antes de apertar o conteúdo.

### TV Wall (`/tv`)

- **Sai a "Evolução do NPS".** O gráfico só dizia o NPS de cada semana pela dica que aparece passando o mouse (o `Tooltip` do Recharts). Na TV ninguém toca, e os eixos sozinhos (+25, +50, a semana de 07/09...) não se leem de longe. As visões que ficam: "Visão geral do mês", "NPS por setor" e "Destaques positivos" (`visoes.ts`).
- **Nada mais depende de mouse ou teclado.** Não havia outra dica escondida na TV. O clique na tela só pede a tela cheia, para quem instala a TV.
- **Nomes longos** de setor quebram em duas linhas, em vez de serem cortados com reticências (`truncate`): o nome cortado também só se leria passando o mouse.
- **Muitos setores:** com mais de 7, o "NPS por setor" se divide em partes ("1 de 2"), uma depois da outra. Antes, os setores a mais ficavam fora da tela.
- **Troca entre visões:** a visão que sai some em 0,45 s. A que entra aparece com os itens subindo um depois do outro (80 ms entre eles) e as barras crescendo da linha de base. Tudo termina em menos de 1,5 s dos 15 s de cada visão, sem piscar nem girar, e o título acompanha. Com "reduzir movimento" ligado, a troca é direta.
- **Contexto:** o mês por extenso abaixo do título ("Novembro de 2026 · todos os setores"), o período dos destaques ("Últimos 30 dias", como diz o contrato) e, abaixo do NPS, "Índice de recomendação, de −100 a +100".
- **Escala da tela:** a fonte da TV passou a acompanhar a menor das proporções da tela, a largura ou a altura. Antes, numa TV HD (1366×768) a tela ficava 22% maior que o desenho, por causa do piso de 14 px. Conferida em 1366×768, 1920×1080 e 3840×2160, sem nada cortado.
- **Mais leve:** o pedaço da TV no build não leva mais o Recharts.

### Acessibilidade

- **Menu "Acessibilidade"** (`MenuAcessibilidade`) no topo do painel, de todas as telas da pesquisa (menos o totem) e do login. Tem o ícone universal de acessibilidade e o nome escrito quando cabe.
- **Tamanho do texto em três níveis:** Normal (100%), Grande (115%) e Muito grande (130%).
  - Como o Tailwind mede tudo em rem, a escala vai para o `font-size` do `<html>`, e texto, espaços, campos, botões, tabelas e cartões crescem juntos. Os eixos dos gráficos, desenhados em px, acompanham pelo `useEscalaDoTexto`.
  - Escolher um tamanho não fecha o menu, para a pessoa ver a página mudar atrás dele.
  - A escolha vale para todas as telas enquanto a pessoa navega e volta ao normal ao recarregar: fica só em memória (`src/stores/acessibilidade.ts`), porque o front não guarda nada no navegador.
- **Libras pelo VLibras**, o tradutor do governo federal, o mesmo dos sites gov.br (`src/lib/vlibras.ts`).
  - O script oficial entra quando o navegador está livre, depois que a tela abriu. Ele tem 2 kB e só desenha o botão azul do VLibras; o avatar e o tradutor baixam quando a pessoa abre o recurso.
  - Abre pelo botão do VLibras e por "Traduzir para Libras", no menu. Sem internet, o item do menu diz que o VLibras está sem conexão e tenta de novo no toque seguinte.
  - No celular, o botão flutuante dele ficaria em cima das opções da pesquisa, então lá o VLibras abre pelo menu.
  - Fica fora da TV, que ninguém toca, e do totem, que não guarda nada entre um paciente e outro.
- **Desempenho da pesquisa:** o menu (o Radix) só baixa quando a pessoa toca no botão, ou passa o mouse ou o foco por ele. Quem abre a pesquisa pelo QR Code não paga os cerca de 19 kB (comprimidos) do menu se não usar.
- **Títulos de verdade:** as seções do dashboard são `h2`, os blocos `h3` e as listas do ranking `h4`, para o leitor de tela pular de seção em seção.

### Correção encontrada no teste

- **A página nova abre no topo.** Quem clicava em "Ver a resposta", no fim do dashboard, caía no meio da lista de respostas, com a rolagem da página anterior. Agora, ao trocar de página por um link, a nova abre no topo (`Raiz.tsx`). Trocar um filtro, que só muda a query string, não sobe a página, e o "Voltar" do navegador fica com a rolagem que ele mesmo devolve. Não usei o `ScrollRestoration` do React Router, que guarda as posições no `sessionStorage`.

## Decisões e por quê

| Decisão | Por quê |
| --- | --- |
| Reorganizar em seções, sem abas nem páginas novas | O pedido era ver primeiro se a reorganização bastava. Bastou: com títulos de seção, o espaço maior entre as seções do que entre os blocos e o NPS como o número maior, a página passa a contar uma história (resultado, tendência, onde agir, o que disseram). Abas esconderiam números que a gestão quer ver juntos |
| A ordem das seções: visão geral, desempenho, comparação entre setores e comentários | É a ordem sugerida pelo time e a de um profissional do hospital diante do painel: como estamos, se está melhorando e em quê, onde agir (os setores e os pontos de atenção) e o que os pacientes disseram |
| Os pares de blocos trocados (evolução com categorias; NPS por setor com o ranking, este mais largo) | Cada par agora tem o mesmo assunto e alturas parecidas, sem os buracos brancos de antes. O ranking ficou mais largo para as duas listas caberem lado a lado |
| Ajuda que abre com clique ou toque (toggletip), e não só passando o mouse | O painel também é usado no celular e no tablet. Segue a regra do Nielsen Norman Group: dica de passar o mouse não carrega o que a pessoa precisa, e no toque o padrão é o de abrir ao tocar. Segue também o padrão *toggletip* do Inclusive Components e o critério 1.4.13 da WCAG (Conteúdo em foco ou ao passar o mouse): dá para fechar com Esc, e a ajuda não some quando o mouse vai para cima dela |
| Um "?" por bloco e um guia completo, com o mesmo texto | O "?" é discreto e fica onde a dúvida aparece. O guia serve a quem abre o painel pela primeira vez e quer ler tudo de uma vez. Um texto só evita que os dois digam coisas diferentes |
| Os textos descrevem a conta da API, sem faixas de "NPS bom" | O pedido era não inventar interpretação. As faixas de mercado (por exemplo, "acima de 50 é excelente") não vêm do sistema nem do hospital. O texto diz o que o número é e o que o sinal significa ("acima de zero, há mais promotores do que detratores") |
| "Ver as baixas" e "Ver as baixíssimas", e não um link só | O filtro de classificação da API é exato (`BAIXA` ou `BAIXISSIMA`), e o front não junta nem recalcula classificação |
| A evolução sai da TV em vez de ganhar números em cima dos pontos | Era a proposta do time. Doze semanas com o número em cada ponto não se leem de longe, e um painel de TV é para bater o olho, não para estudar um gráfico (guia de dashboards de TV do Geckoboard). A evolução continua no dashboard, com a tabela dos números |
| A transição: some rápido, entra em sequência, termina em menos de 1,5 s | Curvas de desaceleração para o que entra e de aceleração para o que sai, como no Material Design. O movimento curto mostra que a tela mudou de assunto, sem roubar tempo de leitura. A sequência guia o olho de cima para baixo, na ordem de leitura. Respeita o `prefers-reduced-motion` (WCAG 2.3.3) |
| O "NPS por setor" em partes de 7 setores | Com a fonte da TV, 7 linhas cabem com folga mesmo com nomes em duas linhas. A escala das barras é a mesma em todas as partes, para elas continuarem comparáveis |
| O tamanho do texto pelo `font-size` do `<html>` | O Tailwind usa rem em tudo, então a página cresce por inteiro, como o zoom do navegador, sem texto cortado nem elementos sobrepostos (WCAG 1.4.4, Redimensionar o texto). Os blocos que precisam se rearrumar usam `@container`, que mede em rem; os breakpoints da tela não mudam com o texto |
| Três níveis, até 130% | O pedido era pelo menos três. Com 130%, o painel em 1366×768 já passa para uma coluna e a pesquisa no celular continua sem rolagem horizontal. Mais que isso, o zoom do navegador faz melhor, porque ele também muda os breakpoints |
| A preferência só em memória | O `AGENTS.md` diz que o front não guarda nada no navegador, e no totem o próximo paciente não pode herdar nada do anterior. A escolha vale enquanto a pessoa navega, como o pedido dizia ("se tecnicamente viável"). Guardá-la entre visitas pede mudar essa regra |
| O VLibras oficial, carregado de vlibras.gov.br | É a solução consolidada do governo federal (o mesmo widget dos sites gov.br), gratuita e mantida por ele. Uma cópia local ficaria desatualizada, e o avatar e o tradutor são do servidor de lá de qualquer jeito |
| VLibras fora da TV e do totem | A TV não tem quem toque. O VLibras guarda no navegador se a janela dele estava aberta (`@vlibras-widget`), e o totem não pode guardar nada entre um paciente e outro. Vale avaliar com o hospital, à parte |
| O menu de acessibilidade carregado no primeiro toque | O plano do front pede que quem abre a pesquisa pelo QR Code não baixe nada que não usa. O botão é o mesmo antes e depois de carregar, e o menu já abre com o foco dentro dele |
| Sem "alto contraste" | As cores do sistema já passam no contraste AA da WCAG, conferido nos registros de 10/11 e 11/11. Um tema de alto contraste completo pede revisar cada cor, inclusive as da escala de rostinhos, e não caberia com qualidade no prazo |

## Ferramentas e skills usadas

- Claude Code, com o painel de navegador, a API da máquina (a `develop` de 26/11) e os dados de demonstração.
- **Referências consultadas:**
  - [NN/g, "Tooltip Guidelines"](https://www.nngroup.com/articles/tooltip-guidelines/);
  - [Inclusive Components, "Tooltips & Toggletips"](https://inclusive-components.design/tooltips-toggletips/);
  - [Geckoboard, visualização para dashboards de TV](https://www.geckoboard.com/blog/data-visualization-for-tv-dashboards-a-teardown);
  - [Material Design, duração e curvas](https://m1.material.io/motion/duration-easing.html);
  - o [manual do VLibras Widget](https://vlibras.gov.br/doc/widget/) e o [repositório oficial](https://github.com/spbgovbr-vlibras/vlibras-web-browsers);
  - as barras de acessibilidade de sites brasileiros que seguem o eMAG, como os [da Unimed](https://www.unimed.coop.br/site/web/encostadaserra/acessibilidade);
  - os critérios da WCAG 2.2 citados na tabela.
- **Revisão:** a skill `web-design-guidelines` não estava disponível nesta sessão, de novo. A revisão foi feita à mão com os mesmos itens:
  - foco visível e teclado nos menus e na ajuda;
  - leitor de tela (títulos, `aria-expanded`, nomes dos botões de ajuda: "Como ler: NPS do período");
  - contraste com as cores do `globals.css`, sem cor nova;
  - alvos de pelo menos 32 px no painel e 44 px no menu;
  - movimento reduzido.

## Como foi verificado

- `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` sem erros.
  - Os testes são 149, em 21 arquivos; eram 137, em 17. Os novos cobrem as visões da TV e a divisão em partes, o tamanho do texto, a carga do VLibras (uma vez só, sem internet e de novo, abrir pelo menu) e a consistência do guia com a ajuda.
- **No navegador**, com a API e os dados de demonstração:
  - **Dashboard em 1366×768 e 375×812:** as quatro seções, o NPS em destaque, os pares de blocos com alturas parecidas, sem rolagem horizontal.
    - "?" do NPS aberto e fechado com Esc. O guia lateral com todas as seções.
    - "Ver as baixas", com o filtro de 7 dias, abriu Respostas no topo com 11 respostas, todas baixas, e o período mantido.
    - Os filtros continuam iguais: "Últimos 90 dias" mudou o endereço, a frase do período e os números. Tocar no Raio-X, no meio da página, filtrou o painel pelo setor sem subir a página, e apareceu "Ver todos os setores".
  - **As outras páginas do painel** (Respostas, Pedidos de retorno, Setores, Perguntas, Categorias e turnos, Usuários e Telas de TV), a pesquisa do `/s/raio-x` e a 404 abriram normalmente, sem erro no console.
  - **Tamanho do texto:**
    - em 130%, o painel passou para uma coluna, sem texto cortado nem nada sobreposto, e os eixos do gráfico cresceram;
    - na pesquisa, no celular, as telas de setores, data, turno, rostinhos, sim e não e a nota de 0 a 10 couberam sem rolagem horizontal (a pesquisa não foi enviada);
    - pelo teclado: abrir o menu, setas, Enter para escolher e Esc devolve o foco ao botão.
  - **VLibras:** "Traduzir para Libras" abriu o widget (v7.12) com o avatar, e tocar em "Visão geral" fez o avatar sinalizar "GERAL". Não foi carregado na TV nem no totem.
  - **TV:**
    - as três visões em 1366×768, 1920×1080 e 3840×2160, sem rolagem nem corte;
    - as animações de entrada terminaram no tempo previsto (conferido pelo `getAnimations()`);
    - o rodapé com três marcadores.
  - **Totem em 768×1024:** sem o menu e sem o VLibras, como antes.
- O console não teve erros depois de recarregar a página. Os erros que apareceram durante a edição eram do HMR do Vite, com o arquivo pela metade.

## O que mudou em relação ao plano

- **TV:** a seção 10 do plano do front lista quatro visões, com a evolução. Agora são três, mais as partes do NPS por setor quando os setores não cabem numa tela. A API continua mandando a `evolucao` no `GET /tv/indicadores`, e o front não a usa mais. O `plano-frontend.md` não foi mudado, como manda a seção 2 dele: a mudança fica neste registro.
- **Menu de acessibilidade e VLibras:** não estão no plano do front, que pedia contraste AA, alvos grandes e teclado (seção 12). O VLibras é um script de fora (vlibras.gov.br), o primeiro do projeto.
- **Ticket:** o número 12 já era o da Ajuda no painel ([#24](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/24)), por isso esta entrega é o ticket 13.

## Pendências e dúvidas

- **Revisão:** o PR entra na `develop` com a aprovação de outra pessoa do time. Depois do merge, a issue #25 é fechada à mão.
- **Prints do PR:** o `AGENTS.md` pede prints no celular e no computador, mas pelo `gh` não dá para anexar imagens. Elas entram pelo GitHub, arrastadas para o PR.
- **Ajuda no painel (#24):** a página "Ajuda" do ticket 12 pode usar os textos de `src/features/dashboard/ajuda.ts`, para o painel não ter duas explicações do NPS.
- **API:** o `GET /tv/indicadores` ainda calcula a evolução, que a TV não mostra mais. Tirá-la economiza uma consulta a cada 30 s por TV, mas muda o contrato: fica para um ticket da API, se o time quiser.
- **Confirmar com o hospital:**
  - o VLibras no totem;
  - guardar o tamanho do texto entre visitas, o que muda a regra de não guardar nada no navegador;
  - um modo de alto contraste.
- **Privacidade:** ao traduzir, o VLibras manda o texto tocado para o serviço do governo. No painel, isso inclui um comentário de paciente, se a pessoa tocar nele com o VLibras aberto. Vale citar no aviso de privacidade do hospital.
