import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Send, Clock, FileEdit } from "lucide-react";

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline"; icon: typeof Send }> = {
  sent: { variant: "default", icon: Send },
  scheduled: { variant: "secondary", icon: Clock },
  draft: { variant: "outline", icon: FileEdit },
};

export function RecentCampaigns() {
  const { t } = useI18n();

  const statusLabel: Record<string, string> = {
    sent: t("campaigns.sent"), scheduled: t("campaigns.scheduled"), draft: t("campaigns.draft"),
  };

  const { data: campaigns = [] } = useQuery({
    queryKey: ["recent-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t("dashboard.recentCampaigns")}</CardTitle>
        <CardDescription className="text-xs">Latest 5 campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No campaigns yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {campaigns.map((c) => {
              const config = statusConfig[c.status] ?? statusConfig.draft;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.sent_at ? format(new Date(c.sent_at), "MMM d, yyyy") : "—"}
                      {" · "}
                      {(c.recipients_count ?? 0).toLocaleString()} recipients
                    </p>
                  </div>
                  <Badge variant={config.variant} className="ml-3 shrink-0 capitalize">
                    {statusLabel[c.status] ?? c.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
