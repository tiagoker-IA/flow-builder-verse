import { useState, useEffect } from "react";
import { Envio, TipoDesafio } from "@/types/grupos";
import { Rocket, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnvioSectionProps {
  envio: Envio;
  readOnly: boolean;
  onSave: (dados: Partial<Envio>) => Promise<void>;
}

export function EnvioSection({ envio, readOnly, onSave }: EnvioSectionProps) {
  const [desafio, setDesafio] = useState(envio.desafio_texto || "");
  const [tipo, setTipo] = useState<TipoDesafio>(envio.tipo || "individual");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDesafio(envio.desafio_texto || "");
    setTipo(envio.tipo || "individual");
  }, [envio]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ desafio_texto: desafio, tipo });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-serif font-medium text-lg">Envio (Desafio Prático)</h3>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" /> 5-10 min
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Desafie o grupo a praticar o que foi estudado durante a semana.
      </p>

      <div>
        <label className="text-sm font-medium">Desafio da Semana</label>
        <textarea
          value={desafio}
          onChange={(e) => setDesafio(e.target.value)}
          disabled={readOnly}
          placeholder="Ex: Esta semana, quando sentir ansiedade, PARE e ore imediatamente sobre aquela situação..."
          rows={4}
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none disabled:opacity-60"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tipo de Desafio</label>
        <div className="flex gap-2 mt-2">
          {(["individual", "coletivo", "ambos"] as TipoDesafio[]).map((t) => (
            <button
              key={t}
              onClick={() => !readOnly && setTipo(t)}
              disabled={readOnly}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors min-h-[44px] ${
                tipo === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
              } disabled:opacity-60`}
            >
              {t === "individual" ? "Individual" : t === "coletivo" ? "Coletivo" : "Ambos"}
            </button>
          ))}
        </div>
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
