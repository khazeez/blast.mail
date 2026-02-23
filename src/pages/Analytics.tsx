import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const barConfig = {
  sent: { label: "Sent", color: "hsl(var(--primary))" },
  opened: { label: "Opened", color: "hsl(var(--success))" },
  clicked: { label: "Clicked", color: "hsl(var(--warning))" },
};

const Analytics = () => {
  const { t } = useI18n();

  const { data: analyticsData = [] } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      // Fetch campaign analytics grouped by event type
      const { data, error } = await supabase
        .from("campaign_analytics")
        .select("event_type, created_at");
      if (error) throw error;

      // Group by month
      const months: Record<string, { sent: number; opened: number; clicked: number }> = {};
      (data ?? []).forEach((row) => {
        const date = new Date(row.created_at);
        const key = date.toLocaleString("en", { month: "short", year: "2-digit" });
        if (!months[key]) months[key] = { sent: 0, opened: 0, clicked: 0 };
        if (row.event_type === "sent" || row.event_type === "delivered") months[key].sent++;
        if (row.event_type === "opened") months[key].opened++;
        if (row.event_type === "clicked") months[key].clicked++;
      });

      return Object.entries(months).map(([month, counts]) => ({ month, ...counts }));
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("analytics.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("analytics.subtitle")}</p>
        </div>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{t("analytics.overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No analytics data yet.</p>
            ) : (
              <ChartContainer config={barConfig} className="h-[320px] w-full">
                <BarChart data={analyticsData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opened" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicked" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
