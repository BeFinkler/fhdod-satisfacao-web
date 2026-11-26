// VLibras: o tradutor de português para Libras do governo federal (vlibras.gov.br), o mesmo dos sites gov.br.
// O script oficial é pequeno e só desenha o botão azul do VLibras; o avatar e o tradutor só baixam quando a pessoa
// abre o recurso. Ao traduzir, o texto tocado vai para o serviço do governo.
import { create } from 'zustand'

const ENDERECO = 'https://vlibras.gov.br/app'

declare global {
  interface Window {
    VLibras?: { Widget: new (enderecoOuOpcoes?: string | { rootPath?: string }) => unknown }
    /** O que o script do VLibras expõe depois de carregado: `open` abre o tradutor. */
    VLibrasWidget?: { open?: () => void; initBtn?: HTMLElement }
  }
}

type EstadoDoVLibras = 'parado' | 'carregando' | 'pronto' | 'indisponivel'

/** Para o menu de acessibilidade mostrar se o VLibras abriu ou se está sem conexão. */
export const useVLibras = create<{ estado: EstadoDoVLibras }>(() => ({ estado: 'parado' }))

let carregamento: Promise<void> | null = null

/** Baixa o script oficial uma vez só. Se falhar (sem internet), a próxima chamada tenta de novo. */
export function carregarVLibras(): Promise<void> {
  carregamento ??= new Promise<void>((resolve, reject) => {
    useVLibras.setState({ estado: 'carregando' })
    const script = document.createElement('script')
    script.src = `${ENDERECO}/vlibras-plugin.js`
    script.async = true
    const falhar = () => {
      script.remove()
      carregamento = null
      useVLibras.setState({ estado: 'indisponivel' })
      reject(new Error('O VLibras não carregou.'))
    }
    script.onload = () => {
      if (!window.VLibras?.Widget) return falhar()
      new window.VLibras.Widget(ENDERECO)
      useVLibras.setState({ estado: 'pronto' })
      resolve()
    }
    script.onerror = falhar
    document.body.append(script)
  })
  return carregamento
}

/** Abre o tradutor, como tocar no botão azul do VLibras. */
export async function abrirVLibras() {
  await carregarVLibras()
  const widget = window.VLibrasWidget
  if (widget?.open) widget.open()
  else widget?.initBtn?.click()
}
