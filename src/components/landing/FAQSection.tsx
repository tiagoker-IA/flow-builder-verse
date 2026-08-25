import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é o LogosFlow?",
    answer:
      "É uma plataforma que oferece ao pregador uma perspectiva adicional sobre o trabalho que ele já produziu. A Visão do Ouvinte mostra como a mensagem pode ser recebida e os demais recursos apoiam exegese, estrutura, aplicação e estudos bíblicos.",
  },
  {
    question: "A ferramenta avalia ou dá nota ao meu sermão?",
    answer:
      "Não. O LogosFlow não entrega nota nem veredito. Ele identifica como diferentes ouvintes podem compreender a mensagem, apresenta pontos fortes, possíveis dúvidas e perguntas para reflexão. Você decide o que aproveitar.",
  },
  {
    question: "A IA substitui o estudo pessoal da Bíblia?",
    answer:
      "Não. A IA oferece uma segunda perspectiva, mas pode errar. Estudo pessoal, oração, discernimento, convicções e responsabilidade pastoral continuam pertencendo ao pregador.",
  },
  {
    question: "Quais modos de assistência estão disponíveis?",
    answer:
      "São cinco modos: Mensagem (crie esboços de pregação passo a passo), Exegese (análise profunda de passagens bíblicas), Devocional (reflexões para meditação pessoal), Livre (conversa aberta sobre temas bíblicos) e Grupos Pequenos (planejamento completo de reuniões com os 4 Es).",
  },
  {
    question: "Posso exportar o conteúdo gerado?",
    answer:
      "Sim! Você pode exportar suas mensagens e estudos em formato Word (.docx) ou CSV, facilitando a impressão, compartilhamento e uso offline.",
  },
  {
    question: "Posso experimentar sem criar uma conta?",
    answer:
      "Sim. A primeira Visão do Ouvinte pode ser concluída sem cadastro. Para continuar a conversa, salvar o resultado ou analisar outro esboço, será necessário criar uma conta.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "A leitura de visitante não é salva no histórico da plataforma. Usuários cadastrados têm seus conteúdos vinculados à própria conta. Ainda assim, o texto precisa ser processado por serviços de inteligência artificial para que a análise seja produzida.",
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
