import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Complemento, RespostaCriada } from '@/lib/api/tipos'
import { enviarComplemento } from '../api'
import { telefoneDepoisDoComentario, type AcaoFluxo, type Comentario, type EstadoFluxo } from '../fluxo'

/**
 * Comentário e telefone, depois que a avaliação foi gravada, na pesquisa de um setor e na geral. Os dois vão
 * juntos, numa chamada só, para a avaliação de `estado.criada`, com o token dela.
 */
export function useComplemento(estado: EstadoFluxo, despachar: (acao: AcaoFluxo) => void) {
  const complemento = useMutation({
    mutationFn: (v: { criada: RespostaCriada; corpo: Complemento }) =>
      enviarComplemento(v.criada.id, v.criada.tokenComplemento, v.corpo),
    onSuccess: () => despachar({ tipo: 'CONCLUIR' }),
  })

  // Comentário confirmado na tela anterior, ainda não enviado porque a pessoa está na tela do telefone.
  const pendente =
    estado.etapa === 'contato' && estado.criada && estado.comentario
      ? { criada: estado.criada, comentario: estado.comentario }
      : null

  function enviarPendente() {
    if (!pendente) return
    // se a pessoa for embora sem decidir sobre o telefone, o comentário não se perde
    void enviarComplemento(pendente.criada.id, pendente.criada.tokenComplemento, {
      comentario: pendente.comentario,
    }).catch(() => undefined)
  }

  useEffect(() => {
    if (!pendente) return
    window.addEventListener('pagehide', enviarPendente)
    return () => window.removeEventListener('pagehide', enviarPendente)
  })

  return {
    /** Tela do comentário: null quando a pessoa escolhe "Agora não". */
    comentar(comentario: Comentario | null) {
      if (!estado.criada) return
      if (telefoneDepoisDoComentario(estado)) return despachar({ tipo: 'COMENTAR', comentario })
      if (!comentario) return despachar({ tipo: 'CONCLUIR' })
      complemento.mutate({ criada: estado.criada, corpo: { comentario } })
    },
    /** Tela do telefone: envia de uma vez o comentário guardado e, se houver, o contato. */
    concluir(contato?: Complemento['contato']) {
      if (!estado.criada) return
      const corpo: Complemento = {}
      if (estado.comentario) corpo.comentario = estado.comentario
      if (contato) corpo.contato = contato
      if (!corpo.comentario && !corpo.contato) return despachar({ tipo: 'CONCLUIR' })
      complemento.mutate({ criada: estado.criada, corpo })
    },
    /** A avaliação já está salva: dá para terminar mesmo se o complemento falhar. */
    terminarSemComplemento: () => despachar({ tipo: 'CONCLUIR' }),
    complemento: { pendente: complemento.isPending, erro: complemento.error },
    /** Antes de recomeçar (totem): manda o comentário que ficou guardado e esquece o último envio. */
    descartar() {
      enviarPendente()
      complemento.reset()
    },
  }
}
