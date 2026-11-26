import type { PesquisaPublica } from '@/lib/api/tipos'
import { AberturaDoSetor } from '../components/AberturaDoSetor'
import { CarregaPesquisa } from '../components/CarregaPesquisa'
import { Etapas } from '../components/Etapas'
import { useFluxoPesquisa } from '../hooks/useFluxoPesquisa'

/** /s/:setor: pesquisa pelo celular, tablet ou computador. */
export default function PesquisaPage() {
  return <CarregaPesquisa>{(pesquisa) => <Pesquisa pesquisa={pesquisa} />}</CarregaPesquisa>
}

function Pesquisa({ pesquisa }: { pesquisa: PesquisaPublica }) {
  const fluxo = useFluxoPesquisa(pesquisa, 'WEB')
  return (
    <Etapas
      pesquisa={pesquisa}
      fluxo={fluxo}
      abertura={<AberturaDoSetor setor={pesquisa.setor.nome} aoComecar={fluxo.comecar} />}
    />
  )
}
