import { useState, useEffect } from "react";
import { Edificacao, PerguntaEdificacao, TipoPergunta } from "@/types/grupos";
import { BookOpen, Plus, Trash2, Save, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EdificacaoSectionProps {
  edificacao: Edificacao & { perguntas?: PerguntaEdificacao[] };
  readOnly: boolean;
  onSave: (dados: Partial<Edificacao>) => Promise<void>;
  onAdicionarPergunta: (pergunta: { texto_pergunta: string; tipo?: TipoPergunta; ordem?: number }) => Promise<PerguntaEdificacao | null>;
  onRemoverPergunta: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const TIPO_LABELS: Record<TipoPergunta, { label: string; className: string }> = {
  reflexiva: { label: "Reflexiva", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  testemunhal: { label: "Testemunhal", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  aplicacao: { label: "Aplicação", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  comunitaria: { label: "Comunitária", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export function EdificacaoSection({ edificacao, readOnly, onSave, onAdicionarPergunta, onRemoverPergunta, onRefresh }: EdificacaoSectionProps) {
  const [referencia, setReferencia] = useState(edificacao.referencia_biblica || "");
  const [texto, setTexto] = useState(edificacao.texto_completo || "");
  const [contexto, setContexto] = useState(edificacao.contexto_historico || "");
  const [tema, setTema] = useState(edificacao.tema_principal || "");
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaTipo, setNovaTipo] = useState<TipoPergunta>("reflexiva");
  const [showAddPergunta, setShowAddPergunta] = useState(false);

  useEffect(() => {
    setReferencia(edificacao.referencia_biblica || "");
    setTexto(edificacao.texto_completo || "");
    setContexto(edificacao.contexto_historico || "");
    setTema(edificacao.tema_principal || "");
  }, [edificacao]);

  const handleAddPergunta = async () => {
    if (!novaPergunta.trim()) return;
    const ordem = (edificacao.perguntas?.length || 0) + 1;
    await onAdicionarPergunta({ texto_pergunta: novaPergunta.trim(), tipo: novaTipo, ordem });
    setNovaPergunta("");
    setShowAddPergunta(false);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-serif font-medium text-lg">Edificação (Estudo Bíblico)</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        O principal momento da reunião. Estudo da Palavra com participação ativa de todos.
      </p>

      {/* Referência bíblica */}
      <div>
        <label className="text-sm font-medium">Referência Bíblica</label>
        <input
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          disabled={readOnly}
          placeholder="Ex: Filipenses 4:6-7"
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm disabled:opacity-60"
        />
      </div>

      {/* Texto bíblico */}
      <div>
        <label className="text-sm font-medium">Texto Bíblico</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={readOnly}
          placeholder="Cole ou digite o texto bíblico aqui..."
          rows={4}
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60 font-serif"
        />
      </div>

      {/* Contexto e tema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Contexto Histórico</label>
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            disabled={readOnly}
            placeholder="Contextualização histórica..."
            rows={3}
            className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tema Principal</label>
          <textarea
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            disabled={readOnly}
            placeholder="Tema central do estudo..."
            rows={3}
            className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60"
          />
        </div>
      </div>

      {!readOnly && (
        <Button onClick={() => onSave({ referencia_biblica: referencia, texto_completo: texto, contexto_historico: contexto, tema_principal: tema })} size="sm" className="gap-2">
          <Save className="w-4 h-4" /> Salvar Texto
        </Button>
      )}

      {/* Perguntas */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Perguntas para Discussão
          </label>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => setShowAddPergunta(!showAddPergunta)} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          )}
        </div>

        {showAddPergunta && (
          <div className="p-3 border border-border rounded-xl bg-muted/30 space-y-2 mb-3">
            <textarea
              value={novaPergunta}
              onChange={(e) => setNovaPergunta(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
            />
            <div className="flex items-center gap-2">
              <select
                value={novaTipo}
                onChange={(e) => setNovaTipo(e.target.value as TipoPergunta)}
                className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
              >
                <option value="reflexiva">Reflexiva</option>
                <option value="testemunhal">Testemunhal</option>
                <option value="aplicacao">Aplicação</option>
                <option value="comunitaria">Comunitária</option>
              </select>
              <Button size="sm" onClick={handleAddPergunta} disabled={!novaPergunta.trim()}>Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddPergunta(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {(edificacao.perguntas || []).length === 0 && !showAddPergunta && (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Nenhuma pergunta adicionada.</p>
        )}

        <div className="space-y-2">
          {(edificacao.perguntas || []).map((pergunta, index) => {
            const tipoConfig = TIPO_LABELS[pergunta.tipo];
            return (
              <div key={pergunta.id} className="flex items-start gap-3 p-3 border border-border rounded-xl bg-card">
                <span className="text-sm font-bold text-primary mt-0.5">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{pergunta.texto_pergunta}</p>
                  <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-medium", tipoConfig.className)}>
                    {tipoConfig.label}
                  </span>
                </div>
                {!readOnly && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => { onRemoverPergunta(pergunta.id); onRefresh(); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
