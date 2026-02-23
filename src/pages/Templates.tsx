import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { EmailPreviewDialog } from "@/components/EmailPreviewDialog";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categoryColor: Record<string, "default" | "secondary" | "outline"> = {
  newsletter: "default", promo: "secondary", welcome: "outline", announcement: "outline",
};

const Templates = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("templates.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("templates.subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/templates/new")}>
            <Plus className="h-4 w-4" />
            {t("templates.create")}
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No templates yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border-border/60 flex flex-col">
                <CardContent className="flex-1 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{tpl.name}</h3>
                    <Badge variant={categoryColor[tpl.category] ?? "outline"} className="capitalize">
                      {tpl.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tpl.description || "No description."}
                  </p>
                </CardContent>
                <CardFooter className="border-t px-5 py-3 flex justify-between">
                  <EmailPreviewDialog
                    subject={tpl.name}
                    content={tpl.content}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(tpl.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Templates;
