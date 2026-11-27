// O menu do painel: os itens, para que serve cada um (o texto que a Ajuda mostra) e quem vê cada item.
import {
  Building2,
  ChartColumn,
  CircleQuestionMark,
  MessagesSquare,
  PhoneCall,
  Tags,
  Tv,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Permissao } from '@/lib/api/tipos'

export interface ItemDoMenu {
  para: string
  rotulo: string
  icone: LucideIcon
  /** para que serve, com as palavras de quem usa o painel */
  descricao: string
  /** basta ter uma delas; sem a lista, o item aparece para todos os perfis */
  permissoes?: Permissao[]
}

// Três grupos: acompanhar os resultados, configurar a pesquisa e a ajuda, que vale para todos.
export const MENU: ItemDoMenu[][] = [
  [
    {
      para: '/painel',
      rotulo: 'Indicadores',
      icone: ChartColumn,
      descricao:
        'Os números da satisfação: o NPS, as notas por categoria e a comparação entre os setores, com filtros de período, setor, turno e canal, e a exportação.',
      permissoes: ['dashboard:ver'],
    },
    {
      para: '/painel/respostas',
      rotulo: 'Respostas',
      icone: MessagesSquare,
      descricao:
        'Cada avaliação enviada, uma por linha. Toque numa linha para ver as perguntas, as notas e o comentário.',
      permissoes: ['respostas:ver'],
    },
    {
      para: '/painel/contatos',
      rotulo: 'Pedidos de retorno',
      icone: PhoneCall,
      descricao: 'As pessoas que deixaram o telefone e autorizaram o hospital a ligar.',
      permissoes: ['contatos:ver'],
    },
  ],
  [
    {
      para: '/painel/setores',
      rotulo: 'Setores e perguntas',
      icone: Building2,
      descricao:
        'Os setores avaliados, as perguntas da pesquisa de cada um e os links e QR Codes para imprimir.',
      permissoes: ['setores:gerenciar', 'perguntas:gerenciar'],
    },
    {
      para: '/painel/cadastros',
      rotulo: 'Categorias e turnos',
      icone: Tags,
      descricao:
        'As etapas do atendimento (como Recepção e Enfermagem), que comparam os setores, e os turnos que o paciente escolhe na pesquisa.',
      permissoes: ['categorias:gerenciar', 'turnos:gerenciar'],
    },
    {
      para: '/painel/usuarios',
      rotulo: 'Usuários',
      icone: Users,
      descricao:
        'Quem entra no painel, com o perfil e os setores de cada pessoa. Aqui também se redefine a senha.',
      permissoes: ['usuarios:gerenciar'],
    },
    {
      para: '/painel/tv',
      rotulo: 'Telas de TV',
      icone: Tv,
      descricao: 'As TVs da recepção e dos corredores: o link de cada uma e o último acesso.',
      permissoes: ['tvwall:gerenciar'],
    },
  ],
  [
    {
      para: '/painel/ajuda',
      rotulo: 'Ajuda',
      icone: CircleQuestionMark,
      descricao: 'Esta página: como usar o painel, o que significa cada número e com quem falar.',
    },
  ],
]

/**
 * Os grupos do menu com só os itens que a pessoa pode abrir, pela lista de permissões do /auth/me (basta uma
 * delas), nunca pelo nome do perfil. A Ajuda não exige permissão: aparece para todos, no fim.
 */
export function gruposDoMenu(permissoes: readonly Permissao[]): ItemDoMenu[][] {
  return MENU.map((grupo) =>
    grupo.filter((item) => !item.permissoes || item.permissoes.some((p) => permissoes.includes(p))),
  ).filter((grupo) => grupo.length > 0)
}
