import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, Plus, Sheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface GoogleSheetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function extractSpreadsheetId(input: string): string | null {
  // Accept full URL or raw ID
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]+$/.test(input.trim())) return input.trim();
  return null;
}

export function GoogleSheetsDialog({ open, onOpenChange }: GoogleSheetsDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [emailColumn, setEmailColumn] = useState("email");
  const [nameColumn, setNameColumn] = useState("name");
  const [selectedList, setSelectedList] = useState<string>("none");
  const [showForm, setShowForm] = useState(false);

  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["google-sheets-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_sheets_integrations")
        .select("*, lists(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!user,
  });

  // Fetch lists
  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lists").select("id, name");
      if (error) throw error;
      return data;
    },
    enabled: open && !!user,
  });

  // Add integration
  const addMutation = useMutation({
    mutationFn: async () => {
      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
      if (!spreadsheetId) throw new Error("URL Spreadsheet tidak valid");
      const { error } = await supabase.from("google_sheets_integrations").insert({
        user_id: user!.id,
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName || "Sheet1",
        email_column: emailColumn || "email",
        name_column: nameColumn || "name",
        list_id: selectedList === "none" ? null : selectedList,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Integrasi Google Sheet berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["google-sheets-integrations"] });
      setSpreadsheetUrl("");
      setSheetName("Sheet1");
      setEmailColumn("email");
      setNameColumn("name");
      setSelectedList("none");
      setShowForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Sync
  const syncMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-sheet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ integration_id: integrationId }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      return json;
    },
    onSuccess: (data) => {
      toast.success(`Sinkronisasi selesai! ${data.synced} kontak baru, ${data.skipped} dilewati.`);
      queryClient.invalidateQueries({ queryKey: ["google-sheets-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: Error) => toast.error(`Gagal sinkronisasi: ${err.message}`),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("google_sheets_integrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Integrasi dihapus.");
      queryClient.invalidateQueries({ queryKey: ["google-sheets-integrations"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5 text-emerald-600" /> Google Sheets
          </DialogTitle>
          <DialogDescription>
            Sinkronkan kontak dari Google Sheets / Google Form ke daftar kontak Anda secara otomatis.
          </DialogDescription>
        </DialogHeader>

        {/* Existing integrations */}
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : integrations.length > 0 ? (
          <div className="space-y-3">
            {integrations.map((int: any) => (
              <div key={int.id} className="rounded-lg border border-border/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate max-w-[200px]">
                    {int.spreadsheet_id}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {int.sheet_name}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Kolom: {int.email_column} (email), {int.name_column} (nama)
                  {int.lists?.name && ` → List: ${int.lists.name}`}
                </div>
                {int.last_synced_at && (
                  <div className="text-xs text-muted-foreground">
                    Terakhir sync: {format(new Date(int.last_synced_at), "dd MMM yyyy HH:mm")}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={syncMutation.isPending}
                    onClick={() => syncMutation.mutate(int.id)}
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Sync Sekarang
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(int.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Belum ada integrasi Google Sheets.
          </div>
        ) : null}

        {/* Add new form */}
        {showForm ? (
          <div className="space-y-4 border-t border-border/60 pt-4">
            <div className="space-y-2">
              <Label>URL / ID Spreadsheet</Label>
              <Input
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pastikan Spreadsheet sudah di-share ke Service Account email platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nama Sheet</Label>
                <Input value={sheetName} onChange={(e) => setSheetName(e.target.value)} placeholder="Sheet1" />
              </div>
              <div className="space-y-2">
                <Label>Kolom Email</Label>
                <Input value={emailColumn} onChange={(e) => setEmailColumn(e.target.value)} placeholder="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kolom Nama</Label>
                <Input value={nameColumn} onChange={(e) => setNameColumn(e.target.value)} placeholder="name" />
              </div>
              <div className="space-y-2">
                <Label>Masukkan ke List</Label>
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih list (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa List</SelectItem>
                    {lists.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
              <Button
                size="sm"
                onClick={() => addMutation.mutate()}
                disabled={!spreadsheetUrl || addMutation.isPending}
              >
                {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Simpan
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Tambah Spreadsheet
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
