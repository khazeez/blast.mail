import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, FileText, Eye } from "lucide-react";
import { EmailPreviewDialog } from "@/components/EmailPreviewDialog";
import type { CampaignData } from "@/pages/CampaignCreate";

const listNames: Record<string, string> = {
  main: "Main List",
  promo: "Promo List",
  vip: "VIP Customers",
  all: "All Subscribers",
};

const listCounts: Record<string, number> = {
  main: 8420,
  promo: 4200,
  vip: 1250,
  all: 12486,
};

interface StepReviewProps {
  data: CampaignData;
}

export function StepReview({ data }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Campaign Name</p>
              <p className="text-sm text-muted-foreground">{data.name || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Recipients</p>
              <p className="text-sm text-muted-foreground">
                {listNames[data.list] || "—"}{" "}
                {data.list && (
                  <span className="text-xs">
                    ({listCounts[data.list]?.toLocaleString()} contacts)
                  </span>
                )}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-muted-foreground">{data.subject || "—"}</p>
              {data.previewText && (
                <p className="text-xs text-muted-foreground italic">
                  Preview: {data.previewText}
                </p>
              )}
            </div>
          </div>
          {data.template && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-4 w-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Template</p>
                  <Badge variant="outline" className="capitalize">
                    {data.template}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Email Preview</CardTitle>
          <EmailPreviewDialog
            subject={data.subject}
            previewText={data.previewText}
            content={data.content}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" /> Full Preview
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/60 bg-background p-6">
            <p className="mb-1 text-xs text-muted-foreground">Subject: {data.subject}</p>
            <Separator className="my-3" />
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: data.content || "No content yet." }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
