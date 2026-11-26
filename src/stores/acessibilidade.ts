// Preferências de acessibilidade da aba. Ficam só em memória, como a sessão: valem enquanto a pessoa navega pelo
// sistema e voltam ao padrão ao recarregar, porque o front não guarda nada no navegador (AGENTS.md).
import { create } from 'zustand'

/**
 * Os tamanhos do texto. A escala vai para o `font-size` do <html> (globals.css): como o Tailwind mede tudo em
 * rem, texto, espaços, campos e botões crescem juntos, e nada fica cortado ou por cima de outra coisa.
 */
export const TAMANHOS_DO_TEXTO = [
  { valor: 'normal', rotulo: 'Normal', escala: 1 },
  { valor: 'grande', rotulo: 'Grande', escala: 1.15 },
  { valor: 'muito-grande', rotulo: 'Muito grande', escala: 1.3 },
] as const

export type TamanhoDoTexto = (typeof TAMANHOS_DO_TEXTO)[number]['valor']

interface EstadoAcessibilidade {
  tamanhoDoTexto: TamanhoDoTexto
  mudarTamanhoDoTexto: (tamanho: TamanhoDoTexto) => void
}

export const useAcessibilidade = create<EstadoAcessibilidade>((set) => ({
  tamanhoDoTexto: 'normal',
  mudarTamanhoDoTexto: (tamanhoDoTexto) => set({ tamanhoDoTexto }),
}))

export const escalaDoTexto = (tamanho: TamanhoDoTexto) =>
  TAMANHOS_DO_TEXTO.find((t) => t.valor === tamanho)?.escala ?? 1

/** Quanto o texto está ampliado (1 é o normal), para o que é desenhado em px, como os eixos dos gráficos. */
export const useEscalaDoTexto = () => useAcessibilidade((s) => escalaDoTexto(s.tamanhoDoTexto))
