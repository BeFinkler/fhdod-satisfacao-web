import { describe, expect, it } from 'vitest'
import { AJUDA, SECOES_DO_GUIA } from './ajuda'

describe('ajuda do dashboard', () => {
  it('o guia "Como ler os indicadores" traz cada assunto da ajuda uma vez só', () => {
    const noGuia = SECOES_DO_GUIA.flatMap((secao) => secao.assuntos)
    expect([...noGuia].sort()).toEqual(Object.keys(AJUDA).sort())
  })

  it('cada assunto tem título e pelo menos uma explicação', () => {
    for (const { titulo, paragrafos } of Object.values(AJUDA)) {
      expect(titulo).not.toBe('')
      expect(paragrafos.length).toBeGreaterThan(0)
    }
  })

  it('as regras citadas são as da API: promotor, detrator, nota baixa e o mínimo do ranking', () => {
    expect(AJUDA.nps.paragrafos.join(' ')).toContain('9 ou 10 é promotor; 7 ou 8, neutro; de 0 a 6, detrator')
    expect(AJUDA.notasBaixas.paragrafos.join(' ')).toContain('6 ou menos')
    expect(AJUDA.ranking.paragrafos.join(' ')).toContain('5 notas ou mais')
  })
})
