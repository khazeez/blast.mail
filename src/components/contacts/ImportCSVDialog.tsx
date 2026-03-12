import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Download, X } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import * as XLSX from "xlsx";

interface ListOption {
  id: string;
  name: string;
}

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: ListOption[];
}

interface ParsedRow {
  email: string;
  name: string;
  tags: string[];
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    return parts;
  });
  return { headers, rows };
}

function parseExcel(buffer: ArrayBuffer): { headers: string[]; rows: string[][] } {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  if (data.length === 0) return { headers: [], rows: [] };
  const headers = (data[0] as string[]).map((h) => String(h ?? "").trim().toLowerCase());
  const rows = data.slice(1).map((r) => (r as string[]).map((c) => String(c ?? "").trim()));
  return { headers, rows };
}

function findColumnIndex(headers: string[], possibilities: string[]): number {
  for (const p of possibilities) {
    const idx = headers.findIndex((h) => h === p || h.includes(p));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function ImportCSVDialog({ open, onOpenChange, lists }: ImportCSVDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [listId, setListId] = useState("");
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const processData = (headers: string[], rows: string[][]) => {
    const emailIdx = findColumnIndex(headers, ["email", "e-mail", "email address"]);
    const nameIdx = findColumnIndex(headers, ["name", "nama", "full name", "fullname"]);
    const tagsIdx = findColumnIndex(headers, ["tags", "tag", "label"]);

    if (emailIdx === -1) {
      toast.error("Kolom 'email' tidak ditemukan. Pastikan header memiliki kolom 'email'.");
      return null;
    }

    const seen = new Set<string>();
    let dupes = 0;
    let invalid = 0;
    const parsed: ParsedRow[] = [];

    for (const row of rows) {
      const email = (row[emailIdx] ?? "").trim().toLowerCase().replace(/^["']|["']$/g, "");
      if (!email) continue;

      if (!emailRegex.test(email)) { invalid++; continue; }
      if (seen.has(email)) { dupes++; continue; }
      seen.add(email);

      const name = nameIdx !== -1 ? (row[nameIdx] ?? "").trim().replace(/^["']|["']$/g, "") : "";
      const tags = tagsIdx !== -1
        ? (row[tagsIdx] ?? "").split(";").map((t) => t.trim()).filter(Boolean)
        : [];
      parsed.push({ email, name, tags });
    }

    return { parsed, dupes, invalid };
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      toast.error("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      let headers: string[];
      let rows: string[][];

      if (ext === "csv") {
        const text = ev.target?.result as string;
        const result = parseCSV(text);
        headers = result.headers;
        rows = result.rows;
      } else {
        const buffer = ev.target?.result as ArrayBuffer;
        const result = parseExcel(buffer);
        headers = result.headers;
        rows = result.rows;
      }

      const data = processData(headers, rows);
      if (!data) return;

      setDuplicateCount(data.dupes);
      setInvalidCount(data.invalid);
      setParsedData(data.parsed);
      setFile(selected);
      setStep("preview");
    };

    if (ext === "csv") {
      reader.readAsText(selected);
    } else {
      reader.readAsArrayBuffer(selected);
    }
  }, []);

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (parsedData.length === 0) throw new Error("Tidak ada data untuk diimport");

      const chunkSize = 500;
      let imported = 0;

      for (let i = 0; i < parsedData.length; i += chunkSize) {
        const chunk = parsedData.slice(i, i + chunkSize).map((row) => ({
          user_id: user.id,
          email: row.email,
          name: row.name || null,
          list_id: listId || null,
          tags: row.tags.length > 0 ? row.tags : [],
          status: "subscribed",
        }));

        const { error, data } = await supabase
          .from("contacts")
          .upsert(chunk, { onConflict: "user_id,email", ignoreDuplicates: true })
          .select("id");

        if (error) throw error;
        imported += data?.length ?? 0;
      }

      return { imported, skipped: parsedData.length - imported };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(`${result.imported} kontak berhasil diimport!`);
      if (result.skipped > 0) {
        toast.info(`${result.skipped} kontak dilewati (duplikat di database)`);
      }
      setStep("done");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const fakeEvent = { target: { files: [dropped] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setListId("");
    setDuplicateCount(0);
    setInvalidCount(0);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const downloadTemplateCSV = () => {
    const rows = [
      ["name", "email", "tags"],
      ["John Doe", "john@example.com", "vip;newsletter"],
      ["Jane Smith", "jane@example.com", "customer"],
      ["Ahmad Rizki", "ahmad@company.co.id", "premium;newsletter"],
      ["Siti Nurhaliza", "siti@brand.com", "vip"],
      ["Budi Santoso", "budi@startup.io", ""],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplateExcel = () => {
    const data = [
      ["name", "email", "tags"],
      ["John Doe", "john@example.com", "vip;newsletter"],
      ["Jane Smith", "jane@example.com", "customer"],
      ["Ahmad Rizki", "ahmad@company.co.id", "premium;newsletter"],
      ["Siti Nurhaliza", "siti@brand.com", "vip"],
      ["Budi Santoso", "budi@startup.io", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Column widths
    ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 25 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "contacts_template.xlsx");
  };

  const fileIcon = file?.name.endsWith(".csv") ? FileText : FileSpreadsheet;
  const FileIcon = fileIcon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            Upload file CSV atau Excel (.xlsx) dengan kolom email (wajib), name, dan tags
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1">
          {step === "upload" && (
            <>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Drag & drop file di sini</p>
                <p className="text-xs text-muted-foreground mt-1">CSV atau Excel (.xlsx, .xls)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplateCSV}>
                  <FileText className="h-4 w-4" />
                  Template CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplateExcel}>
                  <FileSpreadsheet className="h-4 w-4" />
                  Template Excel
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Format yang didukung:</strong></p>
                  <p>• File CSV (.csv) atau Excel (.xlsx, .xls)</p>
                  <p>• Kolom <code className="bg-muted px-1 rounded">email</code> (wajib)</p>
                  <p>• Kolom <code className="bg-muted px-1 rounded">name</code> dan <code className="bg-muted px-1 rounded">tags</code> (opsional)</p>
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === "preview" && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                <FileIcon className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">{parsedData.length} kontak valid</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" /> {parsedData.length} valid
                </Badge>
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-200">
                    <AlertTriangle className="h-3 w-3" /> {duplicateCount} duplikat
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-red-600 border-red-200">
                    <AlertTriangle className="h-3 w-3" /> {invalidCount} invalid
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Masukkan ke List (opsional)</Label>
                <Select value={listId} onValueChange={setListId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih list..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b-2 border-border">
                      <th className="px-3 py-2 text-left font-semibold text-xs w-8">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Email</th>
                      <th className="px-3 py-2 text-left font-semibold text-xs">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium truncate max-w-[120px]">{row.name || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground truncate max-w-[180px]">{row.email}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {row.tags.slice(0, 2).map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                            ))}
                            {row.tags.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{row.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t">
                    ...dan {parsedData.length - 5} kontak lainnya
                  </div>
                )}
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Import Berhasil!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Kontak berhasil ditambahkan ke database
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleClose(false)}>Batal</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Ganti File</Button>
              <Button
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending || parsedData.length === 0}
                className="gap-2"
              >
                {importMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Import {parsedData.length} Kontak</>
                )}
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={() => handleClose(false)}>Selesai</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
