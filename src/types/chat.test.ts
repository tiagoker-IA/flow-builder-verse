import { describe, it, expect } from "vitest";
import { MODOS_CHAT, type ChatMode } from "./chat";

describe("MODOS_CHAT", () => {
  const modosEsperados: ChatMode[] = ["mensagem", "exegese", "devocional", "academico", "livre"];

  it("contém todos os 5 modos esperados", () => {
    expect(MODOS_CHAT).toHaveLength(5);
    const values = MODOS_CHAT.map((m) => m.value);
    expect(values).toEqual(expect.arrayContaining(modosEsperados));
  });

  it("cada modo tem label, description e icon definidos", () => {
    MODOS_CHAT.forEach((modo) => {
      expect(modo.label).toBeTruthy();
      expect(modo.description).toBeTruthy();
      expect(modo.icon).toBeDefined();
      expect(modo.color).toBeTruthy();
    });
  });
});
