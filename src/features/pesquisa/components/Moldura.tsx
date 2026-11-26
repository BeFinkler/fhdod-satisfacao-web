import type { ComponentProps, ReactNode } from 'react'
import { useLocation } from 'react-router'
import logo from '@/assets/logo.png'
import { MenuAcessibilidade } from '@/components/MenuAcessibilidade'
import { cn } from '@/lib/utils'
import { BarraProgresso } from './BarraProgresso'

/**
 * Moldura de todas as telas da pesquisa: logo e progresso em cima, conteúdo no meio e,
 * embaixo, "Voltar" sempre à esquerda e "Pular" sempre à direita.
 * `rodapeFixo`: o rodapé fica preso ao pé da tela enquanto o conteúdo rola (lista longa de setores).
 */
export function Moldura({
  progresso,
  rodape,
  rodapeFixo = false,
  children,
}: {
  progresso?: number
  rodape?: ReactNode
  rodapeFixo?: boolean
  children: ReactNode
}) {
  // o totem tem a própria escala de texto e reinicia a cada paciente: o menu de acessibilidade fica no celular,
  // no tablet e no computador
  const noTotem = useLocation().pathname.startsWith('/totem/')
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pt-4 pb-5 text-lg alta:justify-center sm:px-8 sm:pt-6 sm:pb-8">
      <header className="@container flex min-h-10 items-center gap-5">
        <img
          src={logo}
          alt="FHDOD, Fundação Hospitalar Dr. Oswaldo Diesel"
          width={450}
          height={150}
          className="h-9 w-auto"
        />
        {progresso !== undefined && <BarraProgresso valor={progresso} />}
        {/* nas telas com a barra de progresso, só o ícone; nas de abertura, com o nome */}
        {!noTotem && (
          <MenuAcessibilidade
            rotulo={progresso === undefined ? 'se-couber' : 'oculto'}
            className={cn('-mr-2.5 shrink-0 text-base', progresso === undefined && 'ml-auto')}
          />
        )}
      </header>
      <main className="@container flex flex-1 flex-col pt-7 alta:min-h-[30rem] alta:flex-none sm:pt-10">
        {children}
      </main>
      <footer
        className={cn(
          'mt-5 flex min-h-12 items-center justify-between gap-3',
          // preso embaixo, com fundo: a lista passa por trás, e uma sombra curta mostra que ela continua
          rodapeFixo &&
            'sticky bottom-0 -mx-5 -mb-5 mt-3 bg-background px-5 pt-3 pb-5 shadow-[0_-14px_14px_-6px_var(--background)] sm:-mx-8 sm:-mb-8 sm:px-8 sm:pb-8',
        )}
      >
        {rodape}
      </footer>
    </div>
  )
}

/** Título da tela. Recebe o foco a cada etapa, para o leitor de tela anunciar a nova pergunta. */
export function Titulo({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      tabIndex={-1}
      className={cn(
        'text-[1.625rem]/[1.2] font-bold text-balance outline-none sm:text-[2rem]/[1.15]',
        className,
      )}
      {...props}
    />
  )
}

/** Aviso de erro: âmbar com ícone e texto, nunca o vermelho da marca. */
export function Aviso({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn(
        'rounded-xl border border-aviso-borda bg-aviso-fundo px-4 py-3 text-lg font-medium text-aviso',
        className,
      )}
    >
      {children}
    </p>
  )
}
