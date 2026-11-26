import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { WifiOff } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router'
import logo from '@/assets/logo.png'
import { ErroApi } from '@/lib/api/erro'
import type { IndicadoresTv } from '@/lib/api/tipos'
import { nivelDaMedia } from '@/lib/escala'
import { decimal, hora, npsComSinal, numero } from '@/lib/format'
import { cn } from '@/lib/utils'
import { buscarIndicadoresTv } from '../api'
import { setoresDaParte, tituloDaVisao, visoesDaTv, type Visao } from '../visoes'

const SEGUNDOS_POR_VISAO = 15
/** A visão que sai some neste tempo antes de a próxima entrar (globals.css, em "TV Wall"). */
const MS_DA_SAIDA = 450

// Par divergente escolhido para o fundo escuro e conferido para daltonismo (validador da skill dataviz).
const PARTES = [
  { chave: 'detratores', rotulo: 'Detratores', cor: '#e2634f' },
  { chave: 'neutros', rotulo: 'Neutros', cor: '#516a72' },
  { chave: 'promotores', rotulo: 'Promotores', cor: '#22a699' },
] as const

const respostas = (total: number) => `${numero(total)} ${total === 1 ? 'resposta' : 'respostas'}`
/** A ordem de um item na entrada da visão: um depois do outro, de cima para baixo. */
const naOrdem = (ordem: number) => ({ '--ordem': ordem }) as CSSProperties

/** "Novembro de 2026": o mês dos números, pelo horário em que a API os gerou. */
const mesDosNumeros = (geradoEm: string) => {
  const mes = format(parseISO(geradoEm), "MMMM 'de' yyyy", { locale: ptBR })
  return mes.charAt(0).toUpperCase() + mes.slice(1)
}

function subtituloDaVisao(visao: Visao, dados: IndicadoresTv) {
  if (visao.tipo === 'destaques') return 'Últimos 30 dias · o ponto mais bem avaliado de cada setor'
  const mes = mesDosNumeros(dados.geradoEm)
  return visao.tipo === 'geral' ? `${mes} · todos os setores` : `${mes} · do maior para o menor`
}

