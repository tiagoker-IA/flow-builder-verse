import { 
  BookMarked, 
  FileText,
  Heart, 
  MessageCircle,
  Users,
} from "lucide-react";

const modes = [
  {
    icon: BookMarked,
    name: "Exegese",
    description: "Análise textual rigorosa, contexto histórico-cultural e interpretação fiel.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  {
    icon: FileText,
    name: "Mensagem",
    description: "Organização da ideia central, estrutura, ilustrações, aplicação e conclusão.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  {
    icon: Heart,
    name: "Devocional",
    description: "Meditação bíblica, sondagem do coração, centralidade de Cristo e oração.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400"
  },
  {
    icon: Users,
    name: "Grupo Pequeno",
    description: "Planejamento de encontros, perguntas abertas e aplicações comunitárias.",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
  },
  {
    icon: MessageCircle,
    name: "Livre",
    description: "Conversa aberta sobre temas bíblicos, teológicos e vida cristã.",
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
            Outros recursos da <span className="text-gradient-gold">plataforma</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A Visão do Ouvinte é a principal porta de entrada. Os modos já existentes continuam disponíveis como apoio complementar.
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
