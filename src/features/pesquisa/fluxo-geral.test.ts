import { describe, expect, it } from 'vitest'
import type { Classificacao, RespostaCriadaDoSetor } from '@/lib/api/tipos'
import { progresso, type AcaoFluxo } from './fluxo'
import {
  algumaBaixa,
  alvoPadrao,
  estadoInicialGeral,
  montarEnvioGeral,
  redutorGeral,
  setorDaPergunta,
  type AcaoGeral,
  type EstadoGeral,
  type SetorEscolhido,
} from './fluxo-geral'

const aplicar = (estado: EstadoGeral, ...acoes: AcaoGeral[]) => acoes.reduce(redutorGeral, estado)

// O Raio-X tem as perguntas 21 e 22; o Pronto Atendimento, a 11; o Laboratório, nenhuma.
const RAIO_X: SetorEscolhido = { slug: 'raio-x', perguntaIds: [21, 22] }
const PRONTO: SetorEscolhido = { slug: 'pronto-atendimento', perguntaIds: [11] }
const LABORATORIO: SetorEscolhido = { slug: 'laboratorio', perguntaIds: [] }
const CHAVES: Record<string, string> = {
  'raio-x': 'chave-raio-x',
  'pronto-atendimento': 'chave-pronto',
  laboratorio: 'chave-laboratorio',
}

const escolher = (...setores: SetorEscolhido[]): AcaoGeral => ({
  tipo: 'ESCOLHER_SETORES',
  setores,
  chaves: Object.fromEntries(setores.map(({ slug }) => [slug, CHAVES[slug]!])),
})
const ateAsPerguntas: AcaoFluxo[] = [
  { tipo: 'DEFINIR_DATA', dataAtendimento: '2026-11-09' },
  { tipo: 'DEFINIR_TURNO', turnoId: 2 },
]
const enviada = (slug: string, id: number, classificacao: Classificacao): RespostaCriadaDoSetor => ({
  slug,
  id,
  classificacao,
  tokenComplemento: `token-${id}`,
  expiraEm: '2026-11-10T15:00:00Z',
})

describe('escolha dos setores', () => {
  it('as perguntas vêm na ordem dos toques, um setor depois do outro, com data e turno uma vez só', () => {
    let e = aplicar(estadoInicialGeral(), escolher(RAIO_X, PRONTO))
    expect(e.base.etapa).toBe('data')

    e = aplicar(e, ...ateAsPerguntas)
    expect(e.base.perguntaIds).toEqual([21, 22, 11])
    expect(setorDaPergunta(e)).toEqual({ slug: 'raio-x', ordem: 1, primeira: true })

    e = aplicar(e, { tipo: 'RESPONDER', item: { perguntaId: 21, valorNumero: 4 } })
    expect(setorDaPergunta(e)).toEqual({ slug: 'raio-x', ordem: 1, primeira: false })

    e = aplicar(e, { tipo: 'PULAR' })
    expect(setorDaPergunta(e)).toEqual({ slug: 'pronto-atendimento', ordem: 2, primeira: true })

    e = aplicar(e, { tipo: 'RESPONDER', item: { perguntaId: 11, valorNumero: 5 } })
    expect(e.base.etapa).toBe('nps')
    expect(setorDaPergunta(e)).toBeNull()
  })

  it('não começa sem nenhum setor, nem depois da abertura', () => {
    const inicio = estadoInicialGeral()
    expect(redutorGeral(inicio, { tipo: 'ESCOLHER_SETORES', setores: [], chaves: {} })).toBe(inicio)

    const naData = aplicar(inicio, escolher(PRONTO))
    expect(redutorGeral(naData, escolher(RAIO_X))).toBe(naData)
  })

  it('voltar da data leva à escolha, e um setor que sai leva as respostas dele junto', () => {
    let e = aplicar(
      estadoInicialGeral(),
      escolher(RAIO_X, PRONTO),
      ...ateAsPerguntas,
      { tipo: 'RESPONDER', item: { perguntaId: 21, valorNumero: 2 } },
      { tipo: 'RESPONDER', item: { perguntaId: 22, valorTexto: 'SIM' } },
      { tipo: 'RESPONDER', item: { perguntaId: 11, valorNumero: 5 } },
    )
    const caminho: string[] = []
    for (let i = 0; i < 6; i++) {
      e = redutorGeral(e, { tipo: 'VOLTAR' })
      caminho.push(e.base.etapa)
    }
    expect(caminho).toEqual(['pergunta', 'pergunta', 'pergunta', 'turno', 'data', 'abertura'])

    e = aplicar(e, escolher(PRONTO, LABORATORIO))
    expect([e.base.etapa, e.base.indice]).toEqual(['data', 0])
    expect(e.base.perguntaIds).toEqual([11])
    expect(e.base.respostas).toEqual({ 11: { perguntaId: 11, valorNumero: 5 } })
    expect(e.chaves).toEqual({ 'pronto-atendimento': 'chave-pronto', laboratorio: 'chave-laboratorio' })
  })

  it('setores sem perguntas vão da data e do turno direto para a nota', () => {
    const e = aplicar(estadoInicialGeral(), escolher(LABORATORIO), ...ateAsPerguntas)

    expect(e.base.etapa).toBe('nps')
  })
})

