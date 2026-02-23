import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Eye } from "lucide-react";
import { EmailPreviewDialog } from "@/components/EmailPreviewDialog";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  sent: "default", scheduled: "secondary", draft: "outline", sending: "secondary",
};

const Campaigns = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);

  const statusLabel: Record<string, string> = {
    sent: t("campaigns.sent"), scheduled: t("campaigns.scheduled"), draft: t("campaigns.draft"), sending: "Sending",
  };

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("campaigns").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelected([]);
      toast.success("Campaigns deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleOne = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((i) => i !== id) : [...s, id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("campaigns.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("campaigns.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => deleteMutation.mutate(selected)}>
                <Trash2 className="h-4 w-4" /> Delete ({selected.length})
              </Button>
            )}
            <Button className="gap-2" onClick={() => navigate("/campaigns/new")}>
              <Plus className="h-4 w-4" />
              {t("campaigns.new")}
            </Button>
          </div>
        </div>
        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No campaigns yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 pl-4">
                      <Checkbox
                        checked={selected.length === campaigns.length && campaigns.length > 0}
                        onCheckedChange={() =>
                          setSelected(selected.length === campaigns.length ? [] : campaigns.map((c) => c.id))
                        }
                      />
                    </TableHead>
                    <TableHead>{t("campaigns.campaign")}</TableHead>
                    <TableHead>{t("campaigns.status")}</TableHead>
                     <TableHead className="text-right">{t("campaigns.recipients")}</TableHead>
                     <TableHead className="text-right">{t("campaigns.date")}</TableHead>
                     <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4">
                        <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleOne(c.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[c.status] ?? "outline"} className="capitalize">
                          {statusLabel[c.status] ?? c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{(c.recipients_count ?? 0).toLocaleString()}</TableCell>
                       <TableCell className="text-right text-muted-foreground">
                         {c.sent_at ? format(new Date(c.sent_at), "MMM d, yyyy") : c.scheduled_at ? format(new Date(c.scheduled_at), "MMM d, yyyy") : "—"}
                       </TableCell>
                       <TableCell>
                         <EmailPreviewDialog
                           subject={c.subject ?? undefined}
                           content={c.content}
                         />
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
