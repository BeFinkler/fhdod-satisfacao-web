import { describe, expect, it } from 'vitest'
import { PERMISSOES_DOS_PERFIS } from '@/test/permissoes-dos-perfis'
import { CONTATOS, secoesVisiveis } from './secoes'

const ids = (permissoes: Parameters<typeof secoesVisiveis>[0]) => secoesVisiveis(permissoes).map((s) => s.id)

describe('seções da Ajuda', () => {
  it('o menu, a senha e o contato aparecem para todos, até sem nenhuma permissão', () => {
    expect(ids([])).toEqual(['menu', 'senha', 'contato'])
  })

  it('a TV só para quem gerencia as telas de TV', () => {
    expect(ids(['tvwall:gerenciar'])).toContain('tv')
    for (const perfil of ['GESTOR', 'OUVIDORIA', 'VISUALIZADOR'] as const) {
      expect(ids(PERMISSOES_DOS_PERFIS[perfil])).not.toContain('tv')
    }
  })

  it('os pedidos de retorno só para quem vê os contatos', () => {
    expect(ids(['contatos:ver'])).toContain('retornos')
    expect(ids(PERMISSOES_DOS_PERFIS.GESTOR)).not.toContain('retornos')
  })

  it('cada perfil vê os assuntos das suas permissões, na ordem da página', () => {
    expect(ids(PERMISSOES_DOS_PERFIS.SUPER_ADMIN)).toEqual([
      'menu',
      'indicadores',
      'pesquisa',
      'retornos',
      'exportacoes',
      'senha',
      'tv',
      'contato',
    ])
    expect(ids(PERMISSOES_DOS_PERFIS.GESTOR)).toEqual([
      'menu',
      'indicadores',
      'pesquisa',
      'exportacoes',
      'senha',
      'contato',
    ])
    expect(ids(PERMISSOES_DOS_PERFIS.OUVIDORIA)).toEqual([
      'menu',
      'indicadores',
      'retornos',
      'exportacoes',
      'senha',
      'contato',
    ])
    expect(ids(PERMISSOES_DOS_PERFIS.VISUALIZADOR)).toEqual([
      'menu',
      'indicadores',
      'exportacoes',
      'senha',
      'contato',
    ])
  })

  it('o contato traz os dois e-mails de quem desenvolveu o sistema', () => {
    expect(CONTATOS.map((c) => c.email)).toEqual([
      'gabrielfernandespitta@gmail.com',
      'finklerbernardo@gmail.com',
    ])
  })
})
