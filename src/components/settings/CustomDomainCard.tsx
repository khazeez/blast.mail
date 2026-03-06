import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Globe, CheckCircle2, AlertCircle, Loader2, Trash2, Copy } from "lucide-react";
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
  const [localDkimTokens, setLocalDkimTokens] = useState<string[]>([]);
  const [localDomain, setLocalDomain] = useState<string | null>(null);

  const parsedTokens = (() => {
    try {
      const parsed = JSON.parse(verificationToken ?? "{}");
      return (parsed.dkimTokens || []) as string[];
    } catch {
      return [];
    }
  })();

  const displayDomain = localDomain || customDomain;
  const displayTokens = localDkimTokens.length > 0 ? localDkimTokens : parsedTokens;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard!");
  };

  const copyAllRecords = () => {
    if (!displayDomain) return;
    const records = displayTokens.map((token) =>
      `${token}._domainkey.${displayDomain} → ${token}.dkim.amazonses.com (CNAME)`
    ).join("\n");
    navigator.clipboard.writeText(records);
    toast.success("Semua records disalin ke clipboard!");
  };

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
      setLocalDkimTokens(data.dkimTokens || []);
      setLocalDomain(data.domain);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDomainInput("");
      toast.success(`Domain ${data.domain} berhasil ditambahkan!`);
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
      setLocalDkimTokens([]);
      setLocalDomain(null);
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
        {displayDomain ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{displayDomain}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {domainVerified ? (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                        <AlertCircle className="h-3 w-3" /> Pending Verification
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

            {!domainVerified && displayTokens.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">DKIM Records perlu ditambahkan</AlertTitle>
                <AlertDescription className="mt-3 space-y-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Tambahkan CNAME records berikut ke DNS domain kamu untuk verifikasi:
                  </p>
                  <div className="space-y-2">
                    {displayTokens.map((token) => (
                      <div key={token} className="rounded bg-white dark:bg-background border border-blue-200 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Name:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(`${token}._domainkey.${displayDomain}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-mono text-xs break-all">{token}._domainkey.{displayDomain}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Value:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(`${token}.dkim.amazonses.com`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-mono text-xs break-all">{token}.dkim.amazonses.com</p>
                        <span className="text-xs text-muted-foreground">Type: CNAME</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-2"
                    onClick={copyAllRecords}
                  >
                    <Copy className="h-3.5 w-3.5" /> Salin Semua Records
                  </Button>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    ⏱ Setelah menambahkan records, klik "Check Status" untuk verifikasi. Propagasi DNS bisa memakan waktu hingga 72 jam.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {domainVerified && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Domain Terverifikasi</AlertTitle>
                <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                  Email kamu akan dikirim dari domain <strong>{displayDomain}</strong>. Bisa langsung digunakan untuk mengirim campaign.
                </AlertDescription>
              </Alert>
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
