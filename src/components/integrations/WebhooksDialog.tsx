import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2, Trash2, Plus, Webhook, Copy, Check, Eye, EyeOff,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface WebhooksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALL_EVENTS = [
  { value: "contact.created", label: "Kontak Dibuat" },
  { value: "contact.updated", label: "Kontak Diupdate" },
  { value: "contact.deleted", label: "Kontak Dihapus" },
  { value: "contact.unsubscribed", label: "Kontak Unsubscribe" },
  { value: "campaign.created", label: "Campaign Dibuat" },
  { value: "campaign.sent", label: "Campaign Terkirim" },
  { value: "campaign.opened", label: "Email Dibuka" },
  { value: "campaign.clicked", label: "Link Diklik" },
  { value: "list.created", label: "List Dibuat" },
  { value: "list.deleted", label: "List Dihapus" },
];

export function WebhooksDialog({ open, onOpenChange }: WebhooksDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [selectedWebhookLogs, setSelectedWebhookLogs] = useState<string | null>(null);

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!user,
  });

  // Fetch logs for selected webhook
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["webhook-logs", selectedWebhookLogs],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_id", selectedWebhookLogs!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedWebhookLogs,
  });

  // Add webhook
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!url.startsWith("http")) throw new Error("URL harus diawali http:// atau https://");
      if (selectedEvents.length === 0) throw new Error("Pilih minimal 1 event");
      const { error } = await supabase.from("webhooks").insert({
        user_id: user!.id,
        url,
        events: selectedEvents,
        description: description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Webhook berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete webhook
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Webhook dihapus.");
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Toggle active
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("webhooks").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks"] }),
  });

  const resetForm = () => {
    setUrl("");
    setDescription("");
    setSelectedEvents([]);
    setShowForm(false);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const copySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" /> Webhooks
          </DialogTitle>
          <DialogDescription>
            Kirim notifikasi real-time ke URL Anda saat event terjadi di MailBlast.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="endpoints" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="endpoints" className="flex-1">Endpoints</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">Delivery Logs</TabsTrigger>
          </TabsList>

          {/* ENDPOINTS TAB */}
          <TabsContent value="endpoints" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : webhooks.length > 0 ? (
              <div className="space-y-3">
                {webhooks.map((wh: any) => (
                  <div key={wh.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${wh.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                        <span className="text-sm font-medium truncate max-w-[300px]">{wh.url}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => toggleMutation.mutate({ id: wh.id, active: !wh.active })}
                        >
                          {wh.active ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(wh.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {wh.description && (
                      <p className="text-xs text-muted-foreground">{wh.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {(wh.events || []).map((ev: string) => (
                        <Badge key={ev} variant="secondary" className="text-[10px]">{ev}</Badge>
                      ))}
                    </div>

                    {/* Secret */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Secret:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">
                        {visibleSecrets[wh.id] ? wh.secret : "••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setVisibleSecrets((p) => ({ ...p, [wh.id]: !p[wh.id] }))}
                      >
                        {visibleSecrets[wh.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copySecret(wh.secret, wh.id)}
                      >
                        {copiedId === wh.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => setSelectedWebhookLogs(wh.id)}
                    >
                      <Clock className="h-3.5 w-3.5" /> Lihat Logs
                    </Button>
                  </div>
                ))}
              </div>
            ) : !showForm ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Belum ada webhook endpoint.
              </div>
            ) : null}

            {/* Add form */}
            {showForm ? (
              <div className="space-y-4 border-t border-border/60 pt-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-server.com/webhook"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi (opsional)</Label>
                  <Input
                    placeholder="Contoh: Sync ke CRM internal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_EVENTS.map((ev) => (
                      <label
                        key={ev.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedEvents.includes(ev.value)}
                          onCheckedChange={() => toggleEvent(ev.value)}
                        />
                        {ev.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={resetForm}>Batal</Button>
                  <Button
                    size="sm"
                    onClick={() => addMutation.mutate()}
                    disabled={!url || addMutation.isPending}
                  >
                    {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Simpan
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Tambah Webhook
              </Button>
            )}

            {/* Signature verification guide */}
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2">
              <h4 className="text-sm font-semibold">Cara Verifikasi Signature</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setiap request webhook memiliki header <code className="bg-muted px-1 rounded">X-Webhook-Signature</code> berisi
                HMAC-SHA256 dari body menggunakan secret Anda. Validasi di server Anda:
              </p>
              <pre className="text-[11px] bg-muted p-2 rounded overflow-x-auto">
{`const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const expected = crypto
  .createHmac('sha256', YOUR_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
if (signature !== expected) {
  return res.status(401).send('Invalid signature');
}`}
              </pre>
            </div>
          </TabsContent>

          {/* LOGS TAB */}
          <TabsContent value="logs" className="mt-4">
            {!selectedWebhookLogs ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Pilih webhook dari tab Endpoints → "Lihat Logs" untuk melihat delivery logs.
              </div>
            ) : logsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Belum ada log pengiriman untuk webhook ini.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan 20 log terbaru
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedWebhookLogs(null)}
                  >
                    Kembali
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">Status</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>HTTP</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{log.event}</TableCell>
                        <TableCell className="text-xs">{log.response_status || "—"}</TableCell>
                        <TableCell className="text-xs">{log.attempt}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd MMM HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
