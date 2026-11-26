import type { Permissao } from '@/lib/api/tipos'

/**
 * Só para os testes: a lista de permissões que o /auth/me devolve hoje para cada perfil, copiada da tabela
 * "Perfis e permissões" do Plano de Desenvolvimento. As telas nunca usam este mapa, só a lista da sessão
 * (`usePode`): se a API mudar um perfil, os testes daqui continuam valendo para a lista que ela mandar.
 */
export const PERMISSOES_DOS_PERFIS: Record<
  'SUPER_ADMIN' | 'GESTOR' | 'OUVIDORIA' | 'VISUALIZADOR',
  Permissao[]
> = {
  SUPER_ADMIN: [
    'setores:gerenciar',
    'usuarios:gerenciar',
    'categorias:gerenciar',
    'turnos:gerenciar',
    'tvwall:gerenciar',
    'configuracoes:gerenciar',
    'auditoria:ver',
    'perguntas:gerenciar',
    'dashboard:ver',
    'respostas:ver',
    'comentarios:ver',
    'contatos:ver',
    'contatos:gerenciar',
    'exportacao:resumo',
    'exportacao:detalhada',
    'escalas:gerenciar',
  ],
  GESTOR: [
    'perguntas:gerenciar',
    'dashboard:ver',
    'respostas:ver',
    'comentarios:ver',
    'exportacao:resumo',
    'exportacao:detalhada',
    'escalas:gerenciar',
  ],
  OUVIDORIA: [
    'dashboard:ver',
    'respostas:ver',
    'comentarios:ver',
    'contatos:ver',
    'contatos:gerenciar',
    'exportacao:resumo',
    'exportacao:detalhada',
  ],
  VISUALIZADOR: ['dashboard:ver', 'exportacao:resumo'],
}
