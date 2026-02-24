import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailBuilder } from "@/components/email-builder";
import { RichTextEditor } from "@/components/campaigns/RichTextEditor";
import { TemplateBrowser } from "@/components/campaigns/TemplateBrowser";
import { MousePointer2, Code, FileText } from "lucide-react";
import type { CampaignData } from "@/pages/CampaignCreate";

interface StepContentProps {
  data: CampaignData;
  onChange: (partial: Partial<CampaignData>) => void;
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  description: string | null;
}

export function StepContent({ data, onChange }: StepContentProps) {
  const handleSelectTemplate = (template: Template | null) => {
    if (template === null) {
      onChange({ template: "", content: "" });
    } else {
      onChange({
        template: template.id,
        content: template.content || "",
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
          <CardTitle className="text-base font-medium">Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <TemplateBrowser
              selectedTemplateId={data.template || null}
              onSelect={handleSelectTemplate}
            />
            {data.template && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Template selected</span>
              </div>
            )}
          </div>
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
