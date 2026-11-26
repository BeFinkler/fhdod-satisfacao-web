# 11 — Pesquisa geral: escolha dos setores no lugar do Google Forms

**Issue:** [#22](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/22). O número não é o do ticket porque os números de 11 a 21 já eram pull requests.

**O que construir:** Hoje o hospital divulga um link do Google Forms. Nele a pessoa escolhe o setor que quer avaliar e, no fim, pode deixar um telefone para retorno. A pesquisa geral substitui esse link: é o `/avaliar`. A pessoa marca um ou mais setores e responde só as perguntas deles, um setor depois do outro. Data, turno e a nota de 0 a 10 são perguntados uma vez, e a pesquisa termina com o comentário e o telefone, como no Forms. Na web, o telefone passa a ser a última pergunta para todos, também no `/s/:setor`; no totem, continua só na avaliação baixa. O Super Admin encontra o link geral e o QR Code dele em Setores.

**Bloqueado por:** API 21 — Pesquisa geral: escolha dos setores e envio de vários setores

**Status:** done

**Critérios de aceite:**

- [x] `/avaliar` abre a pesquisa geral pelo `GET /publico/pesquisa` e mostra os setores ativos, com a descrição. A pessoa marca um ou mais; a ordem dos toques numera os setores e é a ordem das perguntas.
- [x] Cada pergunta mostra acima do título o setor a que pertence, com o mesmo número da escolha. "Voltar" na data volta à escolha sem perder o que foi marcado.
- [x] Data e turno são perguntados uma vez, e a nota de 0 a 10 também, no fim. O `POST /publico/respostas` grava todos os setores de uma vez, com uma chave de envio por setor, a mesma em cada nova tentativa.
- [x] Com mais de um setor, o comentário pergunta "Sobre qual setor?". Vem marcado o primeiro setor que a API classificou como baixo, e o comentário e o telefone vão para a avaliação desse setor.
- [x] Na web (`/avaliar` e `/s/:setor`), o telefone é oferecido a todos no fim; no totem, só na avaliação baixa.
- [x] O agradecimento diz quais setores foram avaliados.
- [x] Em Setores, o Super Admin copia o link geral e imprime a folha com o QR Code dele.
- [x] A tela de pesquisa indisponível e a página 404 levam à pesquisa geral.
- [x] Os tipos vêm do contrato (`pnpm api:tipos`); há testes do fluxo geral, do telefone para todos e das chamadas novas.
- [x] A tela funciona em 360×740, 768×1024 e 1366×768, sem rolagem horizontal, com toque, mouse e teclado.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam, e a entrega fica registrada em `docs/registros/`.
