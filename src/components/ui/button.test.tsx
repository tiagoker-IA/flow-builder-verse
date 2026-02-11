import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renderiza com texto", () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole("button", { name: "Clique aqui" })).toBeInTheDocument();
  });

  it("chama onClick ao clicar", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Enviar</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("não dispara onClick quando disabled", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Desabilitado</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("aplica variante destructive", () => {
    render(<Button variant="destructive">Excluir</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("destructive");
  });

  it("aplica tamanho sm", () => {
    render(<Button size="sm">Pequeno</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-9");
  });
});
