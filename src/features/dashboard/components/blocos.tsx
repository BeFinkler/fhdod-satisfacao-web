// Blocos do dashboard. Cada um cuida dos seus estados: carregando, vazio e erro.
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Info, ThumbsUp, TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Ajuda } from '@/components/Ajuda'
import { Barra } from '@/components/charts/Barra'
import { GraficoEvolucao } from '@/components/charts/GraficoEvolucao'
import { Bloco, Consulta } from '@/components/layout/Pagina'
import { SeloClassificacao, SeloComentario } from '@/components/Selos'
import type {
  Classificacao,
  FiltrosDashboard,
  Granularidade,
  ItemRanking,
  Resumo,
  TipoComentario,
} from '@/lib/api/tipos'
import { nivelDaMedia } from '@/lib/escala'
import { dataCurta, decimal, npsComSinal, numero, rotuloDoPeriodo } from '@/lib/format'
import { ROTULO_COMENTARIO } from '@/lib/rotulos'
import { cn } from '@/lib/utils'
import { useEscalaDoTexto } from '@/stores/acessibilidade'
import { usePode } from '@/stores/sessao'
import { AJUDA, type AssuntoDaAjuda } from '../ajuda'
import {
  buscarCategorias,
  buscarComentarios,
  buscarEvolucao,
  buscarNpsPorSetor,
  buscarRanking,
  buscarResumo,
} from '../api'

// Indicadores de satisfação não mudam a cada segundo: recarrega a cada 60 s
// (e ao voltar para a aba); ao trocar o filtro, mantém os números anteriores esmaecidos em vez de piscar.
const leitura = {
  refetchInterval: 60_000,
  refetchOnWindowFocus: true,
  placeholderData: keepPreviousData,
} as const
/** Abaixo disso a nota oscila demais para tirar conclusão. Regra de exibição, a confirmar com o hospital. */
const AMOSTRA_PEQUENA = 30

const respostas = (total: number) => `${numero(total)} ${total === 1 ? 'resposta' : 'respostas'}`
const percentual = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0)
const classeDoLink = 'font-semibold text-primary underline underline-offset-4 hover:no-underline'

/** O "?" de um bloco, com o texto de `ajuda.ts`. */
const ajuda = (assunto: AssuntoDaAjuda) => (
  <Ajuda titulo={AJUDA[assunto].titulo} paragrafos={AJUDA[assunto].paragrafos} />
)

function Chips<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string
  opcoes: readonly (readonly [T, string])[]
  valor: T
  aoMudar: (valor: T) => void
}) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap gap-1">
      {opcoes.map(([opcao, texto]) => (
        <button
          key={opcao}
          type="button"
          aria-pressed={valor === opcao}
          onClick={() => aoMudar(opcao)}
          className={cn(
            'min-h-9 rounded-md border px-2.5 text-sm transition-colors',
            valor === opcao
              ? 'border-primary bg-primary font-medium text-primary-foreground'
              : 'border-input/60 bg-card hover:bg-muted',
          )}
        >
          {texto}
        </button>
      ))}
    </div>
  )
}

// ---------- Visão geral ----------

// Par divergente (quente e frio) com cinza no meio; conferido para daltonismo com o validador da skill dataviz.
const PARTES = [
  { chave: 'detratores', rotulo: 'Detratores', notas: 'notas de 0 a 6', cor: '#c73e32', texto: '#fff' },
  { chave: 'neutros', rotulo: 'Neutros', notas: 'notas 7 e 8', cor: '#9fb0b5', texto: 'var(--foreground)' },
  { chave: 'promotores', rotulo: 'Promotores', notas: 'notas 9 e 10', cor: 'var(--primary)', texto: '#fff' },
] as const

