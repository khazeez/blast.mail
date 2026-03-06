import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DEFAULT_DOMAIN = "send.mailblast.id";
const DEFAULT_SENDER_EMAIL = `noreply@${DEFAULT_DOMAIN}`;

interface SenderConfigCardProps {
  userId: string | undefined;
  senderName: string;
  setSenderName: (v: string) => void;
  senderEmail: string;
  setSenderEmail: (v: string) => void;
  replyTo: string;
  setReplyTo: (v: string) => void;
  useDefaultDomain: boolean;
  setUseDefaultDomain: (v: boolean) => void;
  customDomain: string | null;
  domainVerified: boolean;
}

export function SenderConfigCard({
  userId,
  senderName,
  setSenderName,
  senderEmail,
  setSenderEmail,
  replyTo,
  setReplyTo,
  useDefaultDomain,
  setUseDefaultDomain,
  customDomain,
  domainVerified,
}: SenderConfigCardProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      if (!useDefaultDomain && !domainVerified) {
        throw new Error("Custom domain belum terverifikasi. Silakan verifikasi domain Anda terlebih dahulu.");
      }

      const updateData: Record<string, unknown> = {
        sender_name: senderName,
        reply_to_email: replyTo,
        use_default_domain: useDefaultDomain,
      };

      if (useDefaultDomain) {
        updateData.sender_email = DEFAULT_SENDER_EMAIL;
      } else {
        updateData.sender_email = senderEmail;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Pengaturan pengirim berhasil disimpan ✓");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDomainChange = (value: string) => {
    const isDefault = value === "default";
    setUseDefaultDomain(isDefault);
    if (isDefault) {
      setSenderEmail(DEFAULT_SENDER_EMAIL);
    }
  };

  const canUseCustomDomain = customDomain && domainVerified;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium">{t("settings.senderConfig")}</CardTitle>
        </div>
        <CardDescription>{t("settings.senderDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sender-name">{t("settings.senderName")}</Label>
          <Input
            id="sender-name"
            placeholder="Nama brand atau perusahaan Anda"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Nama yang muncul di inbox penerima email
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Pilih Domain Pengirim</Label>
          <RadioGroup
            value={useDefaultDomain ? "default" : "custom"}
            onValueChange={handleDomainChange}
            className="space-y-3"
          >
            <div className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${useDefaultDomain ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"}`}>
              <RadioGroupItem value="default" id="default" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="default" className="cursor-pointer font-medium">
                    Domain MailBlast
                  </Label>
                  <Badge variant="secondary" className="text-xs">Direkomendasikan</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Email dikirim dari <span className="font-mono text-foreground">{DEFAULT_SENDER_EMAIL}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ✅ Langsung bisa kirim • ✅ Tidak perlu setup DNS
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${!useDefaultDomain ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"} ${!canUseCustomDomain ? "opacity-60" : ""}`}>
              <RadioGroupItem value="custom" id="custom" className="mt-0.5" disabled={!canUseCustomDomain} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom" className={`cursor-pointer font-medium ${!canUseCustomDomain ? "cursor-not-allowed" : ""}`}>
                    Custom Domain
                  </Label>
                  {canUseCustomDomain ? (
                    <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-200">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1 text-yellow-600 border-yellow-200">
                      <AlertTriangle className="h-3 w-3" /> Belum Setup
                    </Badge>
                  )}
                </div>
                {canUseCustomDomain ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">
                      Email dikirim dari domain Anda: <span className="font-mono text-foreground">{customDomain}</span>
                    </p>
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="sender-email">Email Pengirim</Label>
                      <Input
                        id="sender-email"
                        type="email"
                        placeholder={`newsletter@${customDomain}`}
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        disabled={useDefaultDomain}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gunakan domain sendiri untuk branding profesional
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => navigate("/settings/domain")}
                    >
                      Setup Custom Domain <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="reply-to">{t("settings.replyTo")}</Label>
          <Input
            id="reply-to"
            type="email"
            placeholder="email@domainanda.com"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Email untuk menerima balasan dari penerima
          </p>
        </div>

        {!useDefaultDomain && !domainVerified && customDomain && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Domain <strong>{customDomain}</strong> belum terverifikasi.{" "}
              <Button variant="link" className="h-auto p-0 text-yellow-700 dark:text-yellow-300" onClick={() => navigate("/settings/domain")}>
                Verifikasi sekarang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Perubahan akan berlaku untuk email berikutnya
          </p>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
