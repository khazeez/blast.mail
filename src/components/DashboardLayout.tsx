import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { t } = useI18n();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <Separator orientation="vertical" className="mx-1 h-5" />
              <Button variant="ghost" size="icon" onClick={signOut} title={t("auth.signOut")}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
