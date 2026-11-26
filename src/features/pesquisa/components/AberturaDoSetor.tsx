import { Clock, ShieldCheck } from 'lucide-react'
import { NIVEIS } from '@/lib/escala'
import { BotaoPrincipal } from './botoes'
import { Moldura, Titulo } from './Moldura'

/** Os cinco rostos já carregam na abertura, para não piscarem na primeira pergunta. */
export function RostosDaAbertura({ className = 'size-12 sm:size-14' }: { className?: string }) {
  return (
    <div aria-hidden className="flex gap-2">
      {NIVEIS.map((nivel) => (
        <img key={nivel.valor} src={nivel.imagem} alt="" width={96} height={96} className={className} />
      ))}
    </div>
  )
}

/** Abertura da pesquisa de um setor (`/s/:setor` e totem): o setor vem da URL do QR Code. */
export function AberturaDoSetor({ setor, aoComecar }: { setor: string; aoComecar: () => void }) {
  return (
    <Moldura>
      <div className="flex flex-1 flex-col justify-center">
        <RostosDaAbertura />
        <Titulo className="mt-6 text-[2rem]/[1.1] sm:text-[2.5rem]/[1.1]">Como foi o seu atendimento?</Titulo>
        {/* o setor vem da URL do QR Code: fica bem visível para a pessoa conferir */}
        <p className="mt-4 text-muted-foreground">Você está avaliando</p>
        <p className="text-2xl font-semibold">{setor}</p>
        <ul className="mt-6 grid gap-3">
          <li className="flex items-center gap-3">
            <ShieldCheck aria-hidden className="size-6 shrink-0 text-primary" />É anônimo: você não precisa
            dizer seu nome.
          </li>
          <li className="flex items-center gap-3">
            <Clock aria-hidden className="size-6 shrink-0 text-primary" />
            Leva menos de 2 minutos.
          </li>
        </ul>
        <BotaoPrincipal className="mt-8" onClick={aoComecar}>
          Começar avaliação
        </BotaoPrincipal>
      </div>
    </Moldura>
  )
}