describe('envio da pesquisa geral', () => {
  it('a nota, a data e o turno valem para todos; cada setor leva a sua chave e as respostas dele', () => {
    const e = aplicar(
      estadoInicialGeral(),
      escolher(RAIO_X, PRONTO, LABORATORIO),
      ...ateAsPerguntas,
      { tipo: 'RESPONDER', item: { perguntaId: 21, valorNumero: 2 } },
      { tipo: 'PULAR' },
      { tipo: 'RESPONDER', item: { perguntaId: 11, valorNumero: 5 } },
      { tipo: 'SELECIONAR_NPS', nps: 7 },
    )

    expect(montarEnvioGeral(e, 'WEB')).toEqual({
      canal: 'WEB',
      dataAtendimento: '2026-11-09',
      turnoId: 2,
      nps: 7,
      site: '',
      setores: [
        { slug: 'raio-x', chaveIdempotencia: 'chave-raio-x', itens: [{ perguntaId: 21, valorNumero: 2 }] },
        {
          slug: 'pronto-atendimento',
          chaveIdempotencia: 'chave-pronto',
          itens: [{ perguntaId: 11, valorNumero: 5 }],
        },
        { slug: 'laboratorio', chaveIdempotencia: 'chave-laboratorio', itens: [] },
      ],
    })
    // o campo isca vai como está: vazio para pessoas
    expect(montarEnvioGeral(e, 'WEB', 'https://spam.example')).toMatchObject({ site: 'https://spam.example' })
  })

  it('sem a nota não existe envio, e a confirmação da API é ignorada', () => {
    const e = aplicar(estadoInicialGeral(), escolher(LABORATORIO), ...ateAsPerguntas)

    expect(montarEnvioGeral(e, 'WEB')).toBeNull()
    expect(redutorGeral(e, { tipo: 'ENVIADAS', enviadas: [enviada('laboratorio', 1, 'NORMAL')] })).toBe(e)
  })

  it('o progresso conta as perguntas de todos os setores e fecha em 100% ao enviar', () => {
    let e = aplicar(estadoInicialGeral(), escolher(RAIO_X, PRONTO), ...ateAsPerguntas)
    const valores = [progresso(e.base)]
    for (let i = 0; i < 3; i++) {
      e = redutorGeral(e, { tipo: 'PULAR' })
      valores.push(progresso(e.base))
    }
    expect(valores).toEqual([2 / 6, 3 / 6, 4 / 6, 5 / 6])

    e = aplicar(
      e,
      { tipo: 'SELECIONAR_NPS', nps: 9 },
      {
        tipo: 'ENVIADAS',
        enviadas: [enviada('raio-x', 1, 'NORMAL'), enviada('pronto-atendimento', 2, 'NORMAL')],
      },
    )
    expect(progresso(e.base)).toBe(1)
  })
})

describe('comentário e telefone', () => {
  const naNota = () =>
    aplicar(
      estadoInicialGeral(),
      escolher(RAIO_X, PRONTO),
      ...ateAsPerguntas,
      { tipo: 'PULAR' },
      { tipo: 'PULAR' },
      { tipo: 'PULAR' },
      { tipo: 'SELECIONAR_NPS', nps: 8 },
    )

  it('vão para o primeiro setor que a API classificou como baixo ou, sem nenhum, para o primeiro escolhido', () => {
    const baixa = redutorGeral(naNota(), {
      tipo: 'ENVIADAS',
      enviadas: [enviada('raio-x', 1, 'NORMAL'), enviada('pronto-atendimento', 2, 'BAIXA')],
    })
    expect([baixa.base.etapa, baixa.alvo, baixa.base.criada?.id]).toEqual([
      'comentario',
      'pronto-atendimento',
      2,
    ])
    expect(algumaBaixa(baixa)).toBe(true)

    const normal = redutorGeral(naNota(), {
      tipo: 'ENVIADAS',
      enviadas: [enviada('raio-x', 1, 'NORMAL'), enviada('pronto-atendimento', 2, 'NORMAL')],
    })
    expect([normal.alvo, normal.base.criada?.id]).toEqual(['raio-x', 1])
    expect(algumaBaixa(normal)).toBe(false)
    expect(alvoPadrao([])).toBeUndefined()
  })

  it('a pessoa escolhe o setor do comentário, e o telefone vem depois para todos', () => {
    let e = redutorGeral(naNota(), {
      tipo: 'ENVIADAS',
      enviadas: [enviada('raio-x', 1, 'NORMAL'), enviada('pronto-atendimento', 2, 'NORMAL')],
    })

    e = redutorGeral(e, { tipo: 'ESCOLHER_ALVO', slug: 'pronto-atendimento' })
    expect(e.alvo).toBe('pronto-atendimento')
    expect(e.base.criada).toEqual({
      id: 2,
      classificacao: 'NORMAL',
      tokenComplemento: 'token-2',
      expiraEm: '2026-11-10T15:00:00Z',
    })
    // um setor que não foi enviado não vira o do comentário
    expect(redutorGeral(e, { tipo: 'ESCOLHER_ALVO', slug: 'laboratorio' })).toBe(e)

    e = redutorGeral(e, { tipo: 'COMENTAR', comentario: { tipo: 'ELOGIO', texto: 'Tudo certo' } })
    expect(e.base.etapa).toBe('contato')
    // na tela do telefone, o setor não muda mais
    expect(redutorGeral(e, { tipo: 'ESCOLHER_ALVO', slug: 'raio-x' })).toBe(e)
  })

  it('o reinício apaga tudo, também a escolha e as chaves', () => {
    const e = redutorGeral(naNota(), { tipo: 'ENVIADAS', enviadas: [enviada('raio-x', 1, 'BAIXA')] })

    expect(redutorGeral(e, { tipo: 'REINICIAR', chaveIdempotencia: 'nova' })).toEqual(estadoInicialGeral())
  })
})
