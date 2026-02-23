import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  BarChart3,
  Settings,
  Mail,
  Plug,
  BookOpen,
  User,
  MailCheck,
  Globe,
  ChevronDown,
  CreditCard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useI18n } from "@/hooks/use-i18n";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSubscription } from "@/hooks/use-subscription";

const mainNav = [
  { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "nav.campaigns", url: "/campaigns", icon: Send },
  { titleKey: "nav.contacts", url: "/contacts", icon: Users },
  { titleKey: "nav.templates", url: "/templates", icon: FileText },
];

const secondaryNav = [
  { titleKey: "nav.integrations", url: "/integrations", icon: Plug },
  { titleKey: "nav.analytics", url: "/analytics", icon: BarChart3 },
  { titleKey: "nav.tutorial", url: "/tutorial", icon: BookOpen },
  { titleKey: "nav.billing", url: "/billing", icon: CreditCard },
];

const settingsSubNav = [
  { title: "Profile", url: "/settings/profile", icon: User },
  { title: "Sender Config", url: "/settings/sender", icon: MailCheck },
  { title: "Custom Domain", url: "/settings/domain", icon: Globe },
];

export function AppSidebar() {
  const { t } = useI18n();
  const location = useLocation();
  const { planName, isFree, maxContacts, maxMessages } = useSubscription();
  const isSettingsActive = location.pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  const renderItems = (items: typeof mainNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.titleKey}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            <span>{t(item.titleKey)}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Mail className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-foreground">
              MailBlast
            </span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Email Platform
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-1">
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{renderItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-3 w-auto" />

        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderItems(secondaryNav)}

              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isSettingsActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground"}`}>
                      <Settings className="h-4 w-4" />
                      <span>{t("nav.settings")}</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {settingsSubNav.map((sub) => (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={location.pathname === sub.url}>
                            <NavLink
                              to={sub.url}
                              className="flex items-center gap-2 text-sm text-sidebar-foreground transition-colors hover:text-sidebar-accent-foreground"
                              activeClassName="text-sidebar-accent-foreground font-medium"
                            >
                              <sub.icon className="h-3.5 w-3.5" />
                              <span>{sub.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-5 py-4">
        <NavLink to="/billing" className="block rounded-lg border border-border/40 bg-muted/30 p-3 transition-colors hover:bg-muted/50" activeClassName="border-primary/30 bg-primary/5">
          <p className="text-xs font-medium text-foreground">{planName}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {maxMessages ? `${maxMessages.toLocaleString("id-ID")} pesan/bulan` : "Pesan unlimited"} · {maxContacts.toLocaleString("id-ID")} kontak
          </p>
          {isFree && <p className="mt-1 text-[10px] font-medium text-primary">Upgrade →</p>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
