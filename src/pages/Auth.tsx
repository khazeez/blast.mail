import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      }
    } else {
      if (!fullName.trim()) {
        toast.error(t("auth.nameRequired"));
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("auth.checkEmail"));
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          MailBlast
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.tagline")}
        </p>
      </div>

      <Card className="w-full max-w-sm border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {isLogin ? t("auth.signIn") : t("auth.signUp")}
          </CardTitle>
          <CardDescription>
            {isLogin ? t("auth.signInDesc") : t("auth.signUpDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {isLogin ? t("auth.signIn") : t("auth.signUp")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
