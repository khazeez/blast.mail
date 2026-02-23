import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SenderConfigCardProps {
  userId: string | undefined;
  senderName: string;
  setSenderName: (v: string) => void;
  senderEmail: string;
  setSenderEmail: (v: string) => void;
  replyTo: string;
  setReplyTo: (v: string) => void;
}

export function SenderConfigCard({
  userId,
  senderName,
  setSenderName,
  senderEmail,
  setSenderEmail,
  replyTo,
  setReplyTo,
}: SenderConfigCardProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ sender_name: senderName, sender_email: senderEmail, reply_to_email: replyTo })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("settings.updateSender") + " ✓");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium">{t("settings.senderConfig")}</CardTitle>
        </div>
        <CardDescription>{t("settings.senderDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sender-name">{t("settings.senderName")}</Label>
            <Input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-email">{t("settings.senderEmail")}</Label>
            <Input id="sender-email" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="reply-to">{t("settings.replyTo")}</Label>
          <Input id="reply-to" type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {t("settings.updateSender")}
        </Button>
      </CardContent>
    </Card>
  );
}
