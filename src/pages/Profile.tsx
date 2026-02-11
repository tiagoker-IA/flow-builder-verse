import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Key, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updating, updateProfile, uploadAvatar, resetPassword } = useProfile();
  const [nome, setNome] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  if (!initialized && profile) {
    setNome(profile.nome || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    await updateProfile({ nome });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return;
    }
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const initials = profile?.nome
    ? profile.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-medium">Meu Perfil</h1>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader className="items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-24 h-24">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-full" />
                ) : profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Avatar" />
                ) : null}
                <AvatarFallback className="text-2xl font-serif bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <CardTitle className="text-lg">{profile?.nome || "Usuário"}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome de exibição</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <Button onClick={handleSave} disabled={updating} className="w-full">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  Salvar alterações
                </Button>
                <Button variant="outline" onClick={resetPassword} className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  Alterar senha
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
