import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConversas } from "@/hooks/useConversas";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModoSelector } from "@/components/chat/ModoSelector";
import { ChatMode } from "@/types/chat";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [modo, setModo] = useState<ChatMode>("livre");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    conversas,
    conversaAtual,
    mensagens,
    setMensagens,
    loading: conversasLoading,
    criarConversa,
    selecionarConversa,
    deletarConversa,
    atualizarTitulo,
  } = useConversas(user?.id);

  const { enviarMensagem } = useChat({
    conversaId: conversaAtual?.id || "",
    modo: conversaAtual?.modo as ChatMode || modo,
    mensagens,
    setMensagens,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleNovaConversa = async () => {
    await criarConversa(modo);
    toast({
      title: "Nova conversa criada",
      description: "Você pode começar a digitar sua pergunta.",
    });
  };

  const handleEnviarMensagem = async (conteudo: string) => {
    setIsSending(true);
    try {
      if (!conversaAtual) {
        const novaConversa = await criarConversa(modo);
        if (novaConversa) {
          await enviarMensagem(conteudo, novaConversa.id);
        }
      } else {
        await enviarMensagem(conteudo);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletarConversa = async (id: string) => {
    await deletarConversa(id);
    toast({
      title: "Conversa deletada",
      variant: "destructive",
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || conversasLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        conversas={conversas}
        conversaAtual={conversaAtual}
        onNovaConversa={handleNovaConversa}
        onSelecionarConversa={selecionarConversa}
        onDeletarConversa={handleDeletarConversa}
        onRenomearConversa={atualizarTitulo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          titulo={conversaAtual?.titulo || ""}
          modo={conversaAtual?.modo as ChatMode || modo}
          onModoChange={setModo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          showMenuButton={true}
        />
        
        {/* Mobile mode selector */}
        <div className="md:hidden px-4 py-2 border-b border-border bg-muted/30">
          <ModoSelector modo={modo} onModoChange={setModo} />
        </div>
        
        <ChatMessages mensagens={mensagens} isLoading={isSending} />
        <ChatInput 
          onEnviar={handleEnviarMensagem} 
          isLoading={isSending}
        />
      </div>
    </div>
  );
}