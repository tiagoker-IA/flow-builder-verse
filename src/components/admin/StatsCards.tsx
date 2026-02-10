import { Users, MessageSquare, MessagesSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalUsuarios: number;
  totalConversas: number;
  totalMensagens: number;
  totalFeedbacks: number;
}

export function StatsCards({ totalUsuarios, totalConversas, totalMensagens, totalFeedbacks }: StatsCardsProps) {
  const cards = [
    { title: "Usuários", value: totalUsuarios, icon: Users, color: "text-primary" },
    { title: "Conversas", value: totalConversas, icon: MessageSquare, color: "text-primary" },
    { title: "Mensagens", value: totalMensagens, icon: MessagesSquare, color: "text-primary" },
    { title: "Feedbacks", value: totalFeedbacks, icon: Star, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString("pt-BR")}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
