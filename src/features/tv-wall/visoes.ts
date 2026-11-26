// As visões que a TV alterna. Tudo o que elas mostram precisa ser lido de longe, sem ninguém tocar na tela: por
// isso a evolução por semana saiu da rotação. O gráfico dela só dizia o número de cada semana passando o mouse.

/** Setores por tela no "NPS por setor": com mais, a visão se divide em partes, uma depois da outra. */
export const SETORES_POR_TELA = 7

export type Visao =
  { tipo: 'geral' } | { tipo: 'setores'; parte: number; partes: number } | { tipo: 'destaques' }

/** A ordem da rotação: visão geral, NPS por setor (em quantas partes precisar) e destaques positivos. */
export function visoesDaTv(quantidadeDeSetores: number): Visao[] {
  const partes = Math.max(1, Math.ceil(quantidadeDeSetores / SETORES_POR_TELA))
  return [
    { tipo: 'geral' },
    ...Array.from({ length: partes }, (_, parte) => ({ tipo: 'setores' as const, parte, partes })),
    { tipo: 'destaques' },
  ]
}

/** Os setores de uma parte do "NPS por setor", na ordem que a API mandou (do maior NPS para o menor). */
export const setoresDaParte = <T>(setores: readonly T[], parte: number) =>
  setores.slice(parte * SETORES_POR_TELA, (parte + 1) * SETORES_POR_TELA)

export function tituloDaVisao(visao: Visao) {
  if (visao.tipo === 'geral') return 'Visão geral do mês'
  if (visao.tipo === 'destaques') return 'Destaques positivos'
  return visao.partes > 1 ? `NPS por setor (${visao.parte + 1} de ${visao.partes})` : 'NPS por setor'
}
