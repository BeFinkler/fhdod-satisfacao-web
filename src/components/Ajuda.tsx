import { CircleHelp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * O "?" ao lado de um título: abre uma explicação curta com clique, toque ou teclado (Enter ou espaço), e fecha
 * com Esc ou tocando fora. Não depende de passar o mouse, porque o painel também é usado em telas de toque.
 */
export function Ajuda({
  titulo,
  paragrafos,
  className,
}: {
  titulo: string
  paragrafos: readonly string[]
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Como ler: ${titulo}`}
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground',
            className,
          )}
        >
          <CircleHelp aria-hidden className="size-[1.125rem]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={12} className="w-[min(22rem,calc(100vw-1.5rem))]">
        <p className="font-semibold">{titulo}</p>
        <div className="mt-2 grid gap-2 text-muted-foreground">
          {paragrafos.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
