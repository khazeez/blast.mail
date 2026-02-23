import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/campaigns/RichTextEditor";
import type { CampaignData } from "@/pages/CampaignCreate";

interface StepContentProps {
  data: CampaignData;
  onChange: (partial: Partial<CampaignData>) => void;
}

const templates = [
  { id: "blank", label: "Blank" },
  { id: "newsletter", label: "Newsletter" },
  { id: "promo", label: "Promotion" },
  { id: "welcome", label: "Welcome" },
  { id: "announcement", label: "Announcement" },
];

export function StepContent({ data, onChange }: StepContentProps) {
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
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <Badge
                key={t.id}
                variant={data.template === t.id ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => onChange({ template: t.id })}
              >
                {t.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Email Body</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={data.content}
            onChange={(html) => onChange({ content: html })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
