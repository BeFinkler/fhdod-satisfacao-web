// Estado da pesquisa geral (/avaliar): a pessoa escolhe os setores e responde as perguntas de cada um, um setor
// depois do outro. As etapas são as da pesquisa de um setor: este redutor embrulha o de fluxo.ts e cuida só do
// que é da escolha dos setores. Fica só na memória, como o fluxo de um setor.
import type { Canal, EnvioGeral, RespostaCriada, RespostaCriadaDoSetor } from '@/lib/api/tipos'
import { estadoInicial, redutor, type AcaoFluxo, type EstadoFluxo } from './fluxo'

/** Um setor escolhido e as perguntas dele, na ordem da pesquisa. */
export interface SetorEscolhido {
  slug: string
  perguntaIds: number[]
}

export interface EstadoGeral {
  /** etapas, respostas e nota, como na pesquisa de um setor; `criada` é a avaliação que recebe o complemento */
  base: EstadoFluxo
  /** os setores escolhidos, na ordem dos toques: as perguntas vêm nessa ordem */
  setores: SetorEscolhido[]
  /** uma chave de envio por setor, a mesma em cada nova tentativa e se a pessoa volta e muda a escolha */
  chaves: Record<string, string>
  /** o que a API gravou em cada setor, na ordem da escolha */
  enviadas: RespostaCriadaDoSetor[]
  /** o setor da avaliação que recebe o comentário e o telefone */
  alvo: string | null
}

export type AcaoGeral =
  | AcaoFluxo
  | { tipo: 'ESCOLHER_SETORES'; setores: SetorEscolhido[]; chaves: Record<string, string> }
  | { tipo: 'ENVIADAS'; enviadas: RespostaCriadaDoSetor[] }
  | { tipo: 'ESCOLHER_ALVO'; slug: string }

// Na pesquisa geral cada setor tem a sua chave (`chaves`): a chave única do fluxo de um setor fica vazia.
export const estadoInicialGeral = (): EstadoGeral => ({
  base: estadoInicial([], '', { telefoneSempre: true }),
  setores: [],
  chaves: {},
  enviadas: [],
  alvo: null,
})

/**
 * A avaliação que recebe o comentário e o telefone, se a pessoa não escolher outra: a do primeiro setor que a API
 * classificou como baixo, que é onde algo deu errado, ou a do primeiro setor escolhido.
 */
export const alvoPadrao = (enviadas: RespostaCriadaDoSetor[]): RespostaCriadaDoSetor | undefined =>
  enviadas.find(({ classificacao }) => classificacao !== 'NORMAL') ?? enviadas[0]

const semSetor = ({ slug: _slug, ...criada }: RespostaCriadaDoSetor): RespostaCriada => criada

export function redutorGeral(e: EstadoGeral, acao: AcaoGeral): EstadoGeral {
  switch (acao.tipo) {
    case 'ESCOLHER_SETORES': {
      if (e.base.etapa !== 'abertura' || acao.setores.length === 0) return e
      const perguntaIds = acao.setores.flatMap(({ perguntaIds }) => perguntaIds)
      // as respostas de um setor que saiu da escolha saem junto com ele
      const respostas = Object.fromEntries(
        perguntaIds.flatMap((id) => {
          const resposta = e.base.respostas[id]
          return resposta ? [[id, resposta] as const] : []
        }),
      )
      return {
        ...e,
        setores: acao.setores,
        chaves: acao.chaves,
        base: redutor({ ...e.base, perguntaIds, respostas, indice: 0 }, { tipo: 'COMECAR' }),
      }
    }

    case 'ENVIADAS': {
      const alvo = alvoPadrao(acao.enviadas)
      if (!alvo) return e
      const base = redutor(e.base, { tipo: 'ENVIADA', criada: semSetor(alvo) })
      return base === e.base ? e : { ...e, base, enviadas: acao.enviadas, alvo: alvo.slug }
    }

    case 'ESCOLHER_ALVO': {
      const alvo = e.enviadas.find(({ slug }) => slug === acao.slug)
      if (!alvo || e.base.etapa !== 'comentario') return e
      return { ...e, alvo: alvo.slug, base: { ...e.base, criada: semSetor(alvo) } }
    }

    case 'REINICIAR':
      return estadoInicialGeral()

    default: {
      const base = redutor(e.base, acao)
      return base === e.base ? e : { ...e, base }
    }
  }
}

/**
 * Corpo do envio geral: a nota, a data e o turno valem para todos os setores, e cada setor leva a sua chave e as
 * respostas das perguntas dele. Sem a nota não há envio. `site` é o que estiver no campo isca.
 */
export function montarEnvioGeral(e: EstadoGeral, canal: Canal, site = ''): EnvioGeral | null {
  const { nps, dataAtendimento, turnoId, respostas } = e.base
  if (nps === null || dataAtendimento === null || turnoId === null || e.setores.length === 0) return null
  const setores: EnvioGeral['setores'] = []
  for (const { slug, perguntaIds } of e.setores) {
    const chaveIdempotencia = e.chaves[slug]
    if (!chaveIdempotencia) return null
    setores.push({ slug, chaveIdempotencia, itens: perguntaIds.flatMap((id) => respostas[id] ?? []) })
  }
  return { canal, dataAtendimento, turnoId, nps, site, setores }
}

/** O setor da pergunta na tela: a posição dele na escolha (1, 2, 3) e se esta é a primeira pergunta dele. */
export function setorDaPergunta(e: EstadoGeral): { slug: string; ordem: number; primeira: boolean } | null {
  if (e.base.etapa !== 'pergunta') return null
  const id = e.base.perguntaIds[e.base.indice]
  if (id === undefined) return null
  const posicao = e.setores.findIndex(({ perguntaIds }) => perguntaIds.includes(id))
  const setor = e.setores[posicao]
  return setor ? { slug: setor.slug, ordem: posicao + 1, primeira: setor.perguntaIds[0] === id } : null
}

/** Algum setor foi classificado como baixo pela API? Decide a pergunta do comentário, que vale para a visita toda. */
export const algumaBaixa = (e: EstadoGeral): boolean =>
  e.enviadas.some(({ classificacao }) => classificacao !== 'NORMAL')
