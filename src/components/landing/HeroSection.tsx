import { Button } from "@/components/ui/button";
import { ArrowRight, Ear, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-light/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Uma segunda perspectiva antes de você pregar</span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-tight mb-6 animate-fade-in-up">
          Como sua mensagem chegará
          <br />
          a quem vai <span className="text-gradient-gold">ouvi-la?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Antecipe dúvidas, identifique ideias pouco claras e aproxime a aplicação da realidade da igreja — sem abrir mão da sua convicção e responsabilidade pastoral.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="lg" 
            onClick={() => navigate("/visao-do-ouvinte")}
            className="px-8 py-6 text-lg shadow-elegant hover:shadow-elevated transition-all"
          >
            <Ear className="mr-2 h-5 w-5" />
            Ver pela perspectiva do ouvinte
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/auth")}
            className="px-8 py-6 text-lg"
          >
            Entrar na plataforma
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">Você continua sendo o autor e responsável pela mensagem</p>
          <div className="flex items-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-foreground">1</div>
              <div className="text-xs">Leitura gratuita</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-foreground">1–2</div>
              <div className="text-xs">Perguntas pessoais</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-foreground">Sem</div>
              <div className="text-xs">Notas ou vereditos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
