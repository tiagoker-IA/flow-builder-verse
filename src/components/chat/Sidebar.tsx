import { Plus, Trash2, MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversa } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversas: Conversa[];
  conversaAtual: Conversa | null;
  onNovaConversa: () => void;
  onSelecionarConversa: (conversa: Conversa) => void;
  onDeletarConversa: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  conversas,
  conversaAtual,
  onNovaConversa,
  onSelecionarConversa,
  onDeletarConversa,
  isOpen = true,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-gold-dark rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-sidebar-foreground">LogosFlow</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={onNovaConversa} 
            className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="space-y-1">
            {conversas.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="w-10 h-10 text-sidebar-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-sidebar-foreground/60">
                  Nenhuma conversa ainda
                </p>
                <p className="text-xs text-sidebar-foreground/40 mt-1">
                  Clique em "Nova Conversa" para começar
                </p>
              </div>
            ) : (
              conversas.map((conversa) => (
                <div
                  key={conversa.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                    conversaAtual?.id === conversa.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                  )}
                  onClick={() => {
                    onSelecionarConversa(conversa);
                    onClose?.();
                  }}
                >
                  <MessageCircle className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="flex-1 truncate text-sm">{conversa.titulo}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletarConversa(conversa.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 rounded-md transition-all"
                    title="Deletar conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 text-center">
            Assistente Teológico IA
          </p>
        </div>
      </div>
    </>
  );
}