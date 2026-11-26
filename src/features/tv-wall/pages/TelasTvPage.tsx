import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { CircleQuestionMark, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { CampoCopiavel, DialogoFormulario } from '@/components/crud'
import { CampoTexto, ErroDoFormulario } from '@/components/formulario'
import { Bloco, Consulta, Pagina } from '@/components/layout/Pagina'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { dataHora } from '@/lib/format'
import { aplicarErroDaApi, useSalvar } from '@/lib/salvar'
import { cn } from '@/lib/utils'
import { alterarStatusTela, criarTela, listarTelas } from '../api'

const esquema = z.object({ nome: z.string().trim().min(2, 'Informe onde a tela fica') })
type Dados = z.infer<typeof esquema>

function Formulario({
  aoFechar,
  aoCriar,
}: {
  aoFechar: () => void
  aoCriar: (tela: { nome: string; link: string }) => void
}) {
  const form = useForm<Dados>({ resolver: zodResolver(esquema), defaultValues: { nome: '' } })
  const salvar = useSalvar((d: Dados) => criarTela(d.nome), {
    recarregar: ['tv-telas'],
    aoConcluir: ({ tela, token }) => {
      aoFechar()
      // o token vai depois do "#": essa parte da URL nunca é enviada ao servidor nem aparece em logs
      aoCriar({ nome: tela.nome, link: `${window.location.origin}/tv#${token}` })
    },
    aoFalhar: (erro) => aplicarErroDaApi(form, erro),
  })
  return (
    <DialogoFormulario
      aberto
      aoFechar={aoFechar}
      titulo="Nova tela de TV"
      descricao="Cada TV tem o seu link. Assim dá para desligar uma sem afetar as outras."
      rotuloSalvar="Criar tela"
      salvando={salvar.isPending}
      aoEnviar={form.handleSubmit((d) => salvar.mutate(d))}
    >
      <CampoTexto
        rotulo="Onde a tela fica"
        dica="Exemplo: Recepção principal"
        erro={form.formState.errors.nome?.message}
        {...form.register('nome')}
      />
      <ErroDoFormulario mensagem={form.formState.errors.root?.message} />
    </DialogoFormulario>
  )
}

/** /painel/tv: telas de TV Wall. O link com o token aparece uma única vez, ao criar. */
export default function TelasTvPage() {
  // a lista se atualiza sozinha: quem acabou de abrir o link na TV vê o "Último acesso" aparecer aqui
  const consulta = useQuery({ queryKey: ['tv-telas'], queryFn: listarTelas, refetchInterval: 15_000 })
  const [criando, setCriando] = useState(false)
  const [criada, setCriada] = useState<{ nome: string; link: string } | null>(null)
  const status = useSalvar(({ id, ativa }: { id: number; ativa: boolean }) => alterarStatusTela(id, ativa), {
    recarregar: ['tv-telas'],
    sucesso: 'Situação da tela atualizada',
  })

  return (
    <Pagina
      titulo="Telas de TV"
      descricao="A TV mostra só números gerais: nunca comentários, reclamações ou telefones. Quem tem o link abre a tela sem senha, então desative a tela se o link vazar."
      acoes={
        <>
          {/* à vista para quem já fechou a janela do link: o passo a passo fica na Ajuda */}
          <Button variant="outline" asChild>
            <Link to="/painel/ajuda#tv">
              <CircleQuestionMark aria-hidden />
              Como colocar na TV
            </Link>
          </Button>
          <Button onClick={() => setCriando(true)}>
            <Plus aria-hidden />
            Nova tela
          </Button>
        </>
      }
    >
      <Bloco>
        <Consulta
          consulta={consulta}
          altura="h-40"
          vazio={(telas) => telas.length === 0}
          textoVazio="Nenhuma tela criada. Crie uma para gerar o link da TV."
        >
          {(telas) => (
            <ul className="grid gap-3">
              {telas.map((tela) => (
                <li
                  key={tela.id}
                  className={cn(
                    'flex flex-wrap items-center gap-3 rounded-lg border p-4',
                    !tela.ativa && 'bg-muted',
                  )}
                >
                  <div className="min-w-0 flex-1 basis-56">
                    <h2 className="flex flex-wrap items-center gap-2 font-semibold">
                      {tela.nome}
                      <span
                        className={cn(
                          'rounded-md border px-1.5 text-xs leading-6 font-medium',
                          tela.ativa ? 'border-input/50' : 'border-aviso-borda bg-aviso-fundo text-aviso',
                        )}
                      >
                        {tela.ativa ? 'Ativa' : 'Desativada: o link não abre'}
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {tela.ultimoAcessoEm
                        ? `Último acesso em ${dataHora(tela.ultimoAcessoEm)}.`
                        : 'Ainda não foi aberta em nenhuma TV.'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={status.isPending}
                    onClick={() => status.mutate({ id: tela.id, ativa: !tela.ativa })}
                  >
                    {tela.ativa ? 'Desativar' : 'Ativar de novo'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Consulta>
      </Bloco>

      {criando && <Formulario aoFechar={() => setCriando(false)} aoCriar={setCriada} />}

      <Dialog open={criada !== null} onOpenChange={(abrir) => !abrir && setCriada(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link da tela {criada?.nome}</DialogTitle>
            <DialogDescription>
              Copie agora: este link não aparece de novo. Se perder, desative esta tela e crie outra.
            </DialogDescription>
          </DialogHeader>
          {criada && <CampoCopiavel rotulo="Link da TV" valor={criada.link} />}
          <div className="grid gap-2 text-sm">
            <p className="font-semibold">Para colocar no ar</p>
            <ol className="grid list-decimal gap-1.5 pl-5 text-muted-foreground marker:font-semibold marker:text-foreground">
              <li>
                Abra o link no navegador da TV. Se quem instala a TV é outra pessoa, como a TI, mande o link
                para ela por e-mail ou pelo chat interno: ela não precisa entrar no painel.
              </li>
              <li>Toque uma vez na tela da TV, para ela ficar em tela cheia.</li>
              <li>
                Confira aqui o &quot;Último acesso&quot; da tela: ele aparece em instantes e mostra que a TV
                abriu.
              </li>
            </ol>
            <Link
              to="/painel/ajuda#tv"
              className="w-fit font-semibold text-primary underline underline-offset-4 hover:no-underline"
            >
              Passo a passo completo e dicas, na Ajuda
            </Link>
          </div>
          <DialogFooter>
            <Button onClick={() => setCriada(null)}>Já copiei</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Pagina>
  )
}
