import { describe, expect, it } from 'vitest'
import { PERMISSOES_DOS_PERFIS } from '@/test/permissoes-dos-perfis'
import { gruposDoMenu } from './menu'

const rotulos = (permissoes: Parameters<typeof gruposDoMenu>[0]) =>
  gruposDoMenu(permissoes).map((grupo) => grupo.map((item) => item.rotulo))

describe('menu do painel', () => {
  it.each(Object.entries(PERMISSOES_DOS_PERFIS))(
    'a Ajuda aparece no fim do menu para %s',
    (_, permissoes) => {
      const grupos = rotulos(permissoes)
      expect(grupos.at(-1)).toEqual(['Ajuda'])
      expect(grupos.flat().filter((rotulo) => rotulo === 'Ajuda')).toHaveLength(1)
    },
  )

  it('a Ajuda não exige permissão: aparece até sem nenhuma', () => {
    expect(rotulos([])).toEqual([['Ajuda']])
  })

  it('os outros itens seguem a lista de permissões, e basta uma delas', () => {
    expect(rotulos(PERMISSOES_DOS_PERFIS.VISUALIZADOR)).toEqual([['Indicadores'], ['Ajuda']])
    expect(rotulos(PERMISSOES_DOS_PERFIS.GESTOR)).toEqual([
      ['Indicadores', 'Respostas'],
      ['Setores e perguntas'],
      ['Ajuda'],
    ])
    expect(rotulos(PERMISSOES_DOS_PERFIS.OUVIDORIA)).toEqual([
      ['Indicadores', 'Respostas', 'Pedidos de retorno'],
      ['Ajuda'],
    ])
    expect(rotulos(PERMISSOES_DOS_PERFIS.SUPER_ADMIN).flat()).toHaveLength(8)
  })

  it('cada item diz para que serve, o texto que a Ajuda mostra', () => {
    for (const item of gruposDoMenu(PERMISSOES_DOS_PERFIS.SUPER_ADMIN).flat()) {
      expect(item.descricao.length).toBeGreaterThan(20)
    }
  })
})