function VisaoGeral({ mes }: { mes: IndicadoresTv['mes'] }) {
  if (mes.total === 0 || mes.nps === null)
    return <p className="text-[3rem] text-muted-foreground">Ainda não há respostas neste mês.</p>
  const nivel = mes.mediaEscala === null ? null : nivelDaMedia(mes.mediaEscala)
  return (
    <div className="grid w-full grid-cols-[auto_1fr] items-center gap-[6rem]">
      <div className="tv-item" style={naOrdem(0)}>
        <p className="text-[2.5rem] text-muted-foreground">NPS deste mês</p>
        <p className="numeros text-[17rem]/[1] font-bold tracking-tight">{npsComSinal(mes.nps)}</p>
        {/* a nota vem sempre com o tamanho da amostra */}
        <p className="mt-[1rem] text-[3rem]">em {respostas(mes.total)}</p>
        <p className="mt-[0.5rem] text-[1.75rem] text-muted-foreground">
          Índice de recomendação, de −100 a +100
        </p>
      </div>
      <div className="grid gap-[3.5rem]">
        {nivel && mes.mediaEscala !== null && (
          <div className="tv-item flex items-center gap-[2.5rem]" style={naOrdem(1)}>
            <img src={nivel.imagem} alt="" width={96} height={96} className="size-[11rem]" />
            <div>
              <p className="text-[2.5rem] text-muted-foreground">Média das notas de 1 a 5</p>
              <p className="text-[5.5rem]/[1.1] font-bold">
                {decimal(mes.mediaEscala)} <span className="text-[3rem] font-semibold">{nivel.rotulo}</span>
              </p>
            </div>
          </div>
        )}
        <div className="tv-item" style={naOrdem(2)}>
          <div className="tv-barra flex h-[3.5rem] gap-[0.25rem]" style={naOrdem(2)}>
            {PARTES.map((parte) => (
              <span
                key={parte.chave}
                className="rounded-[0.5rem]"
                style={{ width: `${(mes[parte.chave] / mes.total) * 100}%`, backgroundColor: parte.cor }}
              />
            ))}
          </div>
          <ul className="mt-[1.25rem] flex flex-wrap gap-x-[3rem] gap-y-[0.5rem] text-[2rem]">
            {PARTES.map((parte) => (
              <li key={parte.chave} className="flex items-center gap-[0.75rem]">
                <span className="size-[1.5rem] rounded-[0.25rem]" style={{ backgroundColor: parte.cor }} />
                {parte.rotulo} <strong>{Math.round((mes[parte.chave] / mes.total) * 100)}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function PorSetor({ setores, minimo }: { setores: IndicadoresTv['npsPorSetor']; minimo: number }) {
  if (setores.length === 0)
    return <p className="text-[3rem] text-muted-foreground">Ainda não há respostas neste mês.</p>
  return (
    <ul className="grid w-full gap-[1.75rem]">
      {setores.map((s, i) => {
        const nps = s.nps ?? 0
        const largura = (Math.abs(nps) / (100 - minimo)) * 100
        const zero = ((0 - minimo) / (100 - minimo)) * 100
        return (
          <li
            key={s.setor}
            className="tv-item grid grid-cols-[34rem_1fr_30rem] items-center gap-[2.5rem] text-[2.75rem]/[1.2]"
            style={naOrdem(i)}
          >
            {/* nome longo quebra em duas linhas, em vez de ser cortado: na TV ninguém passa o mouse para ler */}
            <span className="line-clamp-2 font-semibold text-balance">{s.setor}</span>
            <span className="relative h-[2.5rem] border-l-2 border-input">
              <span
                className="tv-barra absolute inset-y-0"
                style={{
                  ...naOrdem(i),
                  left: `${nps < 0 ? zero - largura : zero}%`,
                  width: `${Math.max(largura, 0.5)}%`,
                  backgroundColor: nps < 0 ? '#e2634f' : 'var(--primary)',
                  borderRadius: nps < 0 ? '0.5rem 0 0 0.5rem' : '0 0.5rem 0.5rem 0',
                  transformOrigin: nps < 0 ? 'right' : 'left',
                }}
              />
            </span>
            <span className="numeros text-right">
              <strong className="text-[3.5rem]">{npsComSinal(nps)}</strong>{' '}
              <span className="text-[2rem] text-muted-foreground">em {respostas(s.total)}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Destaques({ destaques }: { destaques: IndicadoresTv['destaques'] }) {
  if (destaques.length === 0)
    return (
      <p className="text-[3rem] text-muted-foreground">Ainda não há notas suficientes para os destaques.</p>
    )
  return (
    <ul className="grid w-full grid-cols-3 gap-[3rem]">
      {destaques.map((d, i) => {
        const nivel = nivelDaMedia(d.media)
        return (
          <li
            key={`${d.setor}-${d.categoria}`}
            className="tv-item rounded-[1.5rem] bg-card p-[3rem]"
            style={naOrdem(i)}
          >
            <img src={nivel.imagem} alt="" width={96} height={96} className="size-[9rem]" />
            <p className="mt-[2rem] text-[3.25rem]/[1.15] font-bold">{d.categoria}</p>
            <p className="text-[2.25rem] text-muted-foreground">{d.setor}</p>
            <p className="mt-[2rem] text-[2.25rem]">
              Média <strong className="text-[3rem]">{decimal(d.media)}</strong> de 5
            </p>
            <p className="text-[2.25rem]">
              <strong className="text-[3rem]">{d.percentual45}%</strong> de notas boas
            </p>
          </li>
        )
      })}
    </ul>
  )
}

function Mensagem({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="dark fixed inset-0 flex flex-col items-center justify-center gap-[2rem] bg-background p-[4rem] text-center text-foreground">
      <span className="rounded-[1rem] bg-white px-[1.5rem] py-[1rem]">
        <img src={logo} alt="FHDOD" width={450} height={150} className="h-[5rem] w-auto" />
      </span>
      <h1 className="text-[4rem] font-bold">{titulo}</h1>
      <p className="max-w-[60rem] text-[2.25rem] text-muted-foreground">{texto}</p>
    </div>
  )
}

/**
 * Passa para a próxima visão a cada `SEGUNDOS_POR_VISAO`: a atual some em `MS_DA_SAIDA` e a próxima entra. Com
 * "reduzir movimento" ligado no aparelho, a troca é direta. `passo` só cresce; a visão é `passo % quantas`.
 */
function useRotacao() {
  const [passo, setPasso] = useState(0)
  const [saindo, setSaindo] = useState(false)
  useEffect(() => {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let saida: number | undefined
    const troca = window.setInterval(() => {
      if (semMovimento) return setPasso((atual) => atual + 1)
      setSaindo(true)
      saida = window.setTimeout(() => {
        setPasso((atual) => atual + 1)
        setSaindo(false)
      }, MS_DA_SAIDA)
    }, SEGUNDOS_POR_VISAO * 1000)
    return () => {
      window.clearInterval(troca)
      window.clearTimeout(saida)
    }
  }, [])
  return { passo, saindo }
}

/** /tv#<token>: tela pública para corredores e recepções. Só números gerais, nunca dado pessoal. */
export default function TvPage() {
  // o token vem depois do "#": essa parte da URL não é enviada ao servidor
  const token = useLocation().hash.slice(1)
  const { passo, saindo } = useRotacao()
  const consulta = useQuery({
    queryKey: ['tv', token],
    queryFn: () => buscarIndicadoresTv(token),
    enabled: token !== '',
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false,
    // tenta mesmo com o navegador dizendo que está offline: a falha mostra "Sem conexão" no rodapé, com os
    // últimos números na tela; pausada, a consulta deixaria o rodapé dizendo "Atualizado às" sem atualizar
    networkMode: 'always',
  })

  useEffect(() => {
    document.documentElement.classList.add('tv')
    const telaCheia = () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined)
    }
    document.addEventListener('click', telaCheia)
    return () => {
      document.documentElement.classList.remove('tv')
      document.removeEventListener('click', telaCheia)
    }
  }, [])

  const telaRecusada = consulta.error instanceof ErroApi && consulta.error.status === 401
  if (token === '' || telaRecusada) {
    return (
      <Mensagem
        titulo="Esta tela não está ativa"
        texto="O link pode estar incompleto ou a tela foi desativada. Peça um novo link a quem administra o sistema."
      />
    )
  }
  const dados = consulta.data
  if (!dados) {
    return consulta.isError ? (
      <Mensagem titulo="Sem conexão" texto="A tela tenta de novo sozinha em instantes." />
    ) : (
      <Mensagem titulo="Carregando os indicadores" texto="Só um instante." />
    )
  }

  const visoes = visoesDaTv(dados.npsPorSetor.length)
  const atual = passo % visoes.length
  const visao = visoes[atual]!
  // a mesma escala em todas as partes do "NPS por setor", para as barras serem comparáveis entre elas
  const minimo = dados.npsPorSetor.some((s) => (s.nps ?? 0) < 0) ? -100 : 0

  return (
    <div className="dark fixed inset-0 flex flex-col bg-background px-[4rem] py-[3rem] text-foreground">
      <title>TV Wall | FHDOD</title>
      <header className="flex items-center justify-between gap-[2rem]">
        {/* logo sobre placa branca: o vermelho da marca continua legível no fundo escuro */}
        <span className="shrink-0 rounded-[0.75rem] bg-white px-[1.25rem] py-[0.75rem]">
          <img
            src={logo}
            alt="FHDOD, Fundação Hospitalar Dr. Oswaldo Diesel"
            width={450}
            height={150}
            className="h-[4rem] w-auto"
          />
        </span>
        <div key={passo} className={cn('tv-titulo text-right', saindo && 'tv-saindo')}>
          <h1 className="text-[3rem]/[1.2] font-bold">{tituloDaVisao(visao)}</h1>
          <p className="text-[1.75rem] text-muted-foreground">{subtituloDaVisao(visao, dados)}</p>
        </div>
      </header>

      <main
        key={passo}
        className={cn('tv-visao flex min-h-0 flex-1 items-center py-[2rem]', saindo && 'tv-saindo')}
      >
        {visao.tipo === 'geral' && <VisaoGeral mes={dados.mes} />}
        {visao.tipo === 'setores' && (
          <PorSetor setores={setoresDaParte(dados.npsPorSetor, visao.parte)} minimo={minimo} />
        )}
        {visao.tipo === 'destaques' && <Destaques destaques={dados.destaques} />}
      </main>

      <footer className="flex items-center gap-[2rem] text-[1.75rem] text-muted-foreground">
        {/* qual visão está na tela e quanto falta para a próxima */}
        <ol className="flex flex-1 gap-[0.75rem]" aria-label="Visões da tela">
          {visoes.map((v, i) => (
            <li
              key={tituloDaVisao(v)}
              aria-current={i === atual ? 'step' : undefined}
              className="h-[0.5rem] flex-1 overflow-hidden rounded-full bg-card"
            >
              <span className="sr-only">{tituloDaVisao(v)}</span>
              {i === atual && (
                <span
                  key={passo}
                  className="block h-full origin-left bg-primary"
                  style={{
                    animation: `tv-progresso ${SEGUNDOS_POR_VISAO * 1000 - MS_DA_SAIDA}ms linear both`,
                  }}
                />
              )}
              {i < atual && <span className="block h-full bg-input" />}
            </li>
          ))}
        </ol>
        <p className={cn('flex items-center gap-[0.75rem]', consulta.isError && 'text-foreground')}>
          {consulta.isError && <WifiOff aria-hidden className="size-[2rem]" />}
          {consulta.isError ? 'Sem conexão. Números das' : 'Atualizado às'}{' '}
          {hora(new Date(consulta.dataUpdatedAt))}
        </p>
      </footer>
    </div>
  )
}
