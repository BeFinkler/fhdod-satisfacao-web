# Pesquisa geral: escolha dos setores no lugar do Google Forms

26/11/2026 · Agente (Claude Code)

> Ticket [11](../tickets/11-pesquisa-geral.md), issue [#22](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/22). Depende do ticket 21 da API: issue [#44](https://github.com/GabrielPittaBr/fhdod-satisfacao-api/issues/44) e PR [#45](https://github.com/GabrielPittaBr/fhdod-satisfacao-api/pull/45).
>
> O hospital divulga hoje um link do Google Forms. Nele a pessoa escolhe o setor e, no fim, deixa um telefone para retorno. O `/avaliar` substitui esse link: a pessoa marca os setores por onde passou e responde só as perguntas deles, um setor depois do outro. A nota de 0 a 10 vem no fim e vale para todos, e a pesquisa termina com o comentário e o telefone. Na web, o telefone passou a ser a última pergunta para todos, também no `/s/:setor`.

## O que foi feito

### A pesquisa geral (`/avaliar`)

- **Página:** `PesquisaGeralPage`, carregada sob demanda. O pedaço dela no build tem 6,9 kB e não leva nada do painel.
  - Abre com o `GET /publico/pesquisa` e mostra "Abrindo a pesquisa…".
  - Sem rede, mostra a mensagem com "Tentar de novo".
  - Sem setores ativos, mostra "A pesquisa está pausada".
- **Tela de abertura:** a `EscolhaDosSetores`, com os rostos, "Como foi o seu atendimento?", o aviso de anonimato e "Por onde você passou?".
  - Cada setor é um cartão com o nome e a descrição; tocar marca e numera o setor.
  - O rodapé fica preso ao pé da tela, com o resumo ("Você vai avaliar Raio-X e Ambulatório.") e "Começar avaliação".
  - Com um setor só, ele já vem marcado.
- **Perguntas:** as de cada setor, em sequência, com o selo do setor (`MarcadorDoSetor`) acima do título. O leitor de tela ouve o setor no próprio título, por um prefixo escondido.
- **Comentário:** com mais de um setor, a tela pergunta "Sobre qual setor?" (`SetorDoComentario`).
- **Agradecimento:** diz quais setores foram avaliados.

### O estado do fluxo

- **`fluxo-geral.ts`:** o `redutorGeral` embrulha o `redutor` de `fluxo.ts`, e as etapas (voltar, pular, responder, nota, progresso) continuam num lugar só. Ele cuida de:
  - a escolha dos setores, na ordem dos toques;
  - uma chave de envio por setor, mantida se a pessoa volta e muda a escolha;
  - as avaliações gravadas;
  - o setor do comentário.

  Também tem o `montarEnvioGeral`, o `setorDaPergunta` e o `algumaBaixa`, com 10 testes.
- **`useFluxoPesquisaGeral`:** devolve o que o `Etapas` usa (`FluxoDasEtapas`) e mais a escolha dos setores e a do setor do comentário.
- **`useComplemento`:** o comentário e o telefone (o comentário guardado, o envio no `pagehide`, o prazo vencido) saíram do `useFluxoPesquisa` para este hook, que os dois fluxos usam.

### Telefone para todos na web

O `fluxo.ts` ganhou o `telefoneSempre`. O `useFluxoPesquisa` o liga no canal `WEB`, e o totem continua igual. O `telefoneDepoisDoComentario` decide a tela seguinte e o texto do botão: "Continuar" quando o telefone vem depois. A explicação da tela do telefone muda na avaliação normal: "A Ouvidoria pode ligar para conversar sobre a sua avaliação." Há 3 testes novos.

### Reorganização e painel

- **`Etapas`:**
  - recebe a abertura por prop (`abertura`);
  - recebe, opcionais, o setor da pergunta, a escolha do setor do comentário, a pergunta do comentário que vale para a visita toda e os setores avaliados;
  - o tipo de `pesquisa` virou só o que ele usa.

  A abertura de um setor saiu para a `AberturaDoSetor`, a mesma de antes, usada pelo `/s/` e pelo totem.
- **Painel, em Setores:** o bloco "Link geral da pesquisa", só com `setores:gerenciar`, com o link para copiar e a folha do QR Code. A folha agora sai do `LinksDaPesquisa`, que serve ao link geral e ao de cada setor.

### Contrato e documentos

- **Saídas para a pesquisa geral:**
  - a tela de pesquisa indisponível do `/s/` ganhou "Escolher o setor na pesquisa geral" (no totem, não);
  - a 404 ganhou "Avaliar o atendimento".
- **Contrato:** o `pnpm api:tipos` gerou o `schema.d.ts` com o contrato da branch da API. O `tipos.ts` só renomeia (`PesquisaGeral`, `SetorDaPesquisa`, `EnvioGeral` e `RespostaCriadaDoSetor`), e o `api.ts` ganhou o `buscarPesquisaGeral` e o `enviarRespostasGerais`, com 2 testes.
- **Documentos:** o `AGENTS.md` (o estado e as decisões da pesquisa) e o README (a pesquisa no quadro das áreas e o `/avaliar` em "Endereços").

## Decisões e por quê

| Decisão | Por quê |
| --- | --- |
| A abertura junta o acolhimento e a escolha dos setores numa tela só | O Forms também abre direto na escolha. Uma tela de boas-vindas a mais custaria um toque à Sônia e à Camila sem dizer nada novo |
| Os setores numerados pela ordem dos toques, e o mesmo número no selo acima de cada pergunta | A numeração conta uma sequência de verdade: a ordem em que as perguntas vão aparecer, escolhida pela própria pessoa, como o trajeto dela no hospital. O selo é necessário porque setores diferentes têm perguntas iguais ("Como foi o atendimento na recepção?" está no Raio-X e no Ambulatório) |
| O selo desliza só na primeira pergunta de cada setor, e o número "carimba" só ao ser marcado | Movimento só em resposta à pessoa, para mostrar o que mudou; nada se mexe sozinho. O `prefers-reduced-motion` desliga os dois, pela regra global do `globals.css` |
| Nenhuma tela "Agora, sobre o Raio-X" entre um setor e outro | O selo mostra a troca sem custar um toque a mais |
| Uma coluna em todos os tamanhos (`max-w-2xl`), como as outras telas da pesquisa | A ordem de leitura acompanha a ordem do trajeto, e a Sônia lê melhor uma lista no tablet. Em 768×1024 a tela inteira cabe sem rolar |
| Rodapé preso ao pé da tela, com o resumo da escolha | No celular, a lista rola, e o botão fica sempre ao alcance. O resumo diz em palavras o que os números mostram, e é lido pelo leitor de tela a cada mudança (`aria-live`) |
| No celular, a abertura encolhe: rostos de 40 px e título de 1,625rem | No primeiro teste em 360×740, a lista começava abaixo da metade da tela e só um cartão e meio aparecia. Com a abertura menor, aparecem dois cartões e o começo do terceiro, o que mostra que a lista continua |
| Os nomes do resumo e do agradecimento não quebram no meio | O hífen de "Raio-X" quebrava a linha em "Raio-" e "X", como apareceu no teste. Os nomes vão em partes (`partesDaLista`, com o `Intl.ListFormat`), cada uma sem quebra |
| Os cartões têm margem de rolagem embaixo (`scroll-mb-40`) | Assim o cartão com o foco do teclado nunca fica escondido atrás do rodapé preso (WCAG 2.4.11) |
| "Sobre qual setor?" só com mais de um setor, e marcado no primeiro que a API classificou como baixo | O comentário e o telefone são de uma avaliação só (1:1 na API), e chegam ao gestor do setor marcado. O front só lê a classificação da API para escolher o padrão: não decide o que é nota baixa |
| A pergunta do comentário vale para a visita toda ("Quer contar o que aconteceu?" se algum setor foi baixo) | Ela não muda enquanto a pessoa troca o setor do comentário |
| Telefone para todos na web; no totem, só na avaliação baixa | A regra da web é pedido de quem encomendou a tela (o Forms pedia o telefone no fim). O totem fica como está porque é um aparelho público, com a fila esperando |
| O fluxo geral embrulha o redutor de um setor, em vez de copiá-lo | As regras das etapas, já testadas, continuam num lugar só. O fluxo de um setor só ganhou o `telefoneSempre`, e os testes antigos continuam passando sem mudança |
| As mesmas cores, fonte, botões e cartões da pesquisa, sem cor nova | O `AGENTS.md` manda seguir as decisões de interface de 10/11 e 11/11. A tela nova usa o verde-petróleo para a escolha, o âmbar para o erro e os rostos como identidade |
| O link geral no painel só para o Super Admin | É um link do hospital inteiro, que só o Super Admin divulga. O gestor continua vendo só os QR Codes dos seus setores |

## Ferramentas e skills usadas

- Claude Code, com o plugin `frontend-design`. O plano de design ficou no plano da entrega e foi revisado contra o pedido antes do código. Trocas dessa revisão:
  - a grade de duas colunas virou uma coluna;
  - "Continuar →" virou "Começar avaliação";
  - a tela entre setores virou o selo animado;
  - o ✓ dos cartões virou o número.
- O painel de navegador do Claude Code, com a API e o front da máquina e os dados de demonstração.
- A skill `web-design-guidelines` não estava disponível nesta sessão. A revisão foi feita à mão com os mesmos itens:
  - foco visível;
  - teclado;
  - leitor de tela (`aria-pressed`, `aria-live`, o prefixo escondido no título);
  - contraste com as cores do `globals.css`;
  - alvos de pelo menos 48 px (os cartões têm 72 px);
  - texto de pelo menos 18 px;
  - movimento reduzido.

## Como foi verificado

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (137 testes, em 17 arquivos; eram 122) e `pnpm build` sem erros.
- **No navegador**, com a API da branch `feat/21-pesquisa-geral` e os dados de demonstração:
  - **Dois setores, em 360×740:**
    - marquei Raio-X (1) e Ambulatório (2), voltei da data para a escolha (os dois continuaram marcados) e comecei;
    - as perguntas do Raio-X vieram com o selo "1 Raio-X", e as do Ambulatório com "2 Ambulatório";
    - nota 9 e "Enviar avaliação";
    - "Sobre qual setor?" veio com o Raio-X marcado, porque a nota 2 dele deixou a avaliação baixa. Troquei para o Ambulatório, escrevi um comentário, deixei um telefone fictício com a autorização e cheguei a "Você avaliou Raio-X e Ambulatório.";
    - no banco, o comentário e o pedido de retorno ficaram no Ambulatório, e o pedido apareceu em Pedidos de retorno, mascarado.
  - **`/s/pronto-atendimento` com nota 10:** o comentário mostrou "Continuar", e "Agora não" levou ao telefone, com a explicação da avaliação normal.
  - **Totem com nota 10:** "Enviar comentário" e fim, sem telefone, como antes.
  - **Falha no envio:** com a API parada, apareceu o aviso em âmbar com "Tentar de novo"; com a API de volta, a nova tentativa gravou uma avaliação só.
  - **Saídas para a pesquisa geral:** a pesquisa indisponível (`/s/maternidade`) e a 404 mostraram os links para ela.
  - **Painel em 1366×768:** o Super Admin viu o bloco do link geral em Setores e abriu o QR Code com a folha.
  - **Tamanhos:** 360×740, 768×1024 e 1366×768, sem rolagem horizontal. No teclado, Tab percorre os setores e Espaço marca, com o foco visível.
- O console do navegador não teve erros além dos esperados: o 502 da API parada e o 404 do setor desativado.

## O que mudou em relação ao plano

- **Telefone:** o plano do front (seção 7) oferecia o telefone só na avaliação baixa. Na web, agora é para todos, como mudou a regra "Retorno ao paciente" do Plano de Desenvolvimento, que vale mais que o do front. O `plano-frontend.md` não foi mudado, como manda a seção 2 dele: a mudança fica neste registro.
- **Rota nova:** a rota `/avaliar` não está no plano do front. Ela entrou no Plano de Desenvolvimento, no PR da API.

## Pendências e dúvidas

- **Revisão:** o PR entra na `develop` depois do PR #45 da API, com a aprovação de outra pessoa do time. Depois do merge, a issue #22 é fechada à mão.
- **Prints do PR:** o `AGENTS.md` pede prints no celular e no computador, mas pelo `gh` não dá para anexar imagens. Elas entram pelo GitHub, arrastadas para o PR.
- **Confirmar com o hospital:**
  - o telefone oferecido a todos na web (mais telefones guardados, também de pacientes satisfeitos);
  - o endereço `/avaliar` para o QR Code e o WhatsApp.
- **Próximos passos possíveis:**
  - a pesquisa geral também no totem;
  - escolher quais setores aparecem no link geral;
  - o NPS geral contando cada pessoa uma vez (no registro da API).
- **Dados de teste no banco de desenvolvimento:** o teste no navegador gravou 5 avaliações, com um comentário e um telefone fictício. O `pnpm db:demo` da API as substitui.
