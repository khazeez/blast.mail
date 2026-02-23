import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface CustomDomainCardProps {
  customDomain: string | null;
  domainVerified: boolean;
  verificationToken: string | null;
}

export function CustomDomainCard({ customDomain, domainVerified, verificationToken }: CustomDomainCardProps) {
  const queryClient = useQueryClient();
  const [domainInput, setDomainInput] = useState("");

  const dkimTokens = (() => {
    try {
      const parsed = JSON.parse(verificationToken ?? "{}");
      return (parsed.dkimTokens || []) as string[];
    } catch {
      return [];
    }
  })();

  const addDomain = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-domain", {
        body: { action: "add", domain: domainInput.trim().toLowerCase() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDomainInput("");
      toast.success(`Domain ${data.domain} ditambahkan! Tambahkan DKIM records ke DNS kamu.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkDomain = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-domain", {
        body: { action: "check" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (data.verified) {
        toast.success("Domain terverifikasi! ✓");
      } else {
        toast.info(`Domain belum terverifikasi. DKIM status: ${data.dkimStatus}`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeDomain = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-domain", {
        body: { action: "remove" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Domain dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-medium">Custom Domain</CardTitle>
        </div>
        <CardDescription>
          Hubungkan domain kamu agar email dikirim dari domain milikmu sendiri.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {customDomain ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{customDomain}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {domainVerified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => checkDomain.mutate()}
                  disabled={checkDomain.isPending}
                >
                  {checkDomain.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Status"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDomain.mutate()}
                  disabled={removeDomain.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {!domainVerified && dkimTokens.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium">DNS Records yang perlu ditambahkan:</p>
                <p className="text-xs text-muted-foreground">
                  Tambahkan CNAME records berikut ke DNS domain kamu:
                </p>
                <div className="space-y-2">
                  {dkimTokens.map((token) => (
                    <div key={token} className="rounded bg-background border border-border p-3 font-mono text-xs break-all">
                      <p><span className="text-muted-foreground">Name:</span> {token}._domainkey.{customDomain}</p>
                      <p><span className="text-muted-foreground">Value:</span> {token}.dkim.amazonses.com</p>
                      <p><span className="text-muted-foreground">Type:</span> CNAME</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Setelah menambahkan records, klik "Check Status" untuk verifikasi. Propagasi DNS bisa memakan waktu hingga 72 jam.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="custom-domain">Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-domain"
                  placeholder="mail.yourdomain.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                />
                <Button
                  onClick={() => addDomain.mutate()}
                  disabled={addDomain.isPending || !domainInput.trim()}
                >
                  {addDomain.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Domain"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan domain atau subdomain yang ingin kamu gunakan untuk mengirim email.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
