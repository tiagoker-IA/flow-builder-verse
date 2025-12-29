import { Sparkles, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModoSelector } from "./ModoSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatMode, MODOS_CHAT } from "@/types/chat";

interface ChatHeaderProps {
  titulo: string;
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

export function ChatHeader({ 
  titulo, 
  modo, 
  onModoChange, 
  onLogout,
  onToggleSidebar,
  showMenuButton 
}: ChatHeaderProps) {
  const modoAtual = MODOS_CHAT.find(m => m.value === modo);
  
  return (
    <div className="h-14 sm:h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {showMenuButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px]"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-gold-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-base sm:text-lg leading-tight truncate max-w-[150px] sm:max-w-none">
            {titulo || "LogosFlow"}
          </h1>
          {modoAtual && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <modoAtual.icon className="w-3 h-3" />
              <span className="hidden sm:inline">Modo</span> {modoAtual.label}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <div className="hidden md:block">
          <ModoSelector modo={modo} onModoChange={onModoChange} />
        </div>
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