import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface GrupoFormProps {
  onSubmit: (dados: { nome: string; dia_semana?: string; horario?: string; local?: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: { nome: string; dia_semana?: string; horario?: string; local?: string };
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export function GrupoForm({ onSubmit, onCancel, initialData }: GrupoFormProps) {
  const [nome, setNome] = useState(initialData?.nome || "");
  const [diaSemana, setDiaSemana] = useState(initialData?.dia_semana || "");
  const [horario, setHorario] = useState(initialData?.horario || "");
  const [local, setLocal] = useState(initialData?.local || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setSubmitting(true);
    await onSubmit({
      nome: nome.trim(),
      dia_semana: diaSemana || undefined,
      horario: horario || undefined,
      local: local || undefined,
    });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-xl flex items-center justify-center border border-purple-500/10">
          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-medium">Novo Grupo Pequeno</h2>
          <p className="text-sm text-muted-foreground">Preencha os dados do seu grupo</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Nome do Grupo *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Célula Graça Abundante"
          required
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Dia da Semana</label>
          <select
            value={diaSemana}
            onChange={(e) => setDiaSemana(e.target.value)}
            className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm"
          >
            <option value="">Selecione</option>
            {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Horário</label>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Local</label>
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Ex: Casa do João, Rua X"
          className="w-full mt-1 px-4 py-3 border border-input rounded-xl bg-background text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting || !nome.trim()} className="flex-1">
          {submitting ? "Criando..." : "Criar Grupo"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
