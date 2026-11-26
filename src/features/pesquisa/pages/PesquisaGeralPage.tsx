import { useQuery } from '@tanstack/react-query'
import { Carregando, TelaMensagem } from '@/components/TelaMensagem'
import type { PesquisaGeral as Pesquisa } from '@/lib/api/tipos'
import { buscarPesquisaGeral } from '../api'
import { BotaoPrincipal } from '../components/botoes'
import { EscolhaDosSetores } from '../components/EscolhaDosSetores'
import { Etapas } from '../components/Etapas'
import { SetorDoComentario } from '../components/setores'
import { useFluxoPesquisaGeral } from '../hooks/useFluxoPesquisaGeral'

/**
 * /avaliar: a pesquisa geral, o link que substitui o Google Forms. A pessoa escolhe os setores por onde passou
 * e responde só as perguntas deles; a nota de 0 a 10, no fim, vale para todos.
 */
export default function PesquisaGeralPage() {
  const consulta = useQuery({
    queryKey: ['pesquisa-geral'],
    queryFn: buscarPesquisaGeral,
    staleTime: Infinity,
  })

  if (consulta.isPending) return <Carregando texto="Abrindo a pesquisa…" />

  if (consulta.isError) {
    return (
      <TelaMensagem
        titulo="Não deu para abrir a pesquisa"
        acao={<BotaoPrincipal onClick={() => consulta.refetch()}>Tentar de novo</BotaoPrincipal>}
      >
        <p>Confira a internet do aparelho e tente de novo.</p>
      </TelaMensagem>
    )
  }

  if (consulta.data.setores.length === 0) {
    return (
      <TelaMensagem titulo="A pesquisa está pausada">
        <p>
          Nenhum setor está recebendo avaliações agora. Tente de novo mais tarde ou peça ajuda na recepção.
        </p>
      </TelaMensagem>
    )
  }

  return (
    <>
      <title>Avaliação do atendimento | FHDOD</title>
      <PesquisaGeral pesquisa={consulta.data} />
    </>
  )
}

function PesquisaGeral({ pesquisa }: { pesquisa: Pesquisa }) {
  const fluxo = useFluxoPesquisaGeral(pesquisa)
  const nomes = new Map(pesquisa.setores.map(({ slug, nome }) => [slug, nome]))
  const nomeDo = (slug: string) => nomes.get(slug) ?? slug
  const varios = fluxo.setores.length > 1
  const daVez = fluxo.setorDaPergunta

  return (
    <Etapas
      pesquisa={pesquisa}
      fluxo={fluxo}
      abertura={
        <EscolhaDosSetores
          setores={pesquisa.setores}
          iniciais={fluxo.setores.map(({ slug }) => slug)}
          aoComecar={fluxo.escolherSetores}
        />
      }
      // com um setor só, o número não diz nada: fica só o nome
      setorDaPergunta={
        daVez
          ? { nome: nomeDo(daVez.slug), ordem: varios ? daVez.ordem : undefined, primeira: daVez.primeira }
          : undefined
      }
      escolhaDoSetor={
        fluxo.enviadas.length > 1 ? (
          <SetorDoComentario
            setores={fluxo.enviadas.map(({ slug }, indice) => ({
              slug,
              nome: nomeDo(slug),
              ordem: indice + 1,
            }))}
            alvo={fluxo.alvo}
            aoEscolher={fluxo.escolherAlvo}
          />
        ) : undefined
      }
      avaliacaoBaixa={fluxo.algumaBaixa}
      avaliados={fluxo.enviadas.map(({ slug }) => nomeDo(slug))}
    />
  )
}
