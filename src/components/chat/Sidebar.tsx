import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, MessageCircle, X, Sparkles, Pencil, Check, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversa } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversas: Conversa[];
  conversaAtual: Conversa | null;
  onNovaConversa: () => void;
  onSelecionarConversa: (conversa: Conversa) => void;
  onDeletarConversa: (id: string) => void;
  onRenomearConversa: (id: string, novoTitulo: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  conversas,
  conversaAtual,
  onNovaConversa,
  onSelecionarConversa,
  onDeletarConversa,
  onRenomearConversa,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tituloEditado, setTituloEditado] = useState("");

  const iniciarEdicao = (conversa: Conversa, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditandoId(conversa.id);
    setTituloEditado(conversa.titulo);
  };

  const salvarTitulo = () => {
    if (editandoId && tituloEditado.trim()) {
      onRenomearConversa(editandoId, tituloEditado.trim());
    }
    setEditandoId(null);
    setTituloEditado("");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTituloEditado("");
  };

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
          "w-[280px] sm:w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sidebar-primary to-gold-dark rounded-lg flex items-center justify-center shadow-subtle">
                <Sparkles className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-serif font-medium text-lg text-sidebar-foreground tracking-tight">LogosFlow</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground h-10 w-10 min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            onClick={onNovaConversa} 
            className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-11 min-h-[44px] text-base rounded-lg shadow-subtle font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Conversa
          </Button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div className="space-y-1">
            {conversas.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageCircle className="w-12 h-12 text-sidebar-foreground/20 mx-auto mb-4" />
                <p className="text-sm text-sidebar-foreground/50 font-medium">
                  Nenhuma conversa ainda
                </p>
                <p className="text-xs text-sidebar-foreground/30 mt-2">
                  Clique em "Nova Conversa" para começar
                </p>
              </div>
            ) : (
              conversas.map((conversa) => (
                <div
                  key={conversa.id}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 min-h-[48px]",
                    conversaAtual?.id === conversa.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-subtle"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70"
                  )}
                  onClick={() => {
                    if (editandoId !== conversa.id) {
                      onSelecionarConversa(conversa);
                      onClose?.();
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4 shrink-0 opacity-50" />
                  
                  {editandoId === conversa.id ? (
                    <Input
                      value={tituloEditado}
                      onChange={(e) => setTituloEditado(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") salvarTitulo();
                        if (e.key === "Escape") cancelarEdicao();
                      }}
                      onBlur={salvarTitulo}
                      autoFocus
                      className="flex-1 h-7 text-sm bg-sidebar text-sidebar-foreground border border-sidebar-border placeholder:text-sidebar-foreground/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm">{conversa.titulo}</span>
                  )}

                  {editandoId === conversa.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        salvarTitulo();
                      }}
                      className="p-1.5 hover:bg-primary/20 rounded-md transition-all"
                      title="Salvar"
                    >
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => iniciarEdicao(conversa, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 sm:p-1.5 hover:bg-primary/20 rounded-md transition-all min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                        title="Renomear conversa"
                      >
                        <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-primary" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletarConversa(conversa.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 sm:p-1.5 hover:bg-destructive/20 rounded-md transition-all min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                        title="Deletar conversa"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-destructive" />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-sidebar-border space-y-3">
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full gap-2 h-11 min-h-[44px] text-sm font-medium border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => { navigate("/admin"); onClose?.(); }}
            >
              <Shield className="w-4 h-4" />
              Painel Administrativo
            </Button>
          )}
          <p className="text-xs text-sidebar-foreground/30 text-center font-medium tracking-wide uppercase">
            Assistente Teológico
          </p>
        </div>
      </div>
    </>
  );
}