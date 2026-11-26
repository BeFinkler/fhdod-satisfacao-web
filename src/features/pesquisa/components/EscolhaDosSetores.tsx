import { ShieldCheck } from 'lucide-react'
import { useId, useState } from 'react'
import type { SetorDaPesquisa } from '@/lib/api/tipos'
import { cn } from '@/lib/utils'
import { RostosDaAbertura } from './AberturaDoSetor'
import { BotaoPrincipal } from './botoes'
import { Moldura, Titulo } from './Moldura'
import { NomesEmLista, NumeroDoSetor } from './setores'

/**
 * Abertura da pesquisa geral (`/avaliar`), no lugar do link do Google Forms: a pessoa marca os setores por onde
 * passou. Cada toque numera o setor, e essa é a ordem em que as perguntas de cada um vão aparecer.
 */
export function EscolhaDosSetores({
  setores,
  iniciais,
  aoComecar,
}: {
  setores: SetorDaPesquisa[]
  /** a escolha anterior, quando a pessoa volta da data para cá */
  iniciais: string[]
  aoComecar: (slugs: string[]) => void
}) {
  const [escolhidos, setEscolhidos] = useState<string[]>(() => {
    const ainda = iniciais.filter((slug) => setores.some((setor) => setor.slug === slug))
    // um setor só: já vem marcado
    return ainda.length === 0 && setores.length === 1 ? [setores[0]!.slug] : ainda
  })
  const idPergunta = useId()
  const idResumo = useId()
  const nomes = new Map(setores.map(({ slug, nome }) => [slug, nome]))

  function alternar(slug: string) {
    setEscolhidos((atuais) =>
      atuais.includes(slug) ? atuais.filter((outro) => outro !== slug) : [...atuais, slug],
    )
  }

  return (
    <Moldura
      rodapeFixo
      rodape={
        <div className="flex-1">
          {/* lido a cada mudança: quem usa leitor de tela ouve a escolha inteira, na ordem */}
          <p id={idResumo} aria-live="polite" className="mb-3 text-balance">
            {escolhidos.length > 0 ? (
              <>
                Você vai avaliar{' '}
                <span className="font-semibold">
                  <NomesEmLista nomes={escolhidos.map((slug) => nomes.get(slug) ?? slug)} />
                </span>
                .
              </>
            ) : (
              'Escolha pelo menos um setor para começar.'
            )}
          </p>
          <BotaoPrincipal
            disabled={escolhidos.length === 0}
            aria-describedby={idResumo}
            onClick={() => aoComecar(escolhidos)}
          >
            Começar avaliação
          </BotaoPrincipal>
        </div>
      }
    >
      {/* no celular, a abertura encolhe um pouco para a lista aparecer sem rolar */}
      <RostosDaAbertura className="size-10 sm:size-14" />
      <Titulo className="mt-4 text-[1.625rem]/[1.15] sm:mt-6 sm:text-[2.5rem]/[1.1]">
        Como foi o seu atendimento?
      </Titulo>
      <p className="mt-3 flex items-center gap-3">
        <ShieldCheck aria-hidden className="size-6 shrink-0 text-primary" />É anônimo: você não precisa dizer
        seu nome.
      </p>

      <h2 id={idPergunta} className="mt-7 text-xl font-bold sm:mt-10 sm:text-2xl">
        Por onde você passou?
      </h2>
      <p className="mt-1 text-muted-foreground">Toque em um ou mais setores.</p>

      <ul aria-labelledby={idPergunta} className="mt-4 grid gap-3 sm:mt-5">
        {setores.map((setor) => {
          const ordem = escolhidos.indexOf(setor.slug) + 1
          return (
            <li key={setor.slug}>
              <button
                type="button"
                aria-pressed={ordem > 0}
                onClick={() => alternar(setor.slug)}
                className={cn(
                  // a margem de rolagem tira o cartão com foco de trás do rodapé fixo
                  'flex min-h-18 w-full scroll-mb-40 items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left',
                  'transition-[background-color,border-color,transform] duration-150 active:scale-[0.985]',
                  ordem > 0 ? 'border-primary bg-secondary' : 'border-input bg-card hover:border-primary',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-semibold">{setor.nome}</span>
                  {setor.descricao && (
                    <span className="block text-lg text-muted-foreground">{setor.descricao}</span>
                  )}
                </span>
                <NumeroDoSetor ordem={ordem || undefined} carimbar />
              </button>
            </li>
          )
        })}
      </ul>
    </Moldura>
  )
}
