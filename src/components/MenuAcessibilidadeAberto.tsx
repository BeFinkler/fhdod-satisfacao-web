import { Hand, LoaderCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { abrirVLibras, useVLibras } from '@/lib/vlibras'
import { TAMANHOS_DO_TEXTO, useAcessibilidade, type TamanhoDoTexto } from '@/stores/acessibilidade'
import { BotaoAcessibilidade, type RotuloDoMenu } from './MenuAcessibilidade'

const TEXTO_DO_VLIBRAS = {
  parado: 'Traduzir para Libras',
  pronto: 'Traduzir para Libras',
  carregando: 'Abrindo o VLibras…',
  indisponivel: 'VLibras sem conexão. Tentar de novo',
} as const

/**
 * O menu de acessibilidade, carregado no primeiro toque no botão e montado já aberto. Escolher um tamanho de
 * texto não fecha o menu, para a pessoa ver a página mudar atrás dele e comparar.
 */
export default function MenuAcessibilidadeAberto({
  rotulo,
  className,
}: {
  rotulo?: RotuloDoMenu
  className?: string
}) {
  const tamanho = useAcessibilidade((s) => s.tamanhoDoTexto)
  const mudarTamanho = useAcessibilidade((s) => s.mudarTamanhoDoTexto)
  const vlibras = useVLibras((s) => s.estado)

  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <BotaoAcessibilidade rotulo={rotulo} className={className} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={8} className="w-auto min-w-64">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Tamanho do texto
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={tamanho}
          onValueChange={(valor) => mudarTamanho(valor as TamanhoDoTexto)}
        >
          {TAMANHOS_DO_TEXTO.map((opcao) => (
            <DropdownMenuRadioItem
              key={opcao.valor}
              value={opcao.valor}
              className="min-h-11 gap-3 text-base"
              onSelect={(evento) => evento.preventDefault()}
            >
              {/* o "A" de cada nível cresce mais que a escala, para a diferença ficar visível no menu */}
              <span aria-hidden className="w-7 text-center leading-none font-bold">
                <span style={{ fontSize: `${0.9 * opcao.escala ** 2}em` }}>A</span>
              </span>
              {opcao.rotulo}
              <span className="ml-auto pr-1 text-sm text-muted-foreground">
                {Math.round(opcao.escala * 100)}%
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 gap-3 text-base"
          disabled={vlibras === 'carregando'}
          onSelect={() => void abrirVLibras().catch(() => undefined)}
        >
          {vlibras === 'carregando' ? (
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
          ) : (
            <Hand aria-hidden className="size-5" />
          )}
          <span className="grid">
            {TEXTO_DO_VLIBRAS[vlibras]}
            <span className="text-xs text-muted-foreground">VLibras, do governo federal</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
