import { Reuniao } from "@/types/grupos";
import { Calendar, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReuniaoListProps {
  reunioes: Reuniao[];
  onSelecionar: (reuniao: Reuniao) => void;
  onDeletar: (id: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  planejada: { label: "Planejada", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  em_andamento: { label: "Em Andamento", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  concluida: { label: "Concluída", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export function ReuniaoList({ reunioes, onSelecionar, onDeletar }: ReuniaoListProps) {
  if (reunioes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p>Nenhuma reunião criada ainda.</p>
        <p className="text-sm mt-1">Clique em "Nova Reunião" para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reunioes.map((reuniao) => {
        const status = STATUS_LABELS[reuniao.status] || STATUS_LABELS.planejada;
        const dataFormatada = format(new Date(reuniao.data_reuniao), "dd 'de' MMMM, HH:mm", { locale: ptBR });

        return (
          <div
            key={reuniao.id}
            onClick={() => onSelecionar(reuniao)}
            className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-accent/30 cursor-pointer transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{dataFormatada}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.className)}>
                  {status.label}
                </span>
              </div>
              {reuniao.tema_geral && (
                <p className="text-sm text-muted-foreground truncate pl-6">{reuniao.tema_geral}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={(e) => { e.stopPropagation(); onDeletar(reuniao.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