function Composicao({ resumo }: { resumo: Resumo }) {
  return (
    <div className="@container min-w-0">
      <div
        role="img"
        aria-label={PARTES.map((p) => `${p.rotulo}: ${percentual(resumo[p.chave], resumo.total)}%`).join(
          ', ',
        )}
        className="flex h-8 gap-0.5"
      >
        {PARTES.map((parte) => {
          const fatia = percentual(resumo[parte.chave], resumo.total)
          if (fatia === 0) return null
          return (
            <span
              key={parte.chave}
              className="flex items-center overflow-hidden rounded px-2 text-sm font-semibold"
              style={{ width: `${fatia}%`, backgroundColor: parte.cor, color: parte.texto }}
            >
              {fatia >= 9 && `${fatia}%`}
            </span>
          )
        })}
      </div>
      {/* a legenda traz o número e o percentual de cada parte: a barra sozinha não diz quantas pessoas são */}
      <dl className="mt-3 grid gap-x-5 gap-y-3 @sm:grid-cols-3">
        {PARTES.map((parte) => (
          <div key={parte.chave} className="flex items-baseline justify-between gap-3 @sm:block">
            <dt className="flex items-center gap-1.5 text-sm font-medium">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: parte.cor }}
              />
              {parte.rotulo}
              <span className="font-normal text-muted-foreground @sm:hidden">({parte.notas})</span>
            </dt>
            <dd className="numeros shrink-0 text-lg font-semibold @sm:mt-0.5">
              {numero(resumo[parte.chave])}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                ({percentual(resumo[parte.chave], resumo.total)}%)
              </span>
            </dd>
            <dd className="hidden text-xs text-muted-foreground @sm:block">{parte.notas}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CartaoNps({ resumo }: { resumo: Resumo }) {
  return (
    // o cartão tem a altura dos dois ao lado: o conteúdo fica no meio dele, sem um vazio embaixo
    <Bloco titulo="NPS do período" nivel={3} ajuda={ajuda('nps')} className="flex flex-col">
      <div className="@container flex flex-1 flex-col justify-center">
        <div className="grid gap-x-8 gap-y-5 @xl:grid-cols-[auto_minmax(0,1fr)] @xl:items-center">
          <div>
            {/* a nota aparece sempre ao lado do tamanho da amostra */}
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="numeros text-6xl font-bold tracking-tight">
                {npsComSinal(resumo.nps ?? 0)}
              </span>
              <span className="text-lg text-muted-foreground">em {respostas(resumo.total)}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">De −100 a +100</p>
          </div>
          <Composicao resumo={resumo} />
        </div>
        {resumo.total < AMOSTRA_PEQUENA && (
          <p className="mt-4 flex items-start gap-1.5 rounded-md border border-aviso-borda bg-aviso-fundo px-2.5 py-1.5 text-sm text-aviso">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            Poucas respostas: com menos de {AMOSTRA_PEQUENA}, a nota muda muito a cada avaliação.
          </p>
        )}
      </div>
    </Bloco>
  )
}

function CartaoMedia({ resumo }: { resumo: Resumo }) {
  const nivel = resumo.mediaEscala === null ? null : nivelDaMedia(resumo.mediaEscala)
  return (
    <Bloco titulo="Média das notas de 1 a 5" nivel={3} ajuda={ajuda('media')}>
      {nivel && resumo.mediaEscala !== null ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <img src={nivel.imagem} alt="" width={48} height={48} className="size-12" />
          <span className="numeros text-4xl font-bold">{decimal(resumo.mediaEscala)}</span>
          <span className="text-lg text-muted-foreground">{nivel.rotulo}</span>
        </p>
      ) : (
        <p className="text-muted-foreground">Sem notas de 1 a 5 no período.</p>
      )}
    </Bloco>
  )
}

/** Leva à lista de respostas com os mesmos filtros da tela e só a classificação pedida. */
function linkDasRespostas(params: URLSearchParams, classificacao: Classificacao) {
  const filtros = new URLSearchParams(params)
  filtros.set('classificacao', classificacao)
  return `/painel/respostas?${filtros}`
}

function CartaoNotasBaixas({ resumo, params }: { resumo: Resumo; params: URLSearchParams }) {
  const veRespostas = usePode('respostas:ver')
  return (
    <Bloco titulo="Avaliações com nota baixa" nivel={3} ajuda={ajuda('notasBaixas')}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="numeros text-4xl font-bold">{numero(resumo.notasBaixas)}</span>
        <span className="text-muted-foreground">
          {percentual(resumo.notasBaixas, resumo.total)}% das respostas
        </span>
      </p>
      <p className="mt-1 text-sm">
        Dessas, <strong className="numeros">{numero(resumo.baixissimas)}</strong>{' '}
        {resumo.baixissimas === 1 ? 'é baixíssima' : 'são baixíssimas'}.
      </p>
      {veRespostas && resumo.notasBaixas > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link to={linkDasRespostas(params, 'BAIXA')} className={classeDoLink}>
            Ver as baixas
          </Link>
          {resumo.baixissimas > 0 && (
            <Link to={linkDasRespostas(params, 'BAIXISSIMA')} className={classeDoLink}>
              Ver as baixíssimas
            </Link>
          )}
        </p>
      )}
    </Bloco>
  )
}

/**
 * Os números principais do período, com o NPS em destaque e, ao lado, a média da escala e as notas baixas. Os
 * três vêm da mesma leitura (o resumo).
 */
export function VisaoGeral({ filtros, params }: { filtros: FiltrosDashboard; params: URLSearchParams }) {
  const consulta = useQuery({
    queryKey: ['dashboard', 'resumo', filtros],
    queryFn: () => buscarResumo(filtros),
    ...leitura,
  })
  const resumo = consulta.data
  if (!resumo || resumo.total === 0) {
    return (
      <Bloco>
        <Consulta consulta={consulta} altura="h-52">
          {() => (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma resposta com estes filtros. Tente um período maior.
            </p>
          )}
        </Consulta>
      </Bloco>
    )
  }
  return (
    <div
      className={cn(
        'grid gap-5 transition-opacity @4xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]',
        consulta.isPlaceholderData && 'opacity-60',
      )}
    >
      <CartaoNps resumo={resumo} />
      <div className="grid gap-5 @2xl:grid-cols-2 @4xl:grid-cols-1">
        <CartaoMedia resumo={resumo} />
        <CartaoNotasBaixas resumo={resumo} params={params} />
      </div>
    </div>
  )
}

// ---------- NPS por setor ----------

export function NpsPorSetor({
  filtros,
  aoEscolher,
}: {
  filtros: FiltrosDashboard
  aoEscolher: (setorId: number | null) => void
}) {
  const consulta = useQuery({
    queryKey: ['dashboard', 'setores', filtros],
    queryFn: () => buscarNpsPorSetor(filtros),
    ...leitura,
  })
  return (
    <Bloco
      titulo="NPS por setor"
      nivel={3}
      ajuda={ajuda('npsPorSetor')}
      descricao={filtros.setorId ? undefined : 'Toque em um setor para ver só os números dele.'}
      lateral={
        filtros.setorId && (
          <button
            type="button"
            className="min-h-9 text-sm font-semibold text-primary underline underline-offset-4"
            onClick={() => aoEscolher(null)}
          >
            Ver todos os setores
          </button>
        )
      }
    >
      <Consulta
        consulta={consulta}
        vazio={(dados) => dados.length === 0}
        textoVazio="Nenhum setor recebeu respostas neste período."
      >
        {(setores) => {
          const minimo = setores.some((s) => (s.nps ?? 0) < 0) ? -100 : 0
          return (
            <ul className="@container grid gap-1">
              {setores.map((s) => (
                <li key={s.setorId}>
                  <button
                    type="button"
                    disabled={filtros.setorId === s.setorId}
                    onClick={() => aoEscolher(s.setorId)}
                    className="grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md px-2 py-1.5 text-left transition-colors enabled:hover:bg-muted @md:grid-cols-[minmax(0,9rem)_minmax(3rem,1fr)_auto]"
                  >
                    <span className="font-medium">{s.setor}</span>
                    <span className="col-span-2 row-start-2 @md:col-span-1 @md:row-start-auto">
                      <Barra valor={s.nps ?? 0} minimo={minimo} />
                    </span>
                    <span className="numeros text-right whitespace-nowrap">
                      <strong className="text-base">{s.nps === null ? '–' : npsComSinal(s.nps)}</strong>{' '}
                      <span className="text-sm text-muted-foreground">em {respostas(s.total)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        }}
      </Consulta>
    </Bloco>
  )
}

// ---------- Evolução ----------

const GRANULARIDADES = [
  ['DIA', 'Por dia'],
  ['SEMANA', 'Por semana'],
  ['MES', 'Por mês'],
] as const

export function Evolucao({ filtros }: { filtros: FiltrosDashboard }) {
  const dias = differenceInCalendarDays(parseISO(filtros.fim), parseISO(filtros.inicio)) + 1
  const sugerida: Granularidade = dias <= 14 ? 'DIA' : dias <= 120 ? 'SEMANA' : 'MES'
  const [escolhida, setEscolhida] = useState<Granularidade | null>(null)
  const granularidade = escolhida ?? sugerida
  // os eixos são desenhados em px: acompanham o tamanho do texto escolhido em "Acessibilidade"
  const escala = useEscalaDoTexto()
  const consulta = useQuery({
    queryKey: ['dashboard', 'evolucao', filtros, granularidade],
    queryFn: () => buscarEvolucao(filtros, granularidade),
    ...leitura,
  })
  return (
    <Bloco
      titulo="Evolução do NPS"
      nivel={3}
      ajuda={ajuda('evolucao')}
      descricao="A linha mostra a nota; as colunas, quantas respostas cada período teve."
      lateral={
        <Chips
          rotulo="Agrupar a evolução"
          opcoes={GRANULARIDADES}
          valor={granularidade}
          aoMudar={setEscolhida}
        />
      }
    >
      <Consulta
        consulta={consulta}
        altura="h-72"
        vazio={(dados) => dados.every((p) => p.total === 0)}
        textoVazio="Nenhuma resposta neste período."
      >
        {(pontos) => (
          <>
            <GraficoEvolucao
              dados={pontos}
              granularidade={granularidade}
              altura={Math.round(220 * escala)}
              fonte={Math.round(12 * escala)}
            />
            <details className="mt-3 text-sm">
              <summary className="min-h-9 w-fit font-semibold text-primary underline underline-offset-4">
                Ver os números em tabela
              </summary>
              <div className="mt-2 max-h-64 overflow-auto">
                <table className="numeros w-full max-w-md text-left">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-1 pr-4 font-medium">Período</th>
                      <th className="py-1 pr-4 font-medium">NPS</th>
                      <th className="py-1 font-medium">Respostas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pontos.map((p) => (
                      <tr key={p.periodo} className="border-t">
                        <td className="py-1 pr-4">{rotuloDoPeriodo(p.periodo, granularidade, true)}</td>
                        <td className="py-1 pr-4">{p.nps === null ? '–' : npsComSinal(p.nps)}</td>
                        <td className="py-1">{numero(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </Consulta>
    </Bloco>
  )
}

// ---------- Categorias e ranking ----------

function Media({ media }: { media: number }) {
  const nivel = nivelDaMedia(media)
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <img src={nivel.imagem} alt={nivel.rotulo} width={24} height={24} className="size-6" />
      <strong className="numeros">{decimal(media)}</strong>
    </span>
  )
}

export function Categorias({ filtros }: { filtros: FiltrosDashboard }) {
  const consulta = useQuery({
    queryKey: ['dashboard', 'categorias', filtros],
    queryFn: () => buscarCategorias(filtros),
    ...leitura,
  })
  return (
    <Bloco
      titulo="Notas por categoria"
      nivel={3}
      ajuda={ajuda('categorias')}
      descricao="Média de 1 a 5 e quanto das notas foi 4 (Bom) ou 5 (Muito bom)."
    >
      <Consulta
        consulta={consulta}
        vazio={(dados) => dados.length === 0}
        textoVazio="Nenhuma nota de 1 a 5 neste período."
      >
        {(categorias) => (
          // estreito, duas linhas por categoria (nome e média; barra e percentual); largo, uma linha só
          <ul className="@container grid gap-3">
            {categorias.map((c) => (
              <li
                key={c.categoriaId}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 @lg:grid-cols-[minmax(0,9rem)_4.5rem_minmax(3rem,1fr)_auto]"
              >
                <span className="font-medium">{c.categoria}</span>
                <Media media={c.media ?? 0} />
                <Barra valor={c.percentual45 ?? 0} />
                <span className="numeros text-right text-sm whitespace-nowrap text-muted-foreground">
                  <strong className="text-foreground">{c.percentual45}%</strong> de {numero(c.total)} notas
                </span>
              </li>
            ))}
          </ul>
        )}
      </Consulta>
    </Bloco>
  )
}

function ListaDePontos({
  titulo,
  icone,
  pontos,
  vazio,
}: {
  titulo: string
  icone: ReactNode
  pontos: ItemRanking[]
  vazio: string
}) {
  return (
    <div className="min-w-0">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        {icone}
        {titulo}
      </h4>
      {pontos.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ol className="mt-2 grid gap-2">
          {pontos.map((p) => (
            <li
              key={`${p.setorId}-${p.categoriaId}`}
              className="flex items-start gap-3 rounded-md border px-3 py-2.5"
            >
              {/* a média com o número de notas dela embaixo; à direita, o que foi avaliado e onde */}
              <span className="grid shrink-0 gap-0.5">
                <Media media={p.media} />
                <span className="numeros text-xs whitespace-nowrap text-muted-foreground">
                  {numero(p.total)} notas
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{p.categoria}</span>
                <span className="block text-sm text-muted-foreground">{p.setor}</span>
                <span className="numeros block text-sm text-muted-foreground">
                  {p.percentual45}% de notas 4 e 5
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function Ranking({ filtros }: { filtros: FiltrosDashboard }) {
  const consulta = useQuery({
    queryKey: ['dashboard', 'ranking', filtros],
    queryFn: () => buscarRanking(filtros),
    ...leitura,
  })
  return (
    <Bloco
      titulo="Melhores e piores pontos"
      nivel={3}
      ajuda={ajuda('ranking')}
      descricao="Cada ponto é uma categoria dentro de um setor. Só entram pontos com 5 notas ou mais."
    >
      <Consulta
        consulta={consulta}
        vazio={(r) => r.melhores.length === 0}
        textoVazio="Ainda não há notas suficientes para comparar."
      >
        {(ranking) => (
          <div className="@container">
            <div className="grid gap-6 @lg:grid-cols-2 @lg:gap-4">
              <ListaDePontos
                titulo="Onde está melhor"
                icone={<ThumbsUp aria-hidden className="size-4 text-primary" />}
                pontos={ranking.melhores}
                vazio=""
              />
              <ListaDePontos
                titulo="Onde precisa de atenção"
                icone={<TriangleAlert aria-hidden className="size-4 text-aviso" />}
                pontos={ranking.piores}
                vazio="Há poucos pontos avaliados para separar os piores."
              />
            </div>
          </div>
        )}
      </Consulta>
    </Bloco>
  )
}

// ---------- Comentários ----------

const TIPOS = [
  ['TODOS', 'Todos'],
  ['ELOGIO', `${ROTULO_COMENTARIO.ELOGIO}s`],
  ['RECLAMACAO', 'Reclamações'],
  ['SUGESTAO', 'Sugestões'],
  ['OUTRO', 'Outros'],
] as const

export function Comentarios({ filtros }: { filtros: FiltrosDashboard }) {
  const [tipo, setTipo] = useState<TipoComentario | 'TODOS'>('TODOS')
  const consulta = useQuery({
    queryKey: ['dashboard', 'comentarios', filtros, tipo],
    queryFn: () => buscarComentarios(filtros, tipo === 'TODOS' ? undefined : tipo),
    ...leitura,
  })
  return (
    <Bloco
      titulo="Comentários recentes"
      nivel={3}
      ajuda={ajuda('comentarios')}
      descricao={
        consulta.data ? `${numero(consulta.data.meta.total)} no período. Estes são os mais novos.` : undefined
      }
      lateral={<Chips rotulo="Tipo de comentário" opcoes={TIPOS} valor={tipo} aoMudar={setTipo} />}
    >
      <Consulta
        consulta={consulta}
        vazio={(lista) => lista.data.length === 0}
        textoVazio="Nenhum comentário deste tipo no período."
      >
        {(lista) => (
          <div className="@container">
            <ul className="grid gap-3 @2xl:grid-cols-2">
              {lista.data.map((c) => (
                <li key={c.id} className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeloComentario tipo={c.tipo} />
                    {c.classificacao !== 'NORMAL' && <SeloClassificacao valor={c.classificacao} />}
                  </div>
                  <p className="flex-1">{c.texto}</p>
                  <p className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>
                      {c.setor}, atendimento em {dataCurta(c.dataAtendimento)}
                    </span>
                    <Link to={`/painel/respostas?resposta=${c.respostaId}`} className={classeDoLink}>
                      Ver a resposta
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Consulta>
    </Bloco>
  )
}
