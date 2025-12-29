import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConversas } from "@/hooks/useConversas";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMode } from "@/types/chat";
import { Loader2 } from "lucide-react";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [modo, setModo] = useState<ChatMode>("livre");

  const {
    conversas,
    conversaAtual,
    mensagens,
    setMensagens,
    loading: conversasLoading,
    criarConversa,
    selecionarConversa,
    deletarConversa,
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
  };

  const handleEnviarMensagem = async (conteudo: string) => {
    if (!conversaAtual) {
      const novaConversa = await criarConversa(modo);
      if (novaConversa) {
        setTimeout(() => enviarMensagem(conteudo), 100);
      }
    } else {
      enviarMensagem(conteudo);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || conversasLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        onDeletarConversa={deletarConversa}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          titulo={conversaAtual?.titulo || ""}
          modo={conversaAtual?.modo as ChatMode || modo}
          onModoChange={setModo}
          onLogout={handleLogout}
        />
        <ChatMessages mensagens={mensagens} />
        <ChatInput onEnviar={handleEnviarMensagem} />
      </div>
    </div>
  );
}
