import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailBuilder } from "@/components/email-builder";
import { RichTextEditor } from "@/components/campaigns/RichTextEditor";
import { MousePointer2, Code, FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { CampaignData } from "@/pages/CampaignCreate";
import { cn } from "@/lib/utils";

interface StepContentProps {
  data: CampaignData;
  onChange: (partial: Partial<CampaignData>) => void;
}

export function StepContent({ data, onChange }: StepContentProps) {
  const { user } = useAuth();

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("templates")
        .select("id, name, category, content, description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSelectTemplate = (templateId: string | null) => {
    if (templateId === null) {
      onChange({ template: "", content: "" });
      return;
    }

    const selectedTemplate = templates?.find((t) => t.id === templateId);
    if (selectedTemplate) {
      onChange({ 
        template: templateId, 
        content: selectedTemplate.content || "" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Email Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="e.g. Don't miss our latest updates!"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {data.subject.length}/80 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-text">Preview Text</Label>
            <Input
              id="preview-text"
              placeholder="Shown next to the subject in the inbox..."
              value={data.previewText}
              onChange={(e) => onChange({ previewText: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Select Template</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-4">
              <button
                onClick={() => handleSelectTemplate(null)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed transition-all h-[100px]",
                  !data.template
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 hover:border-muted-foreground/50 text-muted-foreground"
                )}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">Blank</span>
              </button>

              {templates?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-lg border transition-all h-[100px]",
                    data.template === template.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={cn(
                      "h-4 w-4",
                      data.template === template.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium truncate",
                      data.template === template.id && "text-primary"
                    )}>
                      {template.name}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                      {template.description}
                    </p>
                  )}
                  {template.category && (
                    <Badge variant="secondary" className="mt-auto text-[10px] capitalize">
                      {template.category}
                    </Badge>
                  )}
                </button>
              ))}

              {templates && templates.length === 0 && (
                <div className="col-span-2 flex items-center justify-center h-[100px] text-muted-foreground text-sm">
                  No templates yet. Create one in Templates page.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Email Body</CardTitle>
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
              <EmailBuilder
                key={data.template}
                content={data.content}
                onChange={(html) => onChange({ content: html })}
              />
            </TabsContent>
            <TabsContent value="html">
              <RichTextEditor
                key={data.template}
                content={data.content}
                onChange={(html) => onChange({ content: html })}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
