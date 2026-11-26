import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Os testes rodam no Node, sem navegador: o document e o window são de mentira, só com o que o vlibras.ts usa.
interface ScriptFalso {
  src: string
  async: boolean
  onload?: () => void
  onerror?: () => void
  remove: ReturnType<typeof vi.fn>
}

let scripts: ScriptFalso[]
let janela: { VLibras?: { Widget: unknown }; VLibrasWidget?: { open?: () => void } }

beforeEach(() => {
  scripts = []
  janela = {}
  vi.stubGlobal('window', janela)
  vi.stubGlobal('document', {
    createElement: () => {
      const script: ScriptFalso = { src: '', async: false, remove: vi.fn() }
      scripts.push(script)
      return script
    },
    body: { append: vi.fn() },
  })
  vi.resetModules()
})
afterEach(() => vi.unstubAllGlobals())

describe('VLibras', () => {
  it('baixa o script oficial uma vez só e liga o VLibras quando ele carrega', async () => {
    const { carregarVLibras, useVLibras } = await import('./vlibras')
    const Widget = vi.fn()
    const primeira = carregarVLibras()
    const segunda = carregarVLibras()

    expect(scripts).toHaveLength(1)
    expect(scripts[0]).toMatchObject({ src: 'https://vlibras.gov.br/app/vlibras-plugin.js', async: true })
    expect(useVLibras.getState().estado).toBe('carregando')

    janela.VLibras = { Widget }
    scripts[0]!.onload?.()
    await Promise.all([primeira, segunda])
    expect(Widget).toHaveBeenCalledWith('https://vlibras.gov.br/app')
    expect(useVLibras.getState().estado).toBe('pronto')
  })

  it('sem internet, avisa que está indisponível e tenta de novo na próxima vez', async () => {
    const { carregarVLibras, useVLibras } = await import('./vlibras')
    const tentativa = carregarVLibras()
    scripts[0]!.onerror?.()

    await expect(tentativa).rejects.toThrow()
    expect(useVLibras.getState().estado).toBe('indisponivel')
    expect(scripts[0]!.remove).toHaveBeenCalled()

    void carregarVLibras().catch(() => undefined)
    expect(scripts).toHaveLength(2)
  })

  it('"Traduzir para Libras" abre o tradutor do VLibras', async () => {
    const { abrirVLibras } = await import('./vlibras')
    const open = vi.fn()
    const abrindo = abrirVLibras()
    janela.VLibras = { Widget: vi.fn() }
    janela.VLibrasWidget = { open }
    scripts[0]!.onload?.()
    await abrindo
    expect(open).toHaveBeenCalledOnce()
  })
})
