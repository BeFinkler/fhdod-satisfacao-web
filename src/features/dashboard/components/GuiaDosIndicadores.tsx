import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AJUDA, SECOES_DO_GUIA } from '../ajuda'

/**
 * "Como ler os indicadores": o guia completo do dashboard num painel lateral, na ordem da página. É o mesmo texto
 * dos "?" de cada bloco, reunido para quem abre o painel pela primeira vez.
 */
export function GuiaDosIndicadores() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <BookOpen aria-hidden />
          Como ler os indicadores
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b px-5 pt-5 pb-4">
          <SheetTitle className="pr-8 text-lg font-semibold">Como ler os indicadores</SheetTitle>
          <SheetDescription>
            O que cada número da página significa e como ele é calculado. Os mesmos textos aparecem no botão
            de ajuda ao lado do título de cada bloco.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-7 overflow-y-auto px-5 py-5">
          {SECOES_DO_GUIA.map((secao) => (
            <section key={secao.titulo} aria-labelledby={`guia-${secao.titulo}`} className="grid gap-4">
              <h3
                id={`guia-${secao.titulo}`}
                className="text-xs font-semibold tracking-wide text-primary uppercase"
              >
                {secao.titulo}
              </h3>
              {secao.assuntos.map((assunto) => (
                <div key={assunto} className="grid gap-1.5">
                  <h4 className="text-base font-semibold">{AJUDA[assunto].titulo}</h4>
                  {AJUDA[assunto].paragrafos.map((paragrafo) => (
                    <p key={paragrafo} className="text-sm/relaxed text-muted-foreground">
                      {paragrafo}
                    </p>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
