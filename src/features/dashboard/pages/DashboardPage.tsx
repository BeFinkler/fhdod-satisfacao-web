import { useMutation } from '@tanstack/react-query'
import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Ajuda } from '@/components/Ajuda'
import { Pagina, Secao } from '@/components/layout/Pagina'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Arquivo } from '@/lib/api/cliente'
import { mensagemGeral } from '@/lib/api/erro'
import type { FiltrosDashboard } from '@/lib/api/tipos'
import { dataCurta } from '@/lib/format'
import { usePode } from '@/stores/sessao'
import { AJUDA } from '../ajuda'
import { exportarRespostas, exportarResumo, exportarResumoPdf } from '../api'
import { Categorias, Comentarios, Evolucao, NpsPorSetor, Ranking, VisaoGeral } from '../components/blocos'
import { Filtros } from '../components/Filtros'
import { GuiaDosIndicadores } from '../components/GuiaDosIndicadores'
import { useFiltros } from '../filtros'

const EXPORTACOES = {
  resumo: { rotulo: 'Resumo dos indicadores (Excel)', gerando: 'Gerando a planilha…', gerar: exportarResumo },
  resumoPdf: { rotulo: 'Resumo dos indicadores (PDF)', gerando: 'Gerando o PDF…', gerar: exportarResumoPdf },
  respostas: {
    rotulo: 'Todas as respostas (Excel)',
    gerando: 'Gerando a planilha…',
    gerar: exportarRespostas,
  },
} as const
type Exportacao = keyof typeof EXPORTACOES

function baixar({ nome, conteudo }: Arquivo) {
  const url = URL.createObjectURL(conteudo)
  const link = Object.assign(document.createElement('a'), { href: url, download: nome })
  document.body.append(link)
  link.click()
  link.remove()
  // o navegador lê o arquivo depois do clique: liberado na hora, o download pode não sair em alguns navegadores
  setTimeout(() => URL.revokeObjectURL(url), 40_000)
}

/**
 * A exportação usa os mesmos filtros da tela e só traz o que o usuário pode ver: a API gera o arquivo com o
 * escopo da sessão. Enquanto ele é gerado, o botão continua com o foco, mas não abre o menu.
 */
function Exportar({ filtros }: { filtros: FiltrosDashboard }) {
  const podeResumo = usePode('exportacao:resumo')
  const podeDetalhar = usePode('exportacao:detalhada')
  const [aberto, setAberto] = useState(false)
  const exportacao = useMutation({
    mutationFn: (qual: Exportacao) => EXPORTACOES[qual].gerar(filtros),
    // sem rede, o TanStack Query guardaria o pedido até a conexão voltar, com o botão em "Gerando…" e o arquivo
    // baixando sozinho depois: assim, o aviso de sem conexão aparece na hora
    networkMode: 'always',
    onSuccess: (arquivo) => {
      baixar(arquivo)
      toast.success('Arquivo baixado', { description: `${arquivo.nome}, com os mesmos filtros da tela.` })
    },
    onError: (erro) => toast.error(mensagemGeral(erro, 'Não deu para gerar o arquivo agora. Tente de novo.')),
  })
  if (!podeResumo && !podeDetalhar) return null

  const gerando = exportacao.isPending ? EXPORTACOES[exportacao.variables].gerando : null
  const item = (qual: Exportacao) => (
    <DropdownMenuItem className="min-h-10" onSelect={() => exportacao.mutate(qual)}>
      {EXPORTACOES[qual].rotulo}
    </DropdownMenuItem>
  )
  return (
    <>
      <DropdownMenu open={aberto} onOpenChange={(abrir) => setAberto(abrir && !exportacao.isPending)}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-disabled={exportacao.isPending || undefined}>
            {gerando ? <LoaderCircle aria-hidden className="animate-spin" /> : <Download aria-hidden />}
            {gerando ?? 'Exportar'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={8} className="min-w-64">
          <DropdownMenuLabel className="max-w-72 text-xs font-normal text-muted-foreground">
            O arquivo sai com os mesmos filtros da tela.
          </DropdownMenuLabel>
          {podeResumo && item('resumo')}
          {podeResumo && item('resumoPdf')}
          {podeDetalhar && item('respostas')}
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" className="sr-only">
        {gerando}
      </span>
    </>
  )
}

/**
 * /painel: visão geral em segundos, do hospital até o setor e o turno. A página segue a ordem em que a gestão
 * lê os números: o resultado do período, como ele evolui e em cada aspecto do atendimento, a comparação entre
 * os setores e, por fim, o que os pacientes escreveram. Os filtros e a exportação ficam em cima de tudo.
 */
export default function DashboardPage() {
  const estado = useFiltros()
  const { filtros, alterar, params } = estado
  const veComentarios = usePode('comentarios:ver')

  return (
    <Pagina
      titulo="Indicadores de satisfação"
      descricao={`De ${dataCurta(filtros.inicio)} a ${dataCurta(filtros.fim)}, pelo ${filtros.base === 'ENVIO' ? 'dia em que a resposta foi enviada' : 'dia do atendimento'}.`}
      acoes={
        <>
          <GuiaDosIndicadores />
          <Exportar filtros={filtros} />
        </>
      }
    >
      <Filtros {...estado} ajuda={<Ajuda {...AJUDA.filtros} />} />
      <div className="mt-3 grid gap-10">
        <Secao titulo="Visão geral" descricao="O resultado do período e dos filtros escolhidos.">
          <VisaoGeral filtros={filtros} params={params} />
        </Secao>
        <Secao
          titulo="Desempenho"
          descricao="Como a nota muda ao longo do período e em cada aspecto do atendimento."
        >
          <div className="grid gap-5 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <Evolucao filtros={filtros} />
            <Categorias filtros={filtros} />
          </div>
        </Secao>
        <Secao
          titulo="Comparação entre setores"
          descricao="Quais setores e pontos se destacam e quais precisam de atenção."
        >
          {/* o ranking fica mais largo: assim as duas listas dele cabem lado a lado */}
          <div className="grid gap-5 @4xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <NpsPorSetor
              filtros={filtros}
              aoEscolher={(setorId) => alterar({ setor: setorId ? String(setorId) : null })}
            />
            <Ranking filtros={filtros} />
          </div>
        </Secao>
        {veComentarios && (
          <Secao
            titulo="Comentários dos pacientes"
            descricao="O que os pacientes escreveram, do mais novo para o mais antigo."
          >
            <Comentarios filtros={filtros} />
          </Secao>
        )}
      </div>
    </Pagina>
  )
}
