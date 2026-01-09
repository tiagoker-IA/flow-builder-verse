import { 
  BookOpen, 
  Lightbulb, 
  PenTool, 
  Sparkles, 
  Target, 
  MessageSquare 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Estudo Exegético",
    description: "Análise profunda do texto bíblico com contexto histórico, linguístico e teológico."
  },
  {
    icon: Lightbulb,
    title: "Ideias Criativas",
    description: "Geração de ilustrações, metáforas e aplicações práticas para sua mensagem."
  },
  {
    icon: PenTool,
    title: "Estruturação de Sermões",
    description: "Organização lógica com introdução, desenvolvimento e conclusão impactantes."
  },
  {
    icon: Target,
    title: "5 Modos Especializados",
    description: "Escolha entre modos focados em exegese, retórica, prática, apologética ou devocional."
  },
  {
    icon: MessageSquare,
    title: "Diálogo Inteligente",
    description: "Converse naturalmente e refine suas ideias com respostas contextualizadas."
  },
  {
    icon: Sparkles,
    title: "Formatação para Word",
    description: "Exporte textos prontos para editar no Microsoft Word ou Google Docs."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-medium mb-4">
            Recursos que <span className="text-gradient-gold">potencializam</span> sua mensagem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ferramentas desenvolvidas especificamente para pregadores, professores e estudiosos da Bíblia.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group bg-card hover:bg-card/80 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elegant animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
