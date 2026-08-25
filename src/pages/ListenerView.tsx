import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Ear,
  Loader2,
  LockKeyhole,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { requestClarification, requestListenerAnalysis } from "@/lib/listenerView";
import type {
  ClarificationResponse,
  ListenerViewInput,
  ListenerViewStep,
} from "@/types/listenerView";

const EMPTY_INPUT: ListenerViewInput = {
  passage: "",
  outline: "",
  audience: "",
  objective: "",
  duration: "",
};

export default function ListenerView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<ListenerViewStep>("form");
  const [input, setInput] = useState<ListenerViewInput>(EMPTY_INPUT);
  const [clarification, setClarification] = useState<ClarificationResponse | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [requiresSignup, setRequiresSignup] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateInput = (field: keyof ListenerViewInput, value: string) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const handleClarification = async (event: FormEvent) => {
    event.preventDefault();

    if (input.passage.trim().length < 3) {
      toast({
        title: "Informe a passagem bíblica",
        description: "Exemplo: Salmo 27.4 ou Romanos 8.1–11.",
        variant: "destructive",
      });
      return;
    }

    if (input.outline.trim().length < 120) {
      toast({
        title: "O esboço está muito curto",
        description: "Cole ao menos 120 caracteres para que a leitura tenha contexto suficiente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await requestClarification({
        ...input,
        passage: input.passage.trim(),
        outline: input.outline.trim(),
      });
      setClarification(response);
      setAnswers(response.questions.map(() => ""));
      setStep("questions");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const requestError = error as Error & { code?: string };
      if (requestError.code === "GUEST_LIMIT_REACHED") {
        toast({
          title: "Sua leitura gratuita já foi utilizada",
          description: "Crie uma conta para analisar outro esboço e salvar seus resultados.",
        });
      } else {
        toast({ title: "Não foi possível iniciar a leitura", description: requestError.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async (event: FormEvent) => {
    event.preventDefault();
    if (!clarification) return;

    if (answers.some((answer) => answer.trim().length < 2)) {
      toast({
        title: "Responda às perguntas",
        description: "Suas respostas ajudam o LogosFlow a não interpretar sua intenção de forma errada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await requestListenerAnalysis(
        clarification.sessionId,
        input,
        answers.map((answer) => answer.trim()),
      );
      setAnalysis(response.analysis);
      setRequiresSignup(response.requiresSignup);
      setStep("analysis");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast({
        title: "Não foi possível concluir a leitura",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <button type="button" onClick={() => navigate("/")} className="font-display text-xl font-medium text-gradient-gold">
            LogosFlow
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Ear className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Visão do Ouvinte</p>
          <h1 className="font-display text-3xl font-medium leading-tight md:text-5xl">
            Como sua mensagem chegará a quem vai ouvi-la?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Antecipe dúvidas, identifique ideias pouco claras e aproxime a aplicação da realidade da igreja — sem abrir mão da sua convicção e responsabilidade pastoral.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2" aria-label="Progresso da leitura">
          {["Seu esboço", "Compreensão", "Visão do ouvinte"].map((label, index) => {
            const activeIndex = step === "form" ? 0 : step === "questions" ? 1 : 2;
            const isReached = index <= activeIndex;
            return (
              <div key={label} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
                <div className={`flex items-center gap-2 ${isReached ? "text-foreground" : "text-muted-foreground"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isReached ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {index < activeIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="hidden text-xs font-medium sm:inline">{label}</span>
                </div>
                {index < 2 && <div className={`h-px min-w-5 flex-1 ${index < activeIndex ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {step === "form" && (
          <Card className="mx-auto max-w-3xl border-border/80 shadow-elegant">
            <CardContent className="p-6 md:p-9">
              <form onSubmit={handleClarification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="passage">Passagem bíblica principal <span className="text-primary">*</span></Label>
                  <Input
                    id="passage"
                    value={input.passage}
                    onChange={(event) => updateInput("passage", event.target.value)}
                    placeholder="Ex.: Salmo 27.4"
                    maxLength={200}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between gap-4">
                    <Label htmlFor="outline">Seu esboço <span className="text-primary">*</span></Label>
                    <span className="text-xs text-muted-foreground">{input.outline.length.toLocaleString("pt-BR")}/20.000</span>
                  </div>
                  <Textarea
                    id="outline"
                    value={input.outline}
                    onChange={(event) => updateInput("outline", event.target.value)}
                    placeholder="Cole aqui o texto completo do esboço, mesmo que ainda esteja em construção."
                    className="min-h-[280px] resize-y leading-relaxed"
                    maxLength={20000}
                    disabled={loading}
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm font-medium">Contexto da mensagem <span className="font-normal text-muted-foreground">(opcional)</span></p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="audience">Quem vai ouvir?</Label>
                      <Input id="audience" value={input.audience} onChange={(event) => updateInput("audience", event.target.value)} placeholder="Ex.: igreja local, jovens, visitantes" maxLength={500} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração prevista</Label>
                      <Input id="duration" value={input.duration} onChange={(event) => updateInput("duration", event.target.value)} placeholder="Ex.: 30 minutos" maxLength={120} disabled={loading} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="objective">O que você espera produzir nos ouvintes?</Label>
                      <Input id="objective" value={input.objective} onChange={(event) => updateInput("objective", event.target.value)} placeholder="Ex.: conduzir a igreja da ansiedade à confiança em Deus" maxLength={500} disabled={loading} />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full py-6 text-base" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Ear className="mr-2 h-5 w-5" />}
                  {loading ? "Lendo seu esboço..." : "Ver pela perspectiva do ouvinte"}
                </Button>

                <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p>Sua primeira leitura pode ser feita sem cadastro. O texto não é salvo no histórico de visitantes. Para continuar ou analisar outro esboço, será necessário criar uma conta.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "questions" && clarification && (
          <div className="mx-auto max-w-3xl space-y-6">
            <Card className="border-primary/20 bg-primary/[0.035]">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Ear className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-medium">O que compreendi</h2>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">{clarification.understanding}</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-6 md:p-8">
                <div className="mb-2 flex items-center gap-3">
                  <MessageCircleQuestion className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-medium">Antes de continuar</h2>
                </div>
                <p className="mb-7 text-sm leading-relaxed text-muted-foreground">Quero conferir sua intenção antes de mostrar como diferentes ouvintes podem receber a mensagem.</p>

                <form onSubmit={handleAnalysis} className="space-y-6">
                  {clarification.questions.map((question, index) => (
                    <div key={question} className="space-y-2">
                      <Label htmlFor={`answer-${index}`} className="text-base leading-relaxed">{index + 1}. {question}</Label>
                      <Textarea
                        id={`answer-${index}`}
                        value={answers[index] || ""}
                        onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
                        placeholder="Responda com suas próprias palavras."
                        className="min-h-[110px] resize-y"
                        maxLength={1000}
                        disabled={loading}
                      />
                    </div>
                  ))}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep("form")} disabled={loading}>Revisar meu esboço</Button>
                    <Button type="submit" size="lg" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      {loading ? "Preparando a leitura..." : "Continuar"}
                      {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "analysis" && (
          <div className="mx-auto max-w-4xl space-y-6">
            <Card className="shadow-elegant">
              <CardContent className="p-6 md:p-10">
                <div className="mb-8 border-b border-border pb-6">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Visão do Ouvinte</p>
                  <h2 className="font-display text-3xl font-medium">Uma segunda perspectiva sobre sua mensagem</h2>
                </div>
                <div className="ai-message-content prose prose-stone max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/[0.04]">
              <CardContent className="flex flex-col items-start gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <div className="max-w-2xl">
                  <div className="mb-2 flex items-center gap-2">
                    <LockKeyhole className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-xl font-medium">A decisão continua sendo sua</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Esta leitura não substitui estudo, oração, discernimento nem responsabilidade pastoral. Ela oferece perspectivas para você examinar e decidir o que realmente serve à mensagem.
                  </p>
                </div>
                {requiresSignup ? (
                  <Button size="lg" onClick={() => navigate("/auth?mode=signup&returnTo=/visao-do-ouvinte")} className="shrink-0">
                    Criar conta para continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => { setInput(EMPTY_INPUT); setClarification(null); setAnswers([]); setAnalysis(""); setStep("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="shrink-0">
                    Analisar outro esboço
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          O LogosFlow recebe pregadores de diferentes tradições cristãs. Suas análises são orientadas pela centralidade de Cristo, fidelidade às Escrituras, leitura histórico-gramatical e tradição reformada. As sugestões não substituem o discernimento e as convicções do usuário.
        </p>
      </main>
    </div>
  );
}
