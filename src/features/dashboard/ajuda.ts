// Textos da ajuda do dashboard: o "?" de cada bloco e o guia "Como ler os indicadores" usam os mesmos. Cada frase
// descreve a conta que a API faz (as regras ficam em src/shared/rules/, no repositório da API) e o que a tela
// mostra, sem interpretação inventada. Mudou uma regra na API? Mude o texto aqui.

export interface TextoDeAjuda {
  titulo: string
  paragrafos: readonly string[]
}

export const AJUDA = {
  filtros: {
    titulo: 'Filtros',
    paragrafos: [
      'Todos os blocos da página e as exportações usam o mesmo recorte: o período, o setor, o turno e o canal escolhidos.',
      'Data considerada: "Dia do atendimento" conta cada avaliação no dia em que a pessoa foi atendida, que ela informa na pesquisa; "Dia do envio da resposta" conta no dia em que a avaliação chegou.',
      'O turno é o informado na pesquisa. O canal separa as respostas dadas pelo celular ou computador (link e QR Code) das feitas no totem.',
      'Os filtros ficam no endereço da página: copie o link para mostrar a mesma visão a outra pessoa. Cada perfil só vê os setores que pode acompanhar.',
    ],
  },
  exportar: {
    titulo: 'Exportar',
    paragrafos: [
      'Gera um arquivo com os mesmos filtros da tela: o resumo dos indicadores em Excel ou em PDF e, para quem tem permissão, todas as respostas em Excel, uma por linha.',
      'O telefone para retorno só vai no arquivo de quem pode ver os pedidos de retorno, e cada exportação fica registrada na auditoria.',
    ],
  },
  nps: {
    titulo: 'NPS do período',
    paragrafos: [
      'Vem da pergunta de 0 a 10 sobre recomendar o hospital. Quem dá 9 ou 10 é promotor; 7 ou 8, neutro; de 0 a 6, detrator.',
      'O NPS é o percentual de promotores menos o de detratores, arredondado. Vai de −100 (todos detratores) a +100 (todos promotores): acima de zero, há mais promotores do que detratores.',
      'Com menos de 30 respostas, o painel avisa: cada nova avaliação ainda muda bastante o número.',
    ],
  },
  media: {
    titulo: 'Média das notas de 1 a 5',
    paragrafos: [
      'Média de todas as notas da escala de rostinhos dadas no período, de 1 (Muito ruim) a 5 (Muito bom), com uma casa decimal.',
      'O rostinho e a palavra ao lado são os do nível mais próximo da média: 4,3 aparece como Bom.',
    ],
  },
  notasBaixas: {
    titulo: 'Avaliações com nota baixa',
    paragrafos: [
      'O sistema classifica cada avaliação quando ela chega, pela pior nota dela. É baixa quando a nota de 0 a 10 é 6 ou menos ou quando alguma nota de 1 a 5 é 3 ou menos.',
      'É baixíssima quando a nota de 0 a 10 é 2 ou menos ou quando alguma nota de 1 a 5 é 1. As baixíssimas também entram no total de notas baixas.',
      'Esses limites vêm das configurações do sistema. Em Respostas, o filtro Classificação lista cada uma dessas avaliações.',
    ],
  },
  evolucao: {
    titulo: 'Evolução do NPS',
    paragrafos: [
      'A linha mostra o NPS de cada dia, semana ou mês do período, com a mesma conta do NPS do período; as colunas mostram quantas respostas cada um teve.',
      'Um período sem respostas fica sem ponto na linha. Com poucas respostas, o ponto sobe e desce mais: observe a tendência, não um ponto isolado.',
      '"Por dia", "Por semana" (de segunda a domingo) e "Por mês" mudam o agrupamento. Os números exatos ficam em "Ver os números em tabela".',
    ],
  },
  categorias: {
    titulo: 'Notas por categoria',
    paragrafos: [
      'Cada pergunta de 1 a 5 pertence a uma categoria, como Recepção, Enfermagem ou Tempo de espera.',
      'Para cada categoria, o painel mostra a média das notas e quanto delas foi 4 (Bom) ou 5 (Muito bom). A barra desenha esse percentual.',
      'Junta todos os setores do filtro. Para ver uma categoria num setor só, escolha o setor nos filtros ou veja os melhores e piores pontos.',
    ],
  },
  npsPorSetor: {
    titulo: 'NPS por setor',
    paragrafos: [
      'A mesma conta do NPS do período, feita só com as respostas de cada setor, do maior para o menor. Só aparecem os setores com respostas no período.',
      'O NPS do período não é a média destes números: ele junta todas as respostas, então o setor com mais respostas pesa mais.',
      'Ao lado de cada nota está o número de respostas: com poucas, a nota muda muito. Toque num setor para filtrar a página inteira por ele.',
    ],
  },
  ranking: {
    titulo: 'Melhores e piores pontos',
    paragrafos: [
      'Um ponto é uma categoria dentro de um setor, como o Tempo de espera do Pronto Atendimento. Só entram os pontos com 5 notas ou mais no período.',
      '"Onde está melhor" traz os 3 pontos com a maior média; "Onde precisa de atenção", os 3 com a menor média entre os que sobraram, sem repetir. No empate, decide o percentual de notas 4 e 5 e, depois, quem tem mais notas.',
      'A atenção é relativa: são os pontos mais fracos entre os avaliados, mesmo quando a média deles é boa.',
    ],
  },
  comentarios: {
    titulo: 'Comentários recentes',
    paragrafos: [
      'O que os pacientes escreveram na pesquisa, do envio mais recente para o mais antigo. Os botões filtram pelo tipo que a própria pessoa escolheu: elogio, reclamação, sugestão ou outro.',
      'O selo Baixa ou Baixíssima é a classificação da avaliação inteira. "Ver a resposta" abre a avaliação completa, com todas as notas; a lista completa fica em Respostas.',
    ],
  },
} as const satisfies Record<string, TextoDeAjuda>

export type AssuntoDaAjuda = keyof typeof AJUDA

/** O guia segue a ordem da página: primeiro os controles, depois cada seção. */
export const SECOES_DO_GUIA: readonly { titulo: string; assuntos: readonly AssuntoDaAjuda[] }[] = [
  { titulo: 'Filtros e exportação', assuntos: ['filtros', 'exportar'] },
  { titulo: 'Visão geral', assuntos: ['nps', 'media', 'notasBaixas'] },
  { titulo: 'Desempenho', assuntos: ['evolucao', 'categorias'] },
  { titulo: 'Comparação entre setores', assuntos: ['npsPorSetor', 'ranking'] },
  { titulo: 'Comentários dos pacientes', assuntos: ['comentarios'] },
]
