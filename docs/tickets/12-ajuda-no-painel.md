# 12 — Ajuda no painel e instruções para colocar a TV no ar

**Issue:** [#24](https://github.com/GabrielPittaBr/fhdod-satisfacao-web/issues/24). O número não é o do ticket porque o GitHub numera issues e pull requests na mesma sequência, e o 12 já tinha sido usado.

**O que construir:** Quem não desenvolve o sistema não encontra nele como colocar a TV Wall no ar. O único endereço de TV que aparece está no README, no GitHub, e é o da tela de demonstração. O caminho de verdade já existe (Telas de TV → Nova tela → o link, mostrado uma vez só), mas a janela do link só diz "Copie agora e abra no navegador da TV". Também não há, dentro do sistema, um lugar para tirar dúvidas nem para saber com quem falar.

Este ticket fecha essas lacunas sem mexer na API:

1. **Aba "Ajuda" no painel**, com o ícone de interrogação, no fim do menu lateral e no menu do celular, para todos os perfis. Ela reúne a ajuda geral do painel e o contato de quem desenvolveu o sistema.
2. **Instruções para colocar a TV no ar**, na janela do link, na página Telas de TV e na Ajuda.

A Ajuda mostra o menu, os indicadores, a pesquisa, os pedidos de retorno, as exportações, a senha, como colocar a TV no ar e o contato, cada seção só para quem pode usar aquele assunto, pela lista de permissões do `/auth/me` (`usePode`), nunca pelo nome do perfil. O contato e a senha aparecem para todos.

**Bloqueado por:** 08 — TV Wall ligada à API (done)

**Status:** done

**Critérios de aceite:**

- [x] O menu do painel ganha "Ajuda", com o ícone de interrogação (`CircleQuestionMark`, do lucide), no fim da lista, no computador e no celular. Aparece para os quatro perfis. Hoje todo item do `MENU` (`PainelLayout.tsx`) exige uma permissão; a Ajuda é o primeiro que não exige.
- [x] `/painel/ajuda` abre para qualquer sessão, sem exigir permissão.
- [x] A página mostra só as seções dos assuntos que a pessoa pode usar, pelo `usePode`.
- [x] O contato mostra os dois e-mails como links `mailto:`.
- [x] A janela do link da tela troca a frase de hoje pelo passo a passo curto (abrir no navegador da TV, tocar para a tela cheia, conferir o último acesso) e diz que o link pode ir para quem vai instalar a TV.
- [x] A página Telas de TV tem, à vista, um "Como colocar na TV" que leva à seção da TV na Ajuda, para quem já fechou a janela do link.
- [x] Os textos seguem as decisões de interface do `AGENTS.md`: frases curtas, números explicados e as cores de `globals.css`.
- [x] Testes: o item "Ajuda" aparece para os quatro perfis, e as seções seguem as permissões.
- [x] A tela funciona em 360×740 e em 1366×768, sem rolagem horizontal, com toque, mouse e teclado, e passa pela revisão da skill `web-design-guidelines` (feita à mão, porque a skill não estava disponível; ver o registro).
- [x] README e `AGENTS.md` citam a Ajuda e o passo a passo da TV.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam, e a entrega fica registrada em `docs/registros/`.

**Fora deste ticket:**

- **Código de pareamento da TV:** a TV abre um endereço curto e mostra um código de 6 caracteres, que o Super Admin digita em "Nova tela". Mexe na API e vira outro ticket, se o hospital usar Smart TV sem computador.
- **Contato na tela de login:** quem esqueceu a senha não chega à Ajuda, que fica dentro do painel.
