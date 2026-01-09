import { useState } from "react";
import { FileDown, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Mensagem, ChatMode, MODOS_CHAT } from "@/types/chat";
import { exportConversationToWord, exportSingleMessageToWord } from "@/lib/exportToWord";

interface ExportButtonProps {
  mensagens: Mensagem[];
  titulo: string;
  modo: ChatMode;
}

export function ExportButton({ mensagens, titulo, modo }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const modoLabel = MODOS_CHAT.find(m => m.value === modo)?.label || modo;

  const handleExportConversation = async () => {
    if (mensagens.length === 0) {
      toast.error("Não há mensagens para exportar");
      return;
    }

    setIsExporting(true);
    try {
      await exportConversationToWord(mensagens, titulo, modoLabel);
      toast.success("Conversa exportada com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar conversa");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLastResponse = async () => {
    const lastAiMessage = [...mensagens].reverse().find(m => m.remetente_ia);
    
    if (!lastAiMessage?.conteudo) {
      toast.error("Não há resposta da IA para exportar");
      return;
    }

    setIsExporting(true);
    try {
      await exportSingleMessageToWord(lastAiMessage.conteudo, titulo);
      toast.success("Mensagem exportada com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar mensagem");
    } finally {
      setIsExporting(false);
    }
  };

  const hasMessages = mensagens.length > 0;
  const hasAiResponse = mensagens.some(m => m.remetente_ia);

  if (!hasMessages) return null;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={isExporting}
              className="text-muted-foreground hover:text-foreground h-10 w-10 min-h-[44px] min-w-[44px]"
            >
              <FileDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar para Word</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuItem 
          onClick={handleExportConversation}
          disabled={!hasMessages}
          className="cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Exportar conversa completa
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportLastResponse}
          disabled={!hasAiResponse}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2" />
          Exportar última resposta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
