import { Users, Send, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StatsCards() {
  const { t } = useI18n();

  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [contactsRes, campaignsRes] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "sent"),
      ]);
      return {
        totalContacts: contactsRes.count ?? 0,
        campaignsSent: campaignsRes.count ?? 0,
      };
    },
  });

  const stats = [
    {
      label: t("dashboard.totalSubscribers"),
      value: (data?.totalContacts ?? 0).toLocaleString(),
      icon: Users,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: t("dashboard.campaignsSent"),
      value: (data?.campaignsSent ?? 0).toLocaleString(),
      icon: Send,
      accent: "bg-success/10 text-success",
    },
    {
      label: t("dashboard.avgOpenRate"),
      value: "—",
      icon: Eye,
      accent: "bg-warning/10 text-warning",
    },
    {
      label: t("dashboard.avgClickRate"),
      value: "—",
      icon: MousePointerClick,
      accent: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group relative overflow-hidden border-border/40 transition-shadow hover:shadow-md"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
