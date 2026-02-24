import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailBuilder } from "@/components/email-builder";
import { RichTextEditor } from "@/components/campaigns/RichTextEditor";
import { ArrowLeft, MousePointer2, Code, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import type { PrebuiltTemplate } from "@/components/email-builder/prebuilt-templates";

const categories = ["newsletter", "promo", "welcome", "announcement", "transactional"] as const;
type Category = typeof categories[number];

function generateHtmlFromBlocks(blocks: any[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading": {
        const { content, level, align, color } = block.props;
        return `<h${level} style="text-align: ${align}; color: ${color}; margin: 0 0 16px 0;">${content}</h${level}>`;
      }
      case "text": {
        const { content, align, color, fontSize } = block.props;
        const sizes = { small: "14px", medium: "16px", large: "18px" };
        return `<p style="text-align: ${align}; color: ${color}; font-size: ${sizes[fontSize]}; margin: 0 0 16px 0; line-height: 1.6;">${content}</p>`;
      }
      case "button": {
        const { text, link, backgroundColor, textColor, align, borderRadius } = block.props;
        return `<div style="text-align: ${align}; margin: 16px 0;"><a href="${link || "#"}" style="display: inline-block; padding: 12px 24px; background-color: ${backgroundColor}; color: ${textColor}; text-decoration: none; border-radius: ${borderRadius}px; font-weight: 500;">${text}</a></div>`;
      }
      case "divider": {
        const { style, color, thickness } = block.props;
        return `<hr style="border-style: ${style}; border-color: ${color}; border-width: ${thickness}px 0 0 0; margin: 16px 0;" />`;
      }
      case "spacer": {
        const { height } = block.props;
        return `<div style="height: ${height}px;"></div>`;
      }
      case "footer": {
        const { companyName, address, unsubscribeLink } = block.props;
        let html = `<div style="text-align: center; font-size: 14px; color: #6b7280; padding: 16px 0; border-top: 1px solid #e5e5e5;">`;
        html += `<p style="margin: 0 0 4px 0; font-weight: 500;">${companyName}</p>`;
        if (address) html += `<p style="margin: 0 0 8px 0;">${address}</p>`;
        if (unsubscribeLink) html += `<p style="margin: 8px 0 0 0;"><a href="{{unsubscribe_url}}" style="color: #3b82f6;">Unsubscribe</a></p>`;
        html += `</div>`;
        return html;
      }
      default:
        return "";
    }
  }).join("\n");
}

const TemplateCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const templateState = location.state?.template as PrebuiltTemplate | undefined;

  const [name, setName] = useState(templateState?.name || "");
  const [category, setCategory] = useState<Category>(templateState?.category || "newsletter");
  const [description, setDescription] = useState(templateState?.description || "");
  const [content, setContent] = useState(templateState ? generateHtmlFromBlocks(templateState.blocks) : "");

  useEffect(() => {
    if (templateState) {
      setName(templateState.name);
      setCategory(templateState.category);
      setDescription(templateState.description);
      setContent(generateHtmlFromBlocks(templateState.blocks));
    }
  }, [templateState]);

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
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {templateState ? "Edit Template" : t("templateCreate.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {templateState 
                ? `Based on "${templateState.name}"` 
                : t("templateCreate.subtitle")}
            </p>
          </div>
        </div>

        {templateState && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">
              Using built-in template: <strong>{templateState.name}</strong>
            </span>
          </div>
        )}

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
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant={category === c ? "default" : "outline"}
                    className="cursor-pointer capitalize px-3 py-1"
                    onClick={() => setCategory(c)}
                  >
                    {c}
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
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="builder" className="gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  Drag & Drop
                </TabsTrigger>
                <TabsTrigger value="html" className="gap-2">
                  <Code className="h-4 w-4" />
                  HTML Editor
                </TabsTrigger>
              </TabsList>
              <TabsContent value="builder">
                <EmailBuilder content={content} onChange={setContent} />
              </TabsContent>
              <TabsContent value="html">
                <RichTextEditor content={content} onChange={setContent} />
              </TabsContent>
            </Tabs>
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
