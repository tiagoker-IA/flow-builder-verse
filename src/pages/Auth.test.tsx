import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock supabase before importing component
import { mockSupabase } from "@/test/mocks/supabase";

// Mock useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

import Auth from "./Auth";

const renderAuth = () =>
  render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>
  );

describe("Auth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("renderiza formulário de login por padrão", () => {
    renderAuth();
    expect(screen.getByText("LogosFlow")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("permite digitar email e senha", () => {
    renderAuth();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const senhaInput = screen.getByLabelText("Senha") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(senhaInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("teste@email.com");
    expect(senhaInput.value).toBe("123456");
  });

  it("alterna para modo cadastro", () => {
    renderAuth();
    fireEvent.click(screen.getByText(/não tem uma conta/i));
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Senha")).toBeInTheDocument();
  });

  it("alterna para modo recuperação de senha", () => {
    renderAuth();
    fireEvent.click(screen.getByText(/esqueci minha senha/i));
    expect(screen.getByRole("button", { name: /enviar link/i })).toBeInTheDocument();
  });

  it("chama signInWithPassword ao submeter login", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });

    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await vi.waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "teste@email.com",
        password: "123456",
      });
    });
  });
});
