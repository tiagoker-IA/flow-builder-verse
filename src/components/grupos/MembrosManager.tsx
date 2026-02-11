import { MembroGrupo, PapelMembro } from "@/types/grupos";
import { User, Crown, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MembrosManagerProps {
  membros: MembroGrupo[];
  userId: string;
  onRemover: (id: string) => void;
  onAtualizarPapel: (id: string, papel: PapelMembro) => void;
}

const PAPEL_CONFIG = {
  lider: { label: "Líder", icon: Crown, className: "text-amber-600 dark:text-amber-400" },
  vice_lider: { label: "Vice-líder", icon: Shield, className: "text-blue-600 dark:text-blue-400" },
  membro: { label: "Membro", icon: User, className: "text-muted-foreground" },
};

export function MembrosManager({ membros, userId, onRemover, onAtualizarPapel }: MembrosManagerProps) {
  return (
    <div className="space-y-3">
      {membros.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>Nenhum membro encontrado.</p>
        </div>
      )}

      {membros.map((membro) => {
        const config = PAPEL_CONFIG[membro.papel];
        const Icon = config.icon;
        const isCurrentUser = membro.user_id === userId;

        return (
          <div
            key={membro.id}
            className="flex items-center justify-between p-3 border border-border rounded-xl bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {membro.avatar_url ? (
                  <img src={membro.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {membro.nome || "Sem nome"} {isCurrentUser && <span className="text-xs text-muted-foreground">(você)</span>}
                </p>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("w-3 h-3", config.className)} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              </div>
            </div>

            {!isCurrentUser && membro.papel !== "lider" && (
              <div className="flex gap-1">
                <select
                  value={membro.papel}
                  onChange={(e) => onAtualizarPapel(membro.id, e.target.value as PapelMembro)}
                  className="text-xs border border-border rounded px-2 py-1 bg-background"
                >
                  <option value="membro">Membro</option>
                  <option value="vice_lider">Vice-líder</option>
                </select>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemover(membro.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
