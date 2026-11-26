import { useMutation } from '@tanstack/react-query'
import { useMemo, useReducer, useRef } from 'react'
import type { EnvioGeral, ItemEnvio, PesquisaGeral } from '@/lib/api/tipos'
import { enviarRespostasGerais } from '../api'
import { novaChave, progresso } from '../fluxo'
import {
  algumaBaixa,
  estadoInicialGeral,
  montarEnvioGeral,
  redutorGeral,
  setorDaPergunta,
  type SetorEscolhido,
} from '../fluxo-geral'
import { useComplemento } from './useComplemento'
import type { FluxoDasEtapas } from './useFluxoPesquisa'

/**
 * Etapas, respostas e envio da pesquisa geral (`/avaliar`), sempre pela web. Devolve o mesmo que a tela das
 * etapas usa na pesquisa de um setor, mais a escolha dos setores e a do setor do comentário.
 */
export function useFluxoPesquisaGeral(pesquisa: PesquisaGeral) {
  const [estado, despachar] = useReducer(redutorGeral, undefined, estadoInicialGeral)
  const { base } = estado
  // trava contra duplo toque no "Enviar"; as chaves de idempotência cobrem o que escapar
  const enviando = useRef(false)

  const perguntas = useMemo(
    () => new Map(pesquisa.setores.flatMap(({ perguntas }) => perguntas.map((p) => [p.id, p] as const))),
    [pesquisa],
  )

  const envio = useMutation({
    mutationFn: (corpo: EnvioGeral) => enviarRespostasGerais(corpo),
    onSuccess: (enviadas) => despachar({ tipo: 'ENVIADAS', enviadas }),
    onSettled: () => {
      enviando.current = false
    },
  })

  const { comentar, concluir, terminarSemComplemento, complemento } = useComplemento(base, despachar)
  const idDaPergunta = base.etapa === 'pergunta' ? base.perguntaIds[base.indice] : undefined

  const fluxo = {
    estado: base,
    progresso: progresso(base),
    perguntaAtual: idDaPergunta === undefined ? undefined : perguntas.get(idDaPergunta),

    definirData: (dataAtendimento: string) => despachar({ tipo: 'DEFINIR_DATA', dataAtendimento }),
    definirTurno: (turnoId: number) => despachar({ tipo: 'DEFINIR_TURNO', turnoId }),
    responder: (item: ItemEnvio) => despachar({ tipo: 'RESPONDER', item }),
    pular: () => despachar({ tipo: 'PULAR' }),
    voltar: () => despachar({ tipo: 'VOLTAR' }),
    selecionarNps: (nps: number) => despachar({ tipo: 'SELECIONAR_NPS', nps }),

    /** Grava a avaliação de todos os setores escolhidos, de uma vez, com as mesmas chaves em cada tentativa. */
    enviar(site = '') {
      const corpo = montarEnvioGeral(estado, 'WEB', site)
      if (!corpo || enviando.current) return
      enviando.current = true
      envio.mutate(corpo)
    },
    envio: { pendente: envio.isPending, erro: envio.error },

    comentar,
    concluir,
    terminarSemComplemento,
    complemento,
  } satisfies FluxoDasEtapas

  return {
    ...fluxo,
    /** Os setores escolhidos, na ordem dos toques. */
    setores: estado.setores,
    /** O que a API gravou em cada setor. */
    enviadas: estado.enviadas,
    /** O setor da avaliação que recebe o comentário e o telefone. */
    alvo: estado.alvo,
    setorDaPergunta: setorDaPergunta(estado),
    algumaBaixa: algumaBaixa(estado),

    /** Começa pelos setores escolhidos, na ordem dos toques; um setor que volta à escolha mantém a chave. */
    escolherSetores(slugs: string[]) {
      const porSlug = new Map(pesquisa.setores.map((setor) => [setor.slug, setor]))
      const setores = slugs.flatMap((slug): SetorEscolhido[] => {
        const setor = porSlug.get(slug)
        return setor ? [{ slug, perguntaIds: setor.perguntas.map(({ id }) => id) }] : []
      })
      const chaves = Object.fromEntries(setores.map(({ slug }) => [slug, estado.chaves[slug] ?? novaChave()]))
      despachar({ tipo: 'ESCOLHER_SETORES', setores, chaves })
    },
    escolherAlvo: (slug: string) => despachar({ tipo: 'ESCOLHER_ALVO', slug }),
  }
}
