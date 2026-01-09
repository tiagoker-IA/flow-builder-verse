import { 
  BookMarked, 
  Mic, 
  Heart, 
  Shield, 
  Sunrise 
} from "lucide-react";

const modes = [
  {
    icon: BookMarked,
    name: "Exegético",
    description: "Análise textual rigorosa, contexto histórico-cultural e interpretação fiel.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  {
    icon: Mic,
    name: "Retórico",
    description: "Comunicação persuasiva, estrutura oratória e técnicas de engajamento.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  {
    icon: Heart,
    name: "Prático",
    description: "Aplicações concretas, ilustrações do cotidiano e transformação de vida.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400"
  },
  {
    icon: Shield,
    name: "Apologético",
    description: "Defesa da fé, argumentação lógica e respostas a objeções comuns.",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
  },
  {
    icon: Sunrise,
    name: "Devocional",
    description: "Reflexões íntimas, meditação bíblica e crescimento espiritual.",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400"
  }
];

const ModesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-medium mb-4">
            5 modos de <span className="text-gradient-gold">assistência</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o tipo de ajuda que você precisa e a IA se adapta ao seu contexto específico.
          </p>
        </div>

        {/* Modes display */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {modes.map((mode, index) => (
              <div 
                key={mode.name}
                className="group flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-elegant transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-14 w-14 rounded-full ${mode.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mode.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-medium mb-2">{mode.name}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{mode.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModesSection;
