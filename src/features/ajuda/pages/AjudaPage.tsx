import { Mail } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { Bloco, Pagina } from '@/components/layout/Pagina'
import { gruposDoMenu } from '@/components/layout/menu'
import { AJUDA, type AssuntoDaAjuda } from '@/features/dashboard/ajuda'
import { usePode, useSessao } from '@/stores/sessao'
import { CONTATOS, secoesVisiveis, type IdDaSecao } from '../secoes'

const SEM_PERMISSOES: never[] = []
const classeDoLink = 'font-semibold text-primary underline underline-offset-4 hover:no-underline'

/** Um trecho da ajuda: título curto e o texto, com a largura boa para ler. */
function Topico({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="grid max-w-[70ch] gap-1.5">
      {titulo && <h3 className="font-semibold">{titulo}</h3>}
      <div className="grid gap-2 text-muted-foreground">{children}</div>
    </div>
  )
}

/** Um assunto dos indicadores, com o mesmo texto do "?" do dashboard. */
function TopicoDosIndicadores({ assunto }: { assunto: AssuntoDaAjuda }) {
  return (
    <Topico titulo={AJUDA[assunto].titulo}>
      {AJUDA[assunto].paragrafos.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
    </Topico>
  )
}

function SecaoMenu() {
  const permissoes = useSessao((s) => s.sessao?.permissoes ?? SEM_PERMISSOES)
  return (
    <ul className="grid gap-3">
      {gruposDoMenu(permissoes)
        .flat()
        .map(({ para, rotulo, descricao, icone: Icone }) => (
          <li key={para} className="flex max-w-[70ch] gap-3">
            <Icone aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              <Link to={para} className={classeDoLink}>
                {rotulo}
              </Link>
              : {descricao}
            </p>
          </li>
        ))}
    </ul>
  )
}

function SecaoIndicadores() {
  return (
    <div className="grid gap-5">
      <Topico>
        <p>
          No painel, o NPS aparece sempre com o número de respostas ao lado: com poucas respostas, ele muda
          muito a cada avaliação. O sistema faz todas as contas; o painel só mostra o resultado.
        </p>
      </Topico>
      <TopicoDosIndicadores assunto="nps" />
      <TopicoDosIndicadores assunto="media" />
      <TopicoDosIndicadores assunto="notasBaixas" />
      <Topico>
        <p>
          Os outros números (a evolução, as categorias, a comparação entre os setores e os comentários) têm um
          botão de ajuda ao lado do título, nos{' '}
          <Link to="/painel" className={classeDoLink}>
            Indicadores
          </Link>
          , e o guia &quot;Como ler os indicadores&quot;, no topo da página, reúne todos.
        </p>
      </Topico>
    </div>
  )
}

function SecaoPesquisa() {
  return (
    <div className="grid gap-5">
      <Topico>
        <p>
          A pesquisa é anônima, não pede login nem aplicativo e leva menos de 2 minutos. Ela chega ao paciente
          de três jeitos:
        </p>
      </Topico>
      <Topico titulo="O QR Code de cada setor">
        <p>
          Cada setor tem o próprio link (/s/ e o nome do setor) e um QR Code para imprimir, em{' '}
          <Link to="/painel/setores" className={classeDoLink}>
            Setores e perguntas
          </Link>
          , no botão &quot;Links e QR Code&quot; do setor. O paciente aponta a câmera do celular e responde as
          perguntas daquele setor.
        </p>
      </Topico>
      <Topico titulo="O link geral (/avaliar)">
        <p>
          A pessoa marca os setores por onde passou e responde só as perguntas deles. Serve para o WhatsApp, o
          site e cartazes fora dos setores. O link e o QR Code dele ficam no topo de Setores e perguntas, para
          quem cadastra os setores.
        </p>
      </Topico>
      <Topico titulo="O totem">
        <p>
          Um tablet ou totem no setor, aberto no &quot;Link do totem&quot; (/totem/ e o nome do setor), que
          fica no mesmo botão do QR Code. A tela fica cheia e a pesquisa reinicia sozinha para o próximo
          paciente.
        </p>
      </Topico>
      <Topico>
        <p>
          No fim, o paciente pode deixar um comentário e um telefone para o hospital retornar. No totem, o
          telefone só é oferecido quando a avaliação é baixa.
        </p>
      </Topico>
    </div>
  )
}

function SecaoRetornos() {
  return (
    <div className="grid gap-5">
      <Topico>
        <p>
          Em{' '}
          <Link to="/painel/contatos" className={classeDoLink}>
            Pedidos de retorno
          </Link>{' '}
          estão as pessoas que deixaram o telefone e autorizaram o hospital a ligar, do pedido mais recente
          para o mais antigo, com a nota e o comentário de cada uma.
        </p>
        <p>
          O telefone aparece mascarado (•••• 0042). &quot;Revelar telefone&quot; mostra o número completo
          depois de uma confirmação, e cada vez que alguém revela um número, isso fica registrado no sistema.
        </p>
      </Topico>
    </div>
  )
}

function SecaoExportacoes() {
  const podeResumo = usePode('exportacao:resumo')
  const podeDetalhar = usePode('exportacao:detalhada')
  return (
    <div className="grid gap-5">
      <Topico>
        <p>
          Nos{' '}
          <Link to="/painel" className={classeDoLink}>
            Indicadores
          </Link>
          , o botão &quot;Exportar&quot; gera o arquivo com os mesmos filtros da tela: período, data
          considerada, setor, turno e canal.
        </p>
      </Topico>
      {podeResumo && (
        <Topico titulo="Resumo dos indicadores, em Excel ou em PDF">
          <p>
            Quem gerou e quando, os filtros usados, os indicadores, o NPS por setor e as médias por categoria.
            O PDF cabe em poucas páginas A4, para imprimir ou mandar à direção.
          </p>
        </Topico>
      )}
      {podeDetalhar && (
        <Topico titulo="Todas as respostas, em Excel">
          <p>
            As respostas (uma linha por avaliação), os itens (uma linha por pergunta respondida) e os
            comentários, em abas ligadas pelo código da resposta.
          </p>
        </Topico>
      )}
      <Topico>
        <p>
          O telefone para retorno só vai no arquivo de quem pode ver os pedidos de retorno, e cada exportação
          fica registrada no sistema.
        </p>
      </Topico>
    </div>
  )
}

function SecaoSenha() {
  const gerenciaUsuarios = usePode('usuarios:gerenciar')
  return (
    <div className="grid gap-5">
      <Topico titulo="Trocar a senha">
        <p>
          Toque no seu nome, no alto da tela, e em &quot;Trocar senha&quot;. A nova senha precisa de pelo
          menos 10 caracteres, com letras e números.
        </p>
      </Topico>
      <Topico titulo="Esqueceu a senha?">
        <p>
          Peça a um Super Admin do hospital: em Usuários, &quot;Redefinir senha&quot; cria uma senha
          provisória, que você troca logo no primeiro acesso.
        </p>
        {gerenciaUsuarios && (
          <p>
            Você gerencia os usuários: quando alguém esquecer a senha, é em{' '}
            <Link to="/painel/usuarios" className={classeDoLink}>
              Usuários
            </Link>{' '}
            que você cria a senha provisória da pessoa.
          </p>
        )}
      </Topico>
    </div>
  )
}

const PASSOS_DA_TV = [
  <>
    Em{' '}
    <Link to="/painel/tv" className={classeDoLink}>
      Telas de TV
    </Link>
    , toque em &quot;Nova tela&quot; e diga onde a TV fica, como &quot;Recepção principal&quot;.
  </>,
  <>
    Copie o link, que aparece uma vez só. Se quem vai instalar a TV é outra pessoa (a TI, por exemplo), mande
    o link para ela por e-mail ou pelo chat interno: ela não precisa de acesso ao painel.
  </>,
  <>Abra o link no navegador da TV e toque uma vez na tela, para ela ficar em tela cheia.</>,
  <>
    Confira em Telas de TV o &quot;Último acesso&quot; da tela: ele aparece em instantes, sem recarregar, e
    mostra que a TV abriu.
  </>,
  <>Se o link se perder ou vazar, toque em &quot;Desativar&quot; e crie outra tela, com um link novo.</>,
]

function SecaoTv() {
  return (
    <div className="grid gap-5">
      <Topico titulo="Passo a passo">
        <ol className="grid list-decimal gap-2 pl-5 marker:font-semibold marker:text-foreground">
          {PASSOS_DA_TV.map((passo, i) => (
            <li key={i}>{passo}</li>
          ))}
        </ol>
      </Topico>
      <Topico titulo="Dicas">
        <ul className="grid list-disc gap-2 pl-5">
          <li>
            O mais simples é um computador pequeno ou uma TV box ligada à TV, com o Chrome em modo quiosque
            abrindo o link ao ligar (chrome --kiosk e o link) e o descanso de tela desligado.
          </li>
          <li>
            Numa Smart TV só com o controle remoto, digitar o link é difícil, porque ele tem mais de 60
            caracteres: um teclado USB ou Bluetooth resolve.
          </li>
          <li>
            A TV troca de visão a cada 15 segundos e busca os números a cada 30, sem ninguém tocar. Sem
            internet, ela mantém os últimos números e avisa no rodapé.
          </li>
          <li>
            Se a TV mostrar &quot;Esta tela não está ativa&quot;, o link está incompleto ou a tela foi
            desativada.
          </li>
        </ul>
      </Topico>
    </div>
  )
}

function SecaoContato() {
  return (
    <div className="grid gap-4">
      <Topico>
        <p>
          Dúvidas, problemas ou ideias para o sistema: fale com quem o desenvolveu. Para acesso, senha ou
          setores, fale primeiro com o Super Admin do hospital.
        </p>
      </Topico>
      <ul className="grid gap-2">
        {CONTATOS.map(({ nome, email }) => (
          <li key={email} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Mail aria-hidden className="size-5 shrink-0 text-primary" />
            <span className="font-medium">{nome}</span>
            <a href={`mailto:${email}`} className={`${classeDoLink} break-all`}>
              {email}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CONTEUDO: Record<IdDaSecao, () => ReactNode> = {
  menu: SecaoMenu,
  indicadores: SecaoIndicadores,
  pesquisa: SecaoPesquisa,
  retornos: SecaoRetornos,
  exportacoes: SecaoExportacoes,
  senha: SecaoSenha,
  tv: SecaoTv,
  contato: SecaoContato,
}

/**
 * /painel/ajuda: a ajuda do painel, para todos os perfis, com só os assuntos que a pessoa pode usar. Um link
 * com âncora (/painel/ajuda#tv, de Telas de TV) abre direto na seção.
 */
export default function AjudaPage() {
  const permissoes = useSessao((s) => s.sessao?.permissoes ?? SEM_PERMISSOES)
  const secoes = secoesVisiveis(permissoes)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [hash])

  return (
    <Pagina
      titulo="Ajuda"
      descricao="Como usar o painel, o que significa cada número e com quem falar. Aqui aparecem só os assuntos do seu perfil."
    >
      <div className="@container">
        <div className="grid gap-5 @4xl:grid-cols-[13rem_minmax(0,1fr)] @4xl:items-start">
          <nav
            aria-label="Assuntos da ajuda"
            className="rounded-lg border bg-card p-4 @4xl:sticky @4xl:top-20"
          >
            <p className="text-sm font-semibold">Nesta página</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm @4xl:grid @4xl:gap-1.5">
              {secoes.map((secao) => (
                <li key={secao.id}>
                  <a
                    href={`#${secao.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {secao.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid min-w-0 gap-5">
            {secoes.map((secao) => {
              const Conteudo = CONTEUDO[secao.id as IdDaSecao]
              return (
                <div key={secao.id} id={secao.id} className="scroll-mt-20">
                  <Bloco titulo={secao.titulo}>
                    <Conteudo />
                  </Bloco>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Pagina>
  )
}
