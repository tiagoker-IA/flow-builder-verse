import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Mensagem } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface ChatMessagesProps {
  mensagens: Mensagem[];
  isLoading?: boolean;
  onEnviarSugestao?: (mensagem: string) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-1" />
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-2" />
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-3" />
    </div>
  );
}

export function ChatMessages({ mensagens, isLoading, onEnviarSugestao }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const sugestoes = ["Exegese de Romanos 8", "O que é graça?", "Estudo sobre fé"];

  if (mensagens.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-elegant border border-primary/10">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-medium mb-4 text-foreground tracking-tight">
            Olá! Sou o LogosFlow
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            Seu assistente para estudos bíblicos e teológicos. 
            Selecione um modo no topo e faça sua pergunta para começar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
            {sugestoes.map((sugestao) => (
              <button 
                key={sugestao}
                onClick={() => onEnviarSugestao?.(sugestao)}
                className="px-4 py-2 bg-secondary/50 text-muted-foreground text-sm rounded-lg border border-border/50 whitespace-nowrap hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-5">
        {mensagens.map((mensagem, index) => (
          <div
            key={mensagem.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              mensagem.remetente_ia ? "justify-start" : "justify-end"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {mensagem.remetente_ia && (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                mensagem.remetente_ia
                  ? "bg-chat-ai text-chat-ai-foreground rounded-tl-sm shadow-subtle border border-border/30"
                  : "bg-chat-user text-chat-user-foreground rounded-tr-sm shadow-elegant"
              )}
            >
              {mensagem.conteudo ? (
                mensagem.remetente_ia ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2.5 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:font-serif">
                    <ReactMarkdown>{mensagem.conteudo}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{mensagem.conteudo}</span>
                )
              ) : (
                <TypingIndicator />
              )}
            </div>
            {!mensagem.remetente_ia && (
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}