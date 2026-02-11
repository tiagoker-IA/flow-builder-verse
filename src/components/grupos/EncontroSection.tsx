import { useState, useEffect } from "react";
import { Encontro } from "@/types/grupos";
import { Handshake, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EncontroSectionProps {
  encontro: Encontro;
  readOnly: boolean;
  onSave: (dados: Partial<Encontro>) => Promise<void>;
}

export function EncontroSection({ encontro, readOnly, onSave }: EncontroSectionProps) {
  const [titulo, setTitulo] = useState(encontro.titulo || "");
  const [instrucoes, setInstrucoes] = useState(encontro.instrucoes || "");
  const [duracao, setDuracao] = useState(encontro.duracao_minutos || 10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitulo(encontro.titulo || "");
    setInstrucoes(encontro.instrucoes || "");
    setDuracao(encontro.duracao_minutos || 10);
  }, [encontro]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ titulo, instrucoes, duracao_minutos: duracao });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Handshake className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-serif font-medium text-lg">Encontro (Quebra-Gelo)</h3>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" /> {duracao} min
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Momento de integração e descontração. Escolha uma dinâmica que se conecte com o tema da reunião.
      </p>

      <div>
        <label className="text-sm font-medium">Título do Quebra-Gelo</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={readOnly}
          placeholder="Ex: Qual foi a última vez que..."
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm disabled:opacity-60"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Instruções da Dinâmica</label>
        <textarea
          value={instrucoes}
          onChange={(e) => setInstrucoes(e.target.value)}
          disabled={readOnly}
          placeholder="Descreva como conduzir a dinâmica..."
          rows={4}
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Duração (minutos)</label>
        <input
          type="number"
          value={duracao}
          onChange={(e) => setDuracao(Number(e.target.value))}
          disabled={readOnly}
          min={1}
          max={30}
          className="w-24 mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm disabled:opacity-60"
        />
      </div>

      {!readOnly && (
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      )}
    </div>
  );
}
