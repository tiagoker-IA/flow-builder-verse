import { CheckCircle2 } from "lucide-react";

const steps = [
  { number: 1, title: "Texto Bíblico", description: "Selecione a passagem base" },
  { number: 2, title: "Contexto", description: "Análise histórico-cultural" },
  { number: 3, title: "Interpretação", description: "Significado do texto" },
  { number: 4, title: "Tema Central", description: "Ideia principal da mensagem" },
  { number: 5, title: "Estrutura", description: "Organização dos pontos" },
  { number: 6, title: "Aplicação", description: "Relevância para hoje" },
  { number: 7, title: "Conclusão", description: "Chamada à ação" }
];

const StepsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-medium mb-4">
            Jornada <span className="text-gradient-gold">guiada</span> em 7 etapas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Siga um processo estruturado para desenvolver sua mensagem do início ao fim.
          </p>
        </div>

        {/* Steps timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-border hidden lg:block" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-2">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className="flex flex-col items-center text-center relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Step circle */}
                  <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-3 relative z-10">
                    <span className="font-display text-xl font-semibold text-primary">{step.number}</span>
                  </div>
                  
                  <h3 className="font-medium text-sm mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-xs">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {[
            "Processo metodológico",
            "Foco na passagem",
            "Aplicação prática",
            "Mensagem completa"
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
