import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/campaigns/RichTextEditor";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";

const categories = ["newsletter", "promo", "welcome", "announcement"];

const TemplateCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("newsletter");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("templates").insert({
        user_id: user.id,
        name,
        category,
        description,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success(`Template "${name}" saved!`);
      navigate("/templates");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!name || !content) {
      toast.error(t("templateCreate.name") + " & content required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("templateCreate.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("templateCreate.subtitle")}</p>
          </div>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-medium">{t("templateCreate.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">{t("templateCreate.name")}</Label>
              <Input
                id="template-name"
                placeholder="e.g. Monthly Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("templateCreate.category")}</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm capitalize"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-medium">{t("templateCreate.content")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor content={content} onChange={setContent} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/templates")}>Cancel</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>{t("templateCreate.save")}</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateCreate;
