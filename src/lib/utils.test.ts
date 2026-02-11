import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classnames utility)", () => {
  it("combina classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignora valores falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("aceita objetos condicionais", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("faz merge de classes Tailwind conflitantes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("retorna string vazia sem argumentos", () => {
    expect(cn()).toBe("");
  });
});
