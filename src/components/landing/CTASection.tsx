import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative background */}
          <div className="relative p-12 md:p-16 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-gold-light/5 border border-primary/20 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold-light/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-medium mb-4">
                Pronto para transformar sua <span className="text-gradient-gold">pregação</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Junte-se a pregadores que já estão usando IA para potencializar suas mensagens 
                sem perder a autenticidade e a profundidade teológica.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="px-10 py-6 text-lg shadow-elegant hover:shadow-elevated transition-all"
              >
                Criar Minha Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="mt-6 text-sm text-muted-foreground">
                Sem cartão de crédito • Acesso imediato
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
