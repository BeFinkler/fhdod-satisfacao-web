// As seções da Ajuda do painel e quem vê cada uma. Cada pessoa vê só os assuntos que pode usar, pela lista de
// permissões do /auth/me (basta uma delas), nunca pelo nome do perfil. O menu, a senha e o contato são de todos.
import type { Permissao } from '@/lib/api/tipos'

export interface SecaoDaAjuda {
  /** a âncora da seção: /painel/ajuda#tv */
  id: string
  titulo: string
  /** basta ter uma delas; sem a lista, a seção aparece para todos */
  permissoes?: readonly Permissao[]
}

export const SECOES_DA_AJUDA = [
  { id: 'menu', titulo: 'O menu do painel' },
  { id: 'indicadores', titulo: 'Os indicadores', permissoes: ['dashboard:ver'] },
  {
    id: 'pesquisa',
    titulo: 'Como a pesquisa chega ao paciente',
    permissoes: ['setores:gerenciar', 'perguntas:gerenciar'],
  },
  { id: 'retornos', titulo: 'Pedidos de retorno', permissoes: ['contatos:ver'] },
  { id: 'exportacoes', titulo: 'Exportações', permissoes: ['exportacao:resumo', 'exportacao:detalhada'] },
  { id: 'senha', titulo: 'Senha' },
  { id: 'tv', titulo: 'Como colocar a TV no ar', permissoes: ['tvwall:gerenciar'] },
  { id: 'contato', titulo: 'Contato com quem desenvolveu o sistema' },
] as const satisfies readonly SecaoDaAjuda[]

export type IdDaSecao = (typeof SECOES_DA_AJUDA)[number]['id']

/** As seções que a pessoa vê, na ordem da página. */
export function secoesVisiveis(permissoes: readonly Permissao[]): SecaoDaAjuda[] {
  return SECOES_DA_AJUDA.filter(
    (secao: SecaoDaAjuda) => !secao.permissoes || secao.permissoes.some((p) => permissoes.includes(p)),
  )
}

/** Quem desenvolveu o sistema, para dúvidas, problemas e ideias. */
export const CONTATOS = [
  { nome: 'Gabriel Pitta', email: 'gabrielfernandespitta@gmail.com' },
  { nome: 'Bernardo Finkler', email: 'finklerbernardo@gmail.com' },
] as const
