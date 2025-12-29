import { BookOpen, Search, Heart, CheckCircle, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mensagem } from "@/types/chat";

interface ProgressIndicatorProps {
  mensagens: Mensagem[];
  modo: string;
}

const ETAPAS_MENSAGEM = [
  { id: "texto", label: "Texto", icon: BookOpen, keywords: ["texto", "passagem", "qual texto", "escolhido"] },
  { id: "exegese", label: "Exegese", icon: Search, keywords: ["exegese", "contexto histórico", "contexto literário", "análise do texto"] },
  { id: "teologia", label: "Teologia", icon: Lightbulb, keywords: ["teologia bíblica", "tema teológico", "doutrina", "verdade central"] },
  { id: "aplicacao", label: "Aplicações", icon: Heart, keywords: ["aplicação", "aplicações", "vida prática", "aplicar"] },
  { id: "conclusao", label: "Conclusão", icon: CheckCircle, keywords: ["conclusão", "fechamento", "apelo final"] },
  { id: "introducao", label: "Introdução", icon: FileText, keywords: ["introdução", "abertura", "gancho"] },
];

function detectCurrentStage(mensagens: Mensagem[]): number {
  // Get the last AI message
  const lastAiMessage = [...mensagens].reverse().find(m => m.remetente_ia && m.conteudo);
  
  if (!lastAiMessage?.conteudo) return 0;
  
  const content = lastAiMessage.conteudo.toLowerCase();
  
  // Check each stage in reverse order to find the current one
  for (let i = ETAPAS_MENSAGEM.length - 1; i >= 0; i--) {
    const etapa = ETAPAS_MENSAGEM[i];
    if (etapa.keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      return i;
    }
  }
  
  return 0;
}

export function ProgressIndicator({ mensagens, modo }: ProgressIndicatorProps) {
  // Only show for "mensagem" mode
  if (modo !== "mensagem" || mensagens.length === 0) {
    return null;
  }

  const currentStage = detectCurrentStage(mensagens);

  return (
    <div className="px-4 py-3 bg-secondary/30 border-b border-border/50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
          {ETAPAS_MENSAGEM.map((etapa, index) => {
            const Icon = etapa.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            
            return (
              <div
                key={etapa.id}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{etapa.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Etapa {currentStage + 1} de {ETAPAS_MENSAGEM.length}: <span className="font-medium text-foreground">{ETAPAS_MENSAGEM[currentStage].label}</span>
        </p>
      </div>
    </div>
  );
}
