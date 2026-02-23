import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const { t } = useI18n();
  const { user } = useAuth();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with greeting */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Two-column layout for chart + recent */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-2">
            <RecentCampaigns />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
