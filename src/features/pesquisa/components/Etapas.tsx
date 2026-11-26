import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { ErroApi, mensagemDeErro } from '@/lib/api/erro'
import type { PesquisaPublica } from '@/lib/api/tipos'
import { telefoneDepoisDoComentario } from '../fluxo'
import type { FluxoDasEtapas } from '../hooks/useFluxoPesquisa'
import { BotaoDiscreto, BotaoPrincipal } from './botoes'
import { CampoIsca } from './CampoIsca'
import { EscalaNps } from './EscalaNps'
import { EtapaComentario } from './EtapaComentario'
import { EtapaContato } from './EtapaContato'
import { EtapaData, EtapaTurno } from './EtapaDataTurno'
import { Aviso, Moldura, Titulo } from './Moldura'
import { Pergunta } from './Pergunta'
import { MarcadorDoSetor } from './setores'
import { TelaAgradecimento } from './TelaAgradecimento'

/**
 * Desenha a etapa atual da pesquisa. É a mesma sequência no celular, no computador, no totem e na pesquisa
 * geral; o que muda vem pelas props: a abertura de cada uma e, na geral, o setor de cada pergunta e do comentário.
 */
export function Etapas({
  pesquisa,
  fluxo,
  abertura,
  reinicio,
  setorDaPergunta,
  escolhaDoSetor,
  avaliacaoBaixa,
  avaliados,
}: {
  pesquisa: Pick<PesquisaPublica, 'turnos' | 'npsTexto' | 'textoLimiteCaracteres'>
  fluxo: FluxoDasEtapas
  /** a primeira tela: o setor do QR Code ou, na pesquisa geral, a escolha dos setores */
  abertura: ReactNode
  /** só no totem: contagem para a próxima avaliação */
  reinicio?: { segundos: number; aoReiniciar: () => void }
  /** pesquisa geral: o setor da pergunta na tela, com o número dele quando há mais de um */
  setorDaPergunta?: { nome: string; ordem?: number; primeira: boolean }
  /** pesquisa geral: "Sobre qual setor?", na tela do comentário, quando há mais de um */
  escolhaDoSetor?: ReactNode
  /** pesquisa geral: a pergunta do comentário vale para a visita toda, não só para o setor escolhido */
  avaliacaoBaixa?: boolean
  /** pesquisa geral: os setores avaliados, para o agradecimento */
  avaliados?: string[]
}) {
  const { estado } = fluxo
  const conteudo = useRef<HTMLDivElement>(null)
  const isca = useRef<HTMLInputElement>(null)
  const chaveDaTela = `${estado.etapa}-${estado.indice}`

  // A cada tela, o foco vai para o título: o leitor de tela anuncia a nova pergunta
  // e quem usa teclado recomeça do topo.
  useEffect(() => {
    conteudo.current?.querySelector('h1')?.focus()
  }, [chaveDaTela])

  // O prazo de 30 min do complemento venceu: a avaliação está salva, não há o que repetir.
  const prazoVencido = fluxo.complemento.erro instanceof ErroApi && fluxo.complemento.erro.status === 401
  const erroDoComplemento = fluxo.complemento.erro
    ? prazoVencido
      ? 'O tempo para complementar terminou. Sua avaliação já está salva.'
      : `${mensagemDeErro(fluxo.complemento.erro, 'Não deu para enviar agora.')} Sua avaliação já está salva.`
    : null
  const baixa = avaliacaoBaixa ?? (estado.criada !== null && estado.criada.classificacao !== 'NORMAL')

  const voltar = (
    <BotaoDiscreto onClick={fluxo.voltar} className="-ml-4">
      <ArrowLeft aria-hidden className="size-6" />
      Voltar
    </BotaoDiscreto>
  )

  if (estado.etapa === 'abertura') {
    // `contents`: a abertura desenha a própria moldura; esta caixa só guarda a referência para o foco
    return (
      <div ref={conteudo} className="contents">
        {abertura}
      </div>
    )
  }

  if (estado.etapa === 'agradecimento') {
    return (
      <Moldura progresso={1}>
        <div ref={conteudo} className="flex flex-1 flex-col">
          <TelaAgradecimento reinicio={reinicio} avaliados={avaliados} />
        </div>
      </Moldura>
    )
  }

  const rodape =
    estado.etapa === 'pergunta' ? (
      <>
        {voltar}
        <BotaoDiscreto onClick={fluxo.pular} className="-mr-4">
          Pular
        </BotaoDiscreto>
      </>
    ) : estado.etapa === 'comentario' ? null : (
      voltar
    )

  return (
    <Moldura progresso={fluxo.progresso} rodape={rodape}>
      <div ref={conteudo} key={chaveDaTela} className="flex flex-1 flex-col">
        {estado.etapa === 'data' && (
          <EtapaData valor={estado.dataAtendimento} aoEscolher={fluxo.definirData} />
        )}

        {estado.etapa === 'turno' && (
          <EtapaTurno turnos={pesquisa.turnos} valor={estado.turnoId} aoEscolher={fluxo.definirTurno} />
        )}

        {fluxo.perguntaAtual && (
          <>
            {setorDaPergunta && (
              <MarcadorDoSetor
                nome={setorDaPergunta.nome}
                ordem={setorDaPergunta.ordem}
                entrando={setorDaPergunta.primeira}
              />
            )}
            <Titulo>
              {/* o marcador do setor é só visual: o leitor de tela ouve o setor aqui, junto com a pergunta */}
              {setorDaPergunta && <span className="sr-only">{setorDaPergunta.nome}: </span>}
              {fluxo.perguntaAtual.texto}
            </Titulo>
            <div className="mt-6">
              <Pergunta
                pergunta={fluxo.perguntaAtual}
                resposta={estado.respostas[fluxo.perguntaAtual.id]}
                limiteTexto={pesquisa.textoLimiteCaracteres}
                aoResponder={fluxo.responder}
              />
            </div>
          </>
        )}

        {estado.etapa === 'nps' && (
          <>
            <Titulo>{pesquisa.npsTexto}</Titulo>
            <div className="mt-6">
              <EscalaNps
                pergunta={pesquisa.npsTexto}
                valor={estado.nps}
                desabilitada={fluxo.envio.pendente}
                aoSelecionar={fluxo.selecionarNps}
              />
            </div>
            {fluxo.envio.erro && (
              <Aviso className="mt-5">
                {mensagemDeErro(fluxo.envio.erro, 'Não deu para enviar agora.')} Suas respostas continuam
                aqui.
              </Aviso>
            )}
            <CampoIsca ref={isca} />
            <BotaoPrincipal
              className="mt-6"
              disabled={estado.nps === null || fluxo.envio.pendente}
              onClick={() => fluxo.enviar(isca.current?.value)}
            >
              {fluxo.envio.pendente ? 'Enviando…' : fluxo.envio.erro ? 'Tentar de novo' : 'Enviar avaliação'}
            </BotaoPrincipal>
            {estado.nps === null && (
              <p className="mt-3 text-muted-foreground">Toque em uma nota para poder enviar.</p>
            )}
          </>
        )}

        {estado.etapa === 'comentario' && estado.criada && (
          <EtapaComentario
            avaliacaoBaixa={baixa}
            telefoneDepois={telefoneDepoisDoComentario(estado)}
            escolhaDoSetor={escolhaDoSetor}
            inicial={estado.comentario}
            limite={pesquisa.textoLimiteCaracteres}
            enviando={fluxo.complemento.pendente}
            erro={erroDoComplemento}
            aoEnviar={fluxo.comentar}
            aoPular={() => (prazoVencido ? fluxo.terminarSemComplemento() : fluxo.comentar(null))}
          />
        )}

        {estado.etapa === 'contato' && (
          <EtapaContato
            avaliacaoBaixa={baixa}
            enviando={fluxo.complemento.pendente}
            erro={erroDoComplemento}
            aoEnviar={fluxo.concluir}
            aoRecusar={() => (prazoVencido ? fluxo.terminarSemComplemento() : fluxo.concluir())}
          />
        )}
      </div>
    </Moldura>
  )
}
