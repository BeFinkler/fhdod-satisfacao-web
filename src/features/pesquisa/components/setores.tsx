import { Check } from 'lucide-react'
import { useId } from 'react'
import { partesDaLista } from '@/lib/format'
import { cn } from '@/lib/utils'

/** "Raio-X, Laboratório e Internação", sem quebrar a linha dentro de um nome. */
export function NomesEmLista({ nomes }: { nomes: string[] }) {
  return (
    <>
      {partesDaLista(nomes).map((parte, indice) =>
        parte.type === 'element' ? (
          <span key={indice} className="whitespace-nowrap">
            {parte.value}
          </span>
        ) : (
          parte.value
        ),
      )}
    </>
  )
}

/**
 * O número do setor na escolha da pesquisa geral: a ordem em que a pessoa tocou nele, que é a ordem em que as
 * perguntas dele aparecem. Sem número, um anel vazio: o setor ainda não foi escolhido. `carimbar`: o número
 * entra com um carimbo rápido, só na tela da escolha, quando nasce ou muda.
 */
export function NumeroDoSetor({
  ordem,
  carimbar = false,
  className,
}: {
  ordem?: number
  carimbar?: boolean
  className?: string
}) {
  if (!ordem) {
    return (
      <span
        aria-hidden
        className={cn('size-9 shrink-0 rounded-full border-2 border-input bg-card', className)}
      />
    )
  }
  return (
    <span
      // a chave muda com o número: ao renumerar, o carimbo marca o que mudou
      key={ordem}
      aria-hidden
      className={cn(
        'numeros flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground',
        carimbar && 'animate-in duration-200 zoom-in-50 fade-in',
        className,
      )}
    >
      {ordem}
    </span>
  )
}

/**
 * O setor da pergunta, acima do título: o mesmo número da escolha e o nome. Desliza só na primeira pergunta de
 * cada setor (`entrando`), para a troca de setor ser notada sem custar um toque a mais. Fica fora da árvore de
 * acessibilidade: o leitor de tela ouve o nome do setor no próprio título.
 */
export function MarcadorDoSetor({
  nome,
  ordem,
  entrando,
}: {
  nome: string
  ordem?: number
  entrando: boolean
}) {
  return (
    <p
      aria-hidden
      className={cn(
        'mb-4 inline-flex max-w-full items-center gap-2.5 self-start rounded-full bg-secondary py-1 pr-4 text-lg font-semibold',
        ordem ? 'pl-1' : 'pl-4',
        entrando && 'animate-in duration-300 fade-in slide-in-from-left-4',
      )}
    >
      {ordem ? <NumeroDoSetor ordem={ordem} className="size-8" /> : null}
      <span className="truncate">{nome}</span>
    </p>
  )
}

/**
 * "Sobre qual setor?", na tela do comentário, quando a pessoa avaliou mais de um: o comentário e o telefone vão
 * para a avaliação do setor marcado, e chegam ao gestor certo.
 */
export function SetorDoComentario({
  setores,
  alvo,
  aoEscolher,
}: {
  setores: { slug: string; nome: string; ordem: number }[]
  alvo: string | null
  aoEscolher: (slug: string) => void
}) {
  const id = useId()
  return (
    <div className="mt-5">
      <p id={id} className="font-semibold">
        Sobre qual setor?
      </p>
      <div role="group" aria-labelledby={id} className="mt-2 flex flex-wrap gap-2">
        {setores.map((setor) => {
          const marcado = alvo === setor.slug
          return (
            <button
              key={setor.slug}
              type="button"
              aria-pressed={marcado}
              onClick={() => aoEscolher(setor.slug)}
              className={cn(
                'flex min-h-12 max-w-full items-center gap-2 rounded-xl border-2 py-1.5 pr-3 pl-1.5 text-left text-lg font-semibold',
                'transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]',
                marcado ? 'border-primary bg-secondary' : 'border-input bg-card hover:border-primary',
              )}
            >
              <NumeroDoSetor ordem={setor.ordem} className="size-8" />
              <span className="min-w-0">{setor.nome}</span>
              {marcado && <Check aria-hidden className="size-5 shrink-0 text-primary" strokeWidth={3} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
