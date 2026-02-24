import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useI18n } from "@/hooks/use-i18n";

const Index = () => {
  const { t } = useI18n();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
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
