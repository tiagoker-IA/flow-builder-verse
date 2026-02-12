import { TrendingUp, Users, Award, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MODO_LABELS: Record<string, string> = {
  livre: "Livre",
  mensagem: "Mensagem",
  exegese: "Exegese",
  devocional: "Devocional",
  academico: "Acadêmico",
};

interface BehaviorCardsProps {
  mensagensPorConversa: number;
  usuariosAtivos7d: number;
  modoMaisPopular: string;
  taxaRetorno: number;
}

export function BehaviorCards({ mensagensPorConversa, usuariosAtivos7d, modoMaisPopular, taxaRetorno }: BehaviorCardsProps) {
  const cards = [
    {
      label: "Msgs/conversa",
      value: mensagensPorConversa.toFixed(1),
      icon: TrendingUp,
      description: "Profundidade de engajamento",
    },
    {
      label: "Ativos (7 dias)",
      value: usuariosAtivos7d,
      icon: Users,
      description: "Usuários recentes",
    },
    {
      label: "Modo popular",
      value: MODO_LABELS[modoMaisPopular] || modoMaisPopular || "-",
      icon: Award,
      description: "Mais utilizado",
    },
    {
      label: "Taxa retorno",
      value: `${taxaRetorno}%`,
      icon: RotateCcw,
      description: "Usuários com >1 conversa",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="bg-muted/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <card.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold">{card.value}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
