import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGrupos } from "@/hooks/useGrupos";
import { useReunioes } from "@/hooks/useReunioes";
import { useMembros } from "@/hooks/useMembros";
import { GrupoForm } from "./GrupoForm";
import { ReuniaoForm } from "./ReuniaoForm";
import { ReuniaoList } from "./ReuniaoList";
import { MembrosManager } from "./MembrosManager";
import { ModoVisualizacao } from "@/types/grupos";
import { Users, Plus, Calendar, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GruposDashboard() {
  const { user } = useAuth();
  const { grupos, grupoAtual, setGrupoAtual, loading, criarGrupo, atualizarGrupo, deletarGrupo } = useGrupos(user?.id);
  const { reunioes, reuniaoAtual, setReuniaoAtual, criarReuniao, atualizarReuniao, deletarReuniao, fetchReuniaoCompleta, salvarEncontro, salvarExaltacao, salvarEdificacao, salvarEnvio, adicionarMusica, removerMusica, toggleMusicaExecutada, adicionarPergunta, removerPergunta } = useReunioes(grupoAtual?.id);
  const { membros, registrarPresenca, fetchPresencas, removerMembro, atualizarPapel } = useMembros(grupoAtual?.id);
  const [showGrupoForm, setShowGrupoForm] = useState(false);
  const [showReuniaoForm, setShowReuniaoForm] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>("preparacao");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  // No groups yet - show creation prompt
  if (grupos.length === 0 && !showGrupoForm) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-elegant border border-purple-500/10">
            <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-serif font-medium mb-4 tracking-tight">Grupos Pequenos</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Gerencie seu grupo pequeno com a metodologia dos 4Es: Encontro, Exaltação, Edificação e Envio.
          </p>
          <Button onClick={() => setShowGrupoForm(true)} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Criar Meu Primeiro Grupo
          </Button>
        </div>
      </div>
    );
  }

  // Show group creation form
  if (showGrupoForm) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-lg mx-auto">
          <Button variant="ghost" onClick={() => setShowGrupoForm(false)} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <GrupoForm
            onSubmit={async (dados) => {
              await criarGrupo(dados);
              setShowGrupoForm(false);
            }}
            onCancel={() => setShowGrupoForm(false)}
          />
        </div>
      </div>
    );
  }

  // Editing a specific reunion
  if (reuniaoAtual) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setReuniaoAtual(null)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <div className="flex gap-2">
              {(["preparacao", "conducao", "revisao"] as ModoVisualizacao[]).map(m => (
                <Button
                  key={m}
                  variant={modoVisualizacao === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModoVisualizacao(m)}
                  className="capitalize text-xs"
                >
                  {m === "preparacao" ? "Preparação" : m === "conducao" ? "Condução" : "Revisão"}
                </Button>
              ))}
            </div>
          </div>
          <ReuniaoForm
            reuniao={reuniaoAtual}
            modo={modoVisualizacao}
            membros={membros}
            onSalvarEncontro={salvarEncontro}
            onSalvarExaltacao={salvarExaltacao}
            onSalvarEdificacao={salvarEdificacao}
            onSalvarEnvio={salvarEnvio}
            onAdicionarMusica={adicionarMusica}
            onRemoverMusica={removerMusica}
            onToggleMusicaExecutada={toggleMusicaExecutada}
            onAdicionarPergunta={adicionarPergunta}
            onRemoverPergunta={removerPergunta}
            onAtualizarStatus={(status) => atualizarReuniao(reuniaoAtual.id, { status })}
            onRefresh={() => fetchReuniaoCompleta(reuniaoAtual.id)}
          />
        </div>
      </div>
    );
  }

  // Main dashboard with tabs
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Group header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-medium tracking-tight">{grupoAtual?.nome}</h2>
            <p className="text-sm text-muted-foreground">
              {grupoAtual?.dia_semana && `${grupoAtual.dia_semana}`}
              {grupoAtual?.horario && ` • ${grupoAtual.horario}`}
              {grupoAtual?.local && ` • ${grupoAtual.local}`}
            </p>
          </div>
          <div className="flex gap-2">
            {grupos.length > 1 && (
              <select
                value={grupoAtual?.id || ""}
                onChange={(e) => {
                  const g = grupos.find(g => g.id === e.target.value);
                  if (g) setGrupoAtual(g);
                }}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-background"
              >
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </select>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowGrupoForm(true)} className="gap-1">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Grupo</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reunioes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reunioes" className="gap-2">
              <Calendar className="w-4 h-4" /> Reuniões
            </TabsTrigger>
            <TabsTrigger value="membros" className="gap-2">
              <Users className="w-4 h-4" /> Membros ({membros.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reunioes" className="mt-4">
            <div className="mb-4">
              <Button onClick={() => setShowReuniaoForm(!showReuniaoForm)} className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Nova Reunião
              </Button>
            </div>

            {showReuniaoForm && (
              <div className="mb-6 p-4 border border-border rounded-xl bg-card">
                <h3 className="font-medium mb-3">Nova Reunião</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const data = new FormData(form);
                    await criarReuniao({
                      data_reuniao: data.get("data_reuniao") as string,
                      tema_geral: (data.get("tema_geral") as string) || undefined,
                    });
                    setShowReuniaoForm(false);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-sm font-medium">Data e Hora</label>
                    <input
                      type="datetime-local"
                      name="data_reuniao"
                      required
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tema Geral</label>
                    <input
                      type="text"
                      name="tema_geral"
                      placeholder="Ex: Confiança em Deus"
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Criar</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowReuniaoForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </div>
            )}

            <ReuniaoList
              reunioes={reunioes}
              onSelecionar={async (r) => { await fetchReuniaoCompleta(r.id); }}
              onDeletar={deletarReuniao}
            />
          </TabsContent>

          <TabsContent value="membros" className="mt-4">
            <MembrosManager
              membros={membros}
              userId={user?.id || ""}
              onRemover={removerMembro}
              onAtualizarPapel={atualizarPapel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
