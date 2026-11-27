# Ajuda no painel e instruções para colocar a TV no ar

26/11/2026 · Agente (Claude Code)

> Ticket [12](../tickets/12-ajuda-no-painel.md), issue [#24](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/24). Só no front, sem mexer na API.
>
> Quem não desenvolve o sistema não achava nele como colocar a TV no ar: o único endereço de TV estava no README, no GitHub, e era o da demonstração. Também não havia um lugar para tirar dúvidas nem para saber com quem falar. Agora o painel tem a Ajuda, e o passo a passo da TV aparece onde a pessoa precisa dele.

## O que foi feito

- **Item "Ajuda" no menu** (`CircleQuestionMark`), no fim da lista, num grupo próprio, no computador e no celular.
  - É o primeiro item sem permissão: o `MENU` saiu do `PainelLayout.tsx` para o `components/layout/menu.ts`, com a `permissoes` opcional e o `gruposDoMenu`, que filtra pela lista do `/auth/me`.
  - Cada item ganhou uma `descricao`, o texto que a Ajuda mostra.
- **Página `/painel/ajuda`** (`features/ajuda/`), aberta a qualquer sessão. As seções seguem a lista de permissões de quem lê (`secoes.ts`, com o `secoesVisiveis`):

  | Seção | Quem vê |
  | --- | --- |
  | O menu do painel (só os itens que a pessoa vê, com o link de cada um) | todos |
  | Os indicadores | `dashboard:ver` |
  | Como a pesquisa chega ao paciente (QR Code, `/avaliar` e totem) | `setores:gerenciar` ou `perguntas:gerenciar` |
  | Pedidos de retorno | `contatos:ver` |
  | Exportações (o resumo para `exportacao:resumo`, todas as respostas para `exportacao:detalhada`) | uma das duas |
  | Senha (trocar e a quem pedir uma nova) | todos |
  | Como colocar a TV no ar | `tvwall:gerenciar` |
  | Contato com quem desenvolveu o sistema, com os e-mails em `mailto:` | todos |

  - Um índice "Nesta página" leva a cada seção. No computador, ele fica fixo ao lado do texto.
  - As seções têm âncora (`/painel/ajuda#tv`) e margem para não ficarem embaixo do cabeçalho preso.
- **Os indicadores na Ajuda** usam os mesmos textos do "?" do dashboard (`features/dashboard/ajuda.ts`: NPS, média de 1 a 5, nota baixa e baixíssima). O painel não tem duas explicações do mesmo número, e nada é calculado no front.
- **TV:**
  - A janela do link troca "Copie agora e abra no navegador da TV" pelo passo a passo curto: abrir no navegador da TV, ou mandar para quem instala; tocar para a tela cheia; conferir o "Último acesso". Ela também leva ao passo a passo completo.
  - Telas de TV ganhou, ao lado de "Nova tela", o "Como colocar na TV", que abre a Ajuda na seção da TV.
  - A lista de Telas de TV se atualiza sozinha a cada 15 s: o "Último acesso" aparece sem recarregar a página.
- **Âncora ao trocar de página:** com o `#` no endereço, o `Raiz.tsx` deixa de subir a página ao topo, e a Ajuda rola até a seção.
- **Documentos:**
  - o README ganhou a Ajuda em "Endereços" e "Colocar a TV no ar";
  - o `AGENTS.md` ganhou a regra da Ajuda e o escopo `ajuda`.

## Decisões e por quê

| Decisão | Por quê |
| --- | --- |
| A Ajuda num grupo próprio, separado por uma linha, no fim do menu | É de outro tipo (não é uma área de trabalho) e aparece para todos. Ficar sempre no mesmo lugar ajuda a achá-la |
| O menu e a ajuda tirados do componente para arquivos `.ts` | Assim os testes conferem a regra (quem vê o quê) sem montar a tela, e o menu e a Ajuda leem a mesma lista: item novo no menu aparece na Ajuda, com a descrição dele |
| A seção da pesquisa só para quem cuida dos setores ou das perguntas | O ticket pede que cada seção apareça para quem pode usar o assunto, e o que a seção ensina (imprimir o QR Code, os links do totem) fica em Setores e perguntas |
| Dentro da seção, só os tipos de exportação da pessoa | O Visualizador não tem a exportação detalhada: ver a explicação de um arquivo que ele não consegue gerar só confundiria |
| A senha e o contato para todos, com "fale primeiro com o Super Admin" para acesso e senha | É o que todos precisam. Assim os e-mails de quem desenvolveu o sistema não viram o caminho de pedir senha, que é do hospital |
| Os passos da TV na janela, curtos, e o completo na Ajuda | A janela aparece uma vez só e precisa caber na tela. As dicas (modo quiosque, teclado, a mensagem de tela inativa) ficam na Ajuda, que a pessoa reabre quando for instalar |
| "mais de 60 caracteres" no lugar de "uns 70" | O link tem o endereço do site, `/tv#` e um token de 43 caracteres. O tamanho muda com o domínio, então o texto diz só o que vale para qualquer um |
| A lista de Telas de TV se atualiza sozinha a cada 15 s | O "Último acesso" é gravado na primeira abertura da TV, mas a lista só buscava de novo ao recarregar (o painel desliga a busca ao voltar para a aba). Quem acabou de abrir o link na TV e voltou ao painel via "Ainda não foi aberta". Agora o último acesso aparece em instantes, e o passo a passo pode dizer isso |
| O mapa de permissões por perfil só nos testes (`src/test/permissoes-dos-perfis.ts`) | O critério pede os quatro perfis. As telas continuam usando só a lista da sessão (`usePode`), como manda o `AGENTS.md`; o arquivo diz que é uma cópia da tabela do Plano só para os testes |

## Ferramentas e skills usadas

- Claude Code, com o painel de navegador, a API da máquina (a `develop` de 26/11) e os dados de demonstração.
- A skill `web-design-guidelines` não estava disponível nesta sessão. A revisão foi feita à mão com os mesmos itens:
  - títulos de verdade (`h2` por seção, `h3` por tópico);
  - o índice num `nav` com nome;
  - links de texto sublinhados;
  - foco visível e teclado;
  - contraste com as cores do `globals.css`, sem cor nova;
  - largura de leitura de 70 caracteres.

## Como foi verificado

- `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` sem erros.
  - Os testes são 161, em 23 arquivos; eram 149, em 21.
  - Os novos conferem que a Ajuda aparece no fim do menu para os quatro perfis e até sem nenhuma permissão, que os outros itens seguem as permissões e que cada perfil vê as seções certas.
- **No navegador**, com a API e os dados de demonstração:
  - **Super Admin, em 1366×768:**
    - o menu com a Ajuda no fim e as oito seções;
    - os e-mails em `mailto:`, sem rolagem horizontal;
    - "Como colocar na TV", em Telas de TV, abriu a Ajuda com a seção da TV no topo da tela, abaixo do cabeçalho;
    - a janela do link mostrou o passo a passo e o link para a Ajuda.
  - **Visualizador (Diego), em 360×740:**
    - no menu do celular, só Indicadores e Ajuda;
    - na Ajuda, só o menu, os indicadores, as exportações (só o resumo), a senha e o contato;
    - sem rolagem horizontal.
- **Um teste deixou um registro no banco de desenvolvimento.** Para ver a janela do link, tentei simular a resposta da criação no navegador, mas a simulação não pegou: a tela "Teste sem gravar" foi criada de verdade. Ela foi desativada na hora, pelo próprio painel, e o link dela não abre. A tela continua na lista, desativada, porque a API não apaga telas, e o `pnpm db:demo` não a remove.

## O que mudou em relação ao plano

- **Rota nova:** a `/painel/ajuda` não está no plano do front. Ela entrou por este ticket, aberto pelo time.

## Pendências e dúvidas

- **Revisão:** o PR entra na `develop` com a aprovação de outra pessoa do time. Depois do merge, a issue #24 é fechada à mão.
- **Prints do PR:** entram arrastados para o PR no GitHub, porque o `gh` não anexa imagens.
- **Banco de desenvolvimento:** a tela de TV "Teste sem gravar", desativada, pode ser apagada à mão, se o time quiser a lista limpa.
- **Fora do ticket, como ele diz:**
  - o código de pareamento da TV (mexe na API);
  - o contato também na tela de login, para quem esqueceu a senha.
