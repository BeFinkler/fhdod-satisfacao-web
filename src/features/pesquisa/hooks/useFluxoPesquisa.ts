import { useMutation } from '@tanstack/react-query'
import { useReducer, useRef } from 'react'
import type { Canal, EnvioResposta, ItemEnvio, PesquisaPublica } from '@/lib/api/tipos'
import { isoDoDia } from '@/lib/format'
import { enviarResposta } from '../api'
import { estadoInicial, montarEnvio, novaChave, progresso, redutor, turnoDoHorario } from '../fluxo'
import { useComplemento } from './useComplemento'

/** Etapas, respostas e envio da pesquisa de um setor. O mesmo hook atende celular, computador e totem. */
export function useFluxoPesquisa(pesquisa: PesquisaPublica, canal: Canal) {
  const slug = pesquisa.setor.slug
  const [estado, despachar] = useReducer(redutor, pesquisa, (p) =>
    estadoInicial(
      p.perguntas.map((pergunta) => pergunta.id),
      novaChave(),
      // na web, o telefone para retorno é oferecido a todos no fim; no totem, só na avaliação baixa
      { telefoneSempre: canal === 'WEB' },
    ),
  )
  // trava contra duplo toque no "Enviar"; a chave de idempotência cobre o que escapar
  const enviando = useRef(false)

  const envio = useMutation({
    mutationFn: (corpo: EnvioResposta) => enviarResposta(slug, corpo),
    onSuccess: (criada) => despachar({ tipo: 'ENVIADA', criada }),
    onSettled: () => {
      enviando.current = false
    },
  })

  const { comentar, concluir, terminarSemComplemento, complemento, descartar } = useComplemento(
    estado,
    despachar,
  )

  return {
    estado,
    progresso: progresso(estado),
    perguntaAtual: estado.etapa === 'pergunta' ? pesquisa.perguntas[estado.indice] : undefined,

    comecar: () =>
      despachar({
        tipo: 'COMECAR',
        // totem: vale a data de hoje e o turno do horário atual
        atendimento:
          canal === 'TOTEM'
            ? { dataAtendimento: isoDoDia(), turnoId: turnoDoHorario(pesquisa.turnos, new Date()) }
            : undefined,
      }),
    definirData: (dataAtendimento: string) => despachar({ tipo: 'DEFINIR_DATA', dataAtendimento }),
    definirTurno: (turnoId: number) => despachar({ tipo: 'DEFINIR_TURNO', turnoId }),
    responder: (item: ItemEnvio) => despachar({ tipo: 'RESPONDER', item }),
    pular: () => despachar({ tipo: 'PULAR' }),
    voltar: () => despachar({ tipo: 'VOLTAR' }),
    selecionarNps: (nps: number) => despachar({ tipo: 'SELECIONAR_NPS', nps }),

    /**
     * Grava a avaliação. Se falhar, nada do que foi respondido se perde e a chave é a mesma na nova tentativa.
     * `site`: o valor do campo isca, vazio para pessoas.
     */
    enviar(site = '') {
      const corpo = montarEnvio(estado, canal, site)
      if (!corpo || enviando.current) return
      enviando.current = true
      envio.mutate(corpo)
    },
    envio: { pendente: envio.isPending, erro: envio.error },

    comentar,
    concluir,
    terminarSemComplemento,
    complemento,

    /** Volta ao início apagando tudo (totem). */
    reiniciar() {
      descartar()
      envio.reset()
      despachar({ tipo: 'REINICIAR', chaveIdempotencia: novaChave() })
    },
  }
}

export type FluxoPesquisa = ReturnType<typeof useFluxoPesquisa>

/** O que a tela das etapas usa do fluxo: o mesmo na pesquisa de um setor e na geral. */
export type FluxoDasEtapas = Omit<FluxoPesquisa, 'comecar' | 'reiniciar'>
