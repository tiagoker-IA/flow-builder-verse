import { Sparkles, LogOut, Menu, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModoSelector } from "./ModoSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { ExportButton } from "./ExportButton";
import { ChatMode, MODOS_CHAT, Mensagem } from "@/types/chat";
import { useAdmin } from "@/hooks/useAdmin";

interface ChatHeaderProps {
  titulo: string;
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
  mensagens?: Mensagem[];
}

export function ChatHeader({ 
  titulo, 
  modo, 
  onModoChange, 
  onLogout,
  onToggleSidebar,
  showMenuButton,
  mensagens = []
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const modoAtual = MODOS_CHAT.find(m => m.value === modo);
  
  return (
    <div className="h-16 sm:h-[72px] border-b border-border bg-background flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {showMenuButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary to-gold-dark rounded-xl flex items-center justify-center shadow-elegant">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif font-medium text-lg sm:text-xl leading-tight truncate max-w-[150px] sm:max-w-none tracking-tight">
            {titulo || "LogosFlow"}
          </h1>
          {modoAtual && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <modoAtual.icon className="w-3 h-3" />
              <span className="hidden sm:inline">Modo</span> {modoAtual.label}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <ModoSelector modo={modo} onModoChange={onModoChange} />
        </div>
        <ExportButton mensagens={mensagens} titulo={titulo} modo={modo} />
        <FeedbackButton modoChat={modo} pagina="chat" />
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            title="Painel Admin"
            className="text-muted-foreground hover:text-foreground h-10 w-10 min-h-[44px] min-w-[44px]"
          >
            <Shield className="w-4 h-4" />
          </Button>
        )}
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLogout} 
          title="Sair"
          className="text-muted-foreground hover:text-foreground h-10 w-10 min-h-[44px] min-w-[44px]"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}