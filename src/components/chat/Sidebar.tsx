import { Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversa } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversas: Conversa[];
  conversaAtual: Conversa | null;
  onNovaConversa: () => void;
  onSelecionarConversa: (conversa: Conversa) => void;
  onDeletarConversa: (id: string) => void;
}

export function Sidebar({
  conversas,
  conversaAtual,
  onNovaConversa,
  onSelecionarConversa,
  onDeletarConversa,
}: SidebarProps) {
  return (
    <div className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4">
        <Button onClick={onNovaConversa} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova Conversa
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {conversas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              Nenhuma conversa ainda. Clique em "Nova Conversa" para começar.
            </p>
          ) : (
            conversas.map((conversa) => (
              <div
                key={conversa.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  conversaAtual?.id === conversa.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
                onClick={() => onSelecionarConversa(conversa)}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{conversa.titulo}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletarConversa(conversa.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
