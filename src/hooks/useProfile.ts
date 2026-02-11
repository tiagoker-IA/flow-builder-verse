import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: { nome?: string; avatar_url?: string }) => {
    if (!user) return;
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast({ title: "Erro ao atualizar perfil", description: error.message, variant: "destructive" });
    } else {
      await fetchProfile();
      toast({ title: "Perfil atualizado com sucesso!" });
    }
    setUpdating(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url });
    return avatar_url;
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    try {
      const res = await supabase.functions.invoke("send-auth-email", {
        body: {
          email: user.email,
          type: "recovery",
          redirect_to: window.location.origin,
        },
      });
      if (res.error) throw res.error;
      const data = res.data as any;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return { profile, loading, updating, updateProfile, uploadAvatar, resetPassword };
}
