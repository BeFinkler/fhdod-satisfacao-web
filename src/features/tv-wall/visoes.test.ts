import { describe, expect, it } from 'vitest'
import { SETORES_POR_TELA, setoresDaParte, tituloDaVisao, visoesDaTv } from './visoes'

describe('visões da TV', () => {
  it('alterna a visão geral, o NPS por setor e os destaques, sem a evolução por semana', () => {
    expect(visoesDaTv(5)).toEqual([
      { tipo: 'geral' },
      { tipo: 'setores', parte: 0, partes: 1 },
      { tipo: 'destaques' },
    ])
    expect(visoesDaTv(5).map(tituloDaVisao)).toEqual([
      'Visão geral do mês',
      'NPS por setor',
      'Destaques positivos',
    ])
  })

  it('sem setores com respostas, mantém a visão do NPS por setor, que avisa que ainda não há respostas', () => {
    expect(visoesDaTv(0)).toHaveLength(3)
  })

  it('com mais setores do que cabem numa tela, divide o NPS por setor em partes, uma depois da outra', () => {
    const visoes = visoesDaTv(SETORES_POR_TELA + 1)
    expect(visoes).toEqual([
      { tipo: 'geral' },
      { tipo: 'setores', parte: 0, partes: 2 },
      { tipo: 'setores', parte: 1, partes: 2 },
      { tipo: 'destaques' },
    ])
    expect(visoes.map(tituloDaVisao)).toEqual([
      'Visão geral do mês',
      'NPS por setor (1 de 2)',
      'NPS por setor (2 de 2)',
      'Destaques positivos',
    ])
  })

  it('cada parte traz os setores na ordem da API, sem repetir nem pular nenhum', () => {
    const setores = Array.from({ length: SETORES_POR_TELA * 2 + 3 }, (_, i) => `Setor ${i + 1}`)
    const partes = [0, 1, 2].map((parte) => setoresDaParte(setores, parte))
    expect(partes.map((parte) => parte.length)).toEqual([SETORES_POR_TELA, SETORES_POR_TELA, 3])
    expect(partes.flat()).toEqual(setores)
  })
})
