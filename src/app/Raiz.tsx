import { Suspense, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigationType } from 'react-router'
import { Carregando, TelaMensagem } from '@/components/TelaMensagem'
import { carregarVLibras } from '@/lib/vlibras'
import { useAcessibilidade } from '@/stores/acessibilidade'

const classeDoLink = 'font-semibold text-primary underline underline-offset-4 hover:no-underline'

/** O tamanho do texto escolhido em "Acessibilidade" vale para todas as telas, até a pessoa recarregar a página. */
function useTamanhoDoTexto() {
  const tamanho = useAcessibilidade((s) => s.tamanhoDoTexto)
  useEffect(() => {
    const html = document.documentElement
    if (tamanho === 'normal') delete html.dataset.texto
    else html.dataset.texto = tamanho
  }, [tamanho])
}

/**
 * O botão do VLibras entra depois que a tela já abriu, quando o navegador está livre, para não atrasar a
 * pesquisa. Fica fora da TV, que ninguém toca, e do totem, que não pode guardar nada entre um paciente e outro.
 */
function useVLibrasNaPagina() {
  const semVLibras = /^\/(tv|totem)(\/|$)/.test(useLocation().pathname)
  useEffect(() => {
    if (semVLibras) return
    const carregar = () => void carregarVLibras().catch(() => undefined)
    // versões antigas do Safari, no iPhone, não têm o requestIdleCallback
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(carregar, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(carregar, 1500)
    return () => window.clearTimeout(id)
  }, [semVLibras])
}

/**
 * Ao ir para outra página por um link, ela abre no topo: sem isso, quem clicava em "Ver a resposta" no fim do
 * dashboard caía no meio da lista de respostas. Trocar um filtro (só a query string muda) não sobe a página, e o
 * "Voltar" do navegador fica com a rolagem que ele mesmo devolve. Não usa o ScrollRestoration do React Router,
 * que guardaria as posições no sessionStorage: o front não guarda nada no navegador.
 */
function useTopoAoTrocarDePagina() {
  const { pathname } = useLocation()
  const tipo = useNavigationType()
  const anterior = useRef(pathname)
  useEffect(() => {
    if (anterior.current === pathname) return
    anterior.current = pathname
    if (tipo !== 'POP') window.scrollTo(0, 0)
  }, [pathname, tipo])
}

/** Cada área (pesquisa, totem, painel, TV) é baixada só quando alguém a acessa. */
export function Raiz() {
  useTamanhoDoTexto()
  useVLibrasNaPagina()
  useTopoAoTrocarDePagina()
  return (
    <Suspense fallback={<Carregando />}>
      <Outlet />
    </Suspense>
  )
}

export function NaoEncontrada() {
  return (
    <TelaMensagem
      titulo="Página não encontrada"
      acao={
        <div className="flex flex-col items-start gap-4">
          <Link to="/avaliar" className={classeDoLink}>
            Avaliar o atendimento
          </Link>
          <Link to="/login" className={classeDoLink}>
            Ir para o painel da gestão
          </Link>
        </div>
      }
    >
      <p>
        Este endereço não existe. Se você veio avaliar o atendimento, use o link abaixo ou aponte a câmera de
        novo para o QR Code do setor.
      </p>
    </TelaMensagem>
  )
}

export function ErroInesperado() {
  return (
    <TelaMensagem
      titulo="Esta tela não abriu"
      acao={
        <button type="button" className={classeDoLink} onClick={() => window.location.reload()}>
          Recarregar a página
        </button>
      }
    >
      <p>Confira a internet do aparelho e recarregue a página.</p>
    </TelaMensagem>
  )
}
