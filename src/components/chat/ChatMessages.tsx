import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mensagem } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessagesProps {
  mensagens: Mensagem[];
  isLoading?: boolean;
}

export function ChatMessages({ mensagens, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  if (mensagens.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Olá! Sou o LogosFlow</h2>
          <p className="text-muted-foreground">
            Estou aqui para ajudar você em seus estudos bíblicos e teológicos. 
            Faça uma pergunta para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              mensagem.remetente_ia ? "justify-start" : "justify-end"
            )}
          >
            {mensagem.remetente_ia && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                mensagem.remetente_ia
                  ? "bg-chat-ai text-chat-ai-foreground rounded-tl-md"
                  : "bg-chat-user text-chat-user-foreground rounded-tr-md"
              )}
            >
              {mensagem.conteudo || (
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse-soft" />
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                </span>
              )}
            </div>
            {!mensagem.remetente_ia && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
