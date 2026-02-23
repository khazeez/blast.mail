import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useI18n } from "@/hooks/use-i18n";
import { TrendingUp } from "lucide-react";

const data = [
  { date: "Jan 1", opens: 420, clicks: 62 },
  { date: "Jan 5", opens: 380, clicks: 55 },
  { date: "Jan 9", opens: 510, clicks: 78 },
  { date: "Jan 13", opens: 460, clicks: 70 },
  { date: "Jan 17", opens: 530, clicks: 85 },
  { date: "Jan 21", opens: 490, clicks: 72 },
  { date: "Jan 25", opens: 620, clicks: 98 },
  { date: "Jan 29", opens: 580, clicks: 90 },
];

const chartConfig = {
  opens: { label: "Opens", color: "hsl(var(--primary))" },
  clicks: { label: "Clicks", color: "hsl(var(--success))" },
};

export function PerformanceChart() {
  const { t } = useI18n();

  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{t("dashboard.emailPerformance")}</CardTitle>
            <CardDescription className="text-xs">Last 30 days</CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="fillOpens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} className="fill-muted-foreground" />
            <YAxis tickLine={false} axisLine={false} fontSize={11} className="fill-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="opens" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#fillOpens)" />
            <Area type="monotone" dataKey="clicks" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#fillClicks)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
