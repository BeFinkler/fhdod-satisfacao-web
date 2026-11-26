import { Accessibility, LoaderCircle } from 'lucide-react'
import { lazy, Suspense, useState, type ComponentProps } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * O texto "Acessibilidade" ao lado do ícone: sempre, nunca (só para o leitor de tela), só do tablet para cima
 * ou só se couber no cabeçalho (que precisa ser um `@container`; com o texto ampliado, sobra só o ícone).
 */
export type RotuloDoMenu = 'visivel' | 'oculto' | 'telas-largas' | 'se-couber'

// O menu em si (Radix) só baixa quando a pessoa toca no botão, ou passa o mouse ou o foco por ele: quem abre a
// pesquisa pelo QR Code não paga por ele se não usar.
const carregarMenu = () => import('./MenuAcessibilidadeAberto')
const MenuAberto = lazy(carregarMenu)

/** O botão "Acessibilidade", igual antes e depois de o menu carregar. */
export function BotaoAcessibilidade({
  rotulo = 'telas-largas',
  carregando = false,
  className,
  ...props
}: ComponentProps<'button'> & { rotulo?: RotuloDoMenu; carregando?: boolean }) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      className={cn(buttonVariants({ variant: 'ghost' }), 'h-auto min-h-11 gap-2 px-2.5', className)}
      {...props}
    >
      {carregando ? (
        <LoaderCircle aria-hidden className="size-5 animate-spin" />
      ) : (
        <Accessibility aria-hidden className="size-5" />
      )}
      <span
        className={cn(
          rotulo === 'oculto' && 'sr-only',
          rotulo === 'telas-largas' && 'max-sm:sr-only',
          rotulo === 'se-couber' && '@max-[19rem]:sr-only',
        )}
      >
        Acessibilidade
      </span>
    </button>
  )
}

/**
 * "Acessibilidade", no topo do painel, da pesquisa e do login: o tamanho do texto, em três níveis, e o VLibras.
 * No primeiro toque, o botão dá lugar ao menu completo, que já abre.
 */
export function MenuAcessibilidade({ rotulo, className }: { rotulo?: RotuloDoMenu; className?: string }) {
  const [usado, setUsado] = useState(false)
  const botao = { rotulo, className, 'aria-expanded': false } as const
  if (!usado) {
    return (
      <BotaoAcessibilidade
        {...botao}
        onClick={() => setUsado(true)}
        onPointerEnter={() => void carregarMenu()}
        onFocus={() => void carregarMenu()}
      />
    )
  }
  return (
    <Suspense fallback={<BotaoAcessibilidade {...botao} carregando />}>
      <MenuAberto rotulo={rotulo} className={className} />
    </Suspense>
  )
}
