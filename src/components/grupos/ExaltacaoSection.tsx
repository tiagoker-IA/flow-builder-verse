import { useState, useEffect } from "react";
import { Exaltacao, MusicaExaltacao } from "@/types/grupos";
import { Music, Plus, Trash2, ExternalLink, Check, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExaltacaoSectionProps {
  exaltacao: Exaltacao & { musicas?: MusicaExaltacao[] };
  readOnly: boolean;
  onSave: (dados: Partial<Exaltacao>) => Promise<void>;
  onAdicionarMusica: (musica: { titulo: string; artista?: string; link_video?: string }) => Promise<MusicaExaltacao | null>;
  onRemoverMusica: (id: string) => Promise<void>;
  onToggleExecutada: (id: string, executada: boolean) => Promise<void>;
  onRefresh: () => void;
}

export function ExaltacaoSection({ exaltacao, readOnly, onSave, onAdicionarMusica, onRemoverMusica, onToggleExecutada, onRefresh }: ExaltacaoSectionProps) {
  const [notas, setNotas] = useState(exaltacao.notas_lider || "");
  const [duracao, setDuracao] = useState(exaltacao.duracao_minutos || 20);
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", link_video: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setNotas(exaltacao.notas_lider || "");
    setDuracao(exaltacao.duracao_minutos || 20);
  }, [exaltacao]);

  const handleAddMusica = async () => {
    if (!novaMusica.titulo.trim()) return;
    await onAdicionarMusica({
      titulo: novaMusica.titulo.trim(),
      artista: novaMusica.artista.trim() || undefined,
      link_video: novaMusica.link_video.trim() || undefined,
    });
    setNovaMusica({ titulo: "", artista: "", link_video: "" });
    setShowAddForm(false);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Music className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        <h3 className="font-serif font-medium text-lg">Exaltação (Louvor)</h3>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" /> {duracao} min
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Momento de adoração coletiva através de cânticos.
      </p>

      {/* Músicas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Músicas</label>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="p-3 border border-border rounded-xl bg-muted/30 space-y-2">
            <input
              type="text"
              value={novaMusica.titulo}
              onChange={(e) => setNovaMusica(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título da música"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={novaMusica.artista}
                onChange={(e) => setNovaMusica(prev => ({ ...prev, artista: e.target.value }))}
                placeholder="Artista"
                className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
              />
              <input
                type="text"
                value={novaMusica.link_video}
                onChange={(e) => setNovaMusica(prev => ({ ...prev, link_video: e.target.value }))}
                placeholder="Link YouTube"
                className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMusica} disabled={!novaMusica.titulo.trim()}>Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {(exaltacao.musicas || []).length === 0 && !showAddForm && (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Nenhuma música adicionada.</p>
        )}

        {(exaltacao.musicas || []).map((musica) => (
          <div
            key={musica.id}
            className={cn(
              "flex items-center gap-3 p-3 border rounded-xl transition-colors",
              musica.executada ? "bg-primary/5 border-primary/20" : "bg-card border-border"
            )}
          >
            <button
              onClick={() => { onToggleExecutada(musica.id, !musica.executada); onRefresh(); }}
              disabled={readOnly}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                musica.executada ? "bg-primary border-primary text-primary-foreground" : "border-border"
              )}
            >
              {musica.executada && <Check className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", musica.executada && "line-through opacity-60")}>{musica.titulo}</p>
              {musica.artista && <p className="text-xs text-muted-foreground">{musica.artista}</p>}
            </div>
            {musica.link_video && (
              <a href={musica.link_video} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {!readOnly && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { onRemoverMusica(musica.id); onRefresh(); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Notas do líder */}
      <div>
        <label className="text-sm font-medium">Notas do Líder</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={readOnly}
          placeholder="Observações sobre o momento de louvor..."
          rows={3}
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60"
        />
      </div>

      {!readOnly && (
        <Button onClick={() => onSave({ notas_lider: notas, duracao_minutos: duracao })} size="sm" className="gap-2">
          <Save className="w-4 h-4" /> Salvar
        </Button>
      )}
    </div>
  );
}
