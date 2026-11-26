import { afterEach, describe, expect, it } from 'vitest'
import { escalaDoTexto, TAMANHOS_DO_TEXTO, useAcessibilidade } from './acessibilidade'

describe('tamanho do texto', () => {
  afterEach(() => useAcessibilidade.setState({ tamanhoDoTexto: 'normal' }))

  it('oferece três níveis, do normal ao muito grande, sempre crescendo', () => {
    expect(TAMANHOS_DO_TEXTO.map((t) => t.rotulo)).toEqual(['Normal', 'Grande', 'Muito grande'])
    const escalas = TAMANHOS_DO_TEXTO.map((t) => t.escala)
    expect(escalas).toEqual([...escalas].sort((a, b) => a - b))
    expect(escalaDoTexto('normal')).toBe(1)
  })

  it('começa no normal e guarda a escolha enquanto a pessoa navega (só em memória)', () => {
    expect(useAcessibilidade.getState().tamanhoDoTexto).toBe('normal')
    useAcessibilidade.getState().mudarTamanhoDoTexto('muito-grande')
    expect(useAcessibilidade.getState().tamanhoDoTexto).toBe('muito-grande')
    expect(escalaDoTexto(useAcessibilidade.getState().tamanhoDoTexto)).toBe(1.3)
  })
})
