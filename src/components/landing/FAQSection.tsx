import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é o Flow Builder Verse?",
    answer:
      "É uma plataforma que utiliza inteligência artificial para auxiliar pregadores e líderes na preparação de mensagens, estudos bíblicos e reuniões de grupos pequenos — tudo de forma estruturada e teologicamente fundamentada.",
  },
  {
    question: "Preciso ter conhecimento teológico para usar?",
    answer:
      "Não. A plataforma foi projetada para ser acessível tanto para iniciantes quanto para pregadores experientes. A IA guia você por cada etapa, oferecendo contexto histórico, exegético e aplicações práticas.",
  },
  {
    question: "A IA substitui o estudo pessoal da Bíblia?",
    answer:
      "De forma alguma. A IA funciona como uma ferramenta complementar — ela ajuda a organizar ideias, oferecer contexto e sugerir estruturas, mas o estudo pessoal, a oração e a direção do Espírito Santo permanecem essenciais.",
  },
  {
    question: "Quais modos de assistência estão disponíveis?",
    answer:
      "São cinco modos: Mensagem (fluxo guiado em 7 etapas para pregações), Exegese (análise profunda de textos bíblicos), Devocional (reflexões para meditação pessoal), Livre (conversa aberta sobre temas bíblicos) e Grupos Pequenos (planejamento completo de reuniões com os 4 Es).",
  },
  {
    question: "Posso exportar o conteúdo gerado?",
    answer:
      "Sim! Você pode exportar suas mensagens e estudos em formato Word (.docx) ou CSV, facilitando a impressão, compartilhamento e uso offline.",
  },
  {
    question: "É gratuito?",
    answer:
      "Sim, você pode criar sua conta e começar a usar gratuitamente, sem necessidade de cartão de crédito.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia e autenticação segura para proteger suas informações. Suas conversas e conteúdos são privados e acessíveis apenas por você.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-medium mb-4">
            Perguntas <span className="text-gradient-gold">frequentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre a plataforma e como ela pode ajudar no seu ministério.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
