import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Must import mocks BEFORE the hook
import { mockSupabase } from "@/test/mocks/supabase";
import { mockSession } from "@/test/mocks/data";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicia com loading true", () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it("retorna user null quando não autenticado", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("retorna user quando autenticado", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.id).toBe("user-123-abc");
    expect(result.current.session).toBeTruthy();
  });

  it("signOut chama supabase.auth.signOut", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.signOut();
    expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
  });
});
