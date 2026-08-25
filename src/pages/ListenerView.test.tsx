import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  requestClarification: vi.fn(),
  requestListenerAnalysis: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));

vi.mock("@/lib/listenerView", () => ({
  requestClarification: mocks.requestClarification,
  requestListenerAnalysis: mocks.requestListenerAnalysis,
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

import ListenerView from "./ListenerView";

function renderPage() {
  return render(
    <MemoryRouter>
      <ListenerView />
    </MemoryRouter>,
  );
}

describe("Visão do Ouvinte", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("apresenta a proposta aprovada e os campos essenciais", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /como sua mensagem chegará/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/passagem bíblica principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seu esboço/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver pela perspectiva do ouvinte/i })).toBeInTheDocument();
  });

  it("não envia um esboço curto", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/passagem bíblica principal/i), { target: { value: "Salmo 27.4" } });
    fireEvent.change(screen.getByLabelText(/seu esboço/i), { target: { value: "Texto curto" } });
    fireEvent.click(screen.getByRole("button", { name: /ver pela perspectiva do ouvinte/i }));

    expect(mocks.requestClarification).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "O esboço está muito curto" }));
  });

  it("mostra a compreensão e as perguntas antes da análise", async () => {
    mocks.requestClarification.mockResolvedValue({
      sessionId: "session-1",
      understanding: "Entendi que você deseja conduzir a igreja da ansiedade à confiança em Deus.",
      questions: ["Qual mudança você espera produzir ao final da mensagem?"],
    });
    renderPage();

    fireEvent.change(screen.getByLabelText(/passagem bíblica principal/i), { target: { value: "Salmo 27.4" } });
    fireEvent.change(screen.getByLabelText(/seu esboço/i), { target: { value: "Este é um esboço completo o bastante para permitir que a ferramenta compreenda a intenção pastoral e formule uma pergunta realmente específica antes de oferecer sua leitura." } });
    fireEvent.click(screen.getByRole("button", { name: /ver pela perspectiva do ouvinte/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "O que compreendi" })).toBeInTheDocument());
    expect(screen.getByText(/conduzir a igreja da ansiedade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/qual mudança você espera/i)).toBeInTheDocument();
  });
});
