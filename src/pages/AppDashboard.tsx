import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConversas } from "@/hooks/useConversas";
import { useChat } from "@/hooks/useChat";
import { useGuestConversas } from "@/hooks/useGuestConversas";
import { useGuestChat } from "@/hooks/useGuestChat";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModoSelector } from "@/components/chat/ModoSelector";
import { ProgressIndicator } from "@/components/chat/ProgressIndicator";
import { GuestBanner } from "@/components/chat/GuestBanner";

import { ChatMode } from "@/types/chat";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [modo, setModo] = useState<ChatMode>("mensagem");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isGuest = !authLoading && !user;

  // Authenticated hooks
  const authConversas = useConversas(user?.id);

  // Guest hooks
  const guestConversas = useGuestConversas();

  // Pick the right set based on auth state
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
  } = isGuest ? guestConversas : authConversas;

  const authChat = useChat({
    conversaId: conversaAtual?.id || "",
    modo: (conversaAtual?.modo as ChatMode) || modo,
    mensagens,
    setMensagens,
  });

  const guestChat = useGuestChat({
    conversaId: conversaAtual?.id || "",
    modo: (conversaAtual?.modo as ChatMode) || modo,
    mensagens,
    setMensagens,
    persistMensagens: guestConversas.persistMensagens,
  });

  const { enviarMensagem } = isGuest ? guestChat : authChat;

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
    if (isGuest) {
      navigate("/auth");
    } else {
      await signOut();
      navigate("/auth");
    }
  };

  if (authLoading) {
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
        isGuest={isGuest}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          titulo={conversaAtual?.titulo || ""}
          modo={(conversaAtual?.modo as ChatMode) || modo}
          onModoChange={setModo}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          showMenuButton={true}
          mensagens={mensagens}
          isGuest={isGuest}
        />

        {/* Guest banner */}
         {isGuest && <GuestBanner />}
        
        {/* Mobile mode selector */}
          <div className="md:hidden px-4 py-2 border-b border-border bg-muted/30">
            <ModoSelector modo={modo} onModoChange={setModo} />
          </div>
          
          {/* Progress indicator for message mode */}
          <ProgressIndicator 
            mensagens={mensagens} 
            modo={conversaAtual?.modo || modo} 
          />
          
          <ChatMessages 
            mensagens={mensagens} 
            isLoading={isSending} 
            onEnviarSugestao={handleEnviarMensagem}
            modo={(conversaAtual?.modo as ChatMode) || modo}
          />
          <ChatInput 
            onEnviar={handleEnviarMensagem} 
            isLoading={isSending}
          />
      </div>
    </div>
  );
}
