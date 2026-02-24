import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import {
  Crown, Zap, Users, Send, Check, Sparkles,
  Calendar, CreditCard, Rocket, AlertTriangle,
  Shield, Headphones, Clock, ArrowRight, X,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formatNumber = (n: number) => n.toLocaleString("id-ID");
const formatCurrency = (n: number) => `Rp ${formatNumber(n)}`;

const billingPeriods = [
  { months: 1, label: "Bulanan", discount: 0 },
  { months: 12, label: "Tahunan", discount: 25, popular: true },
];

const allFeatures = [
  { name: "Kontak", icon: Users },
  { name: "Pesan Unlimited", icon: Send },
  { name: "Email Templates", icon: Sparkles },
  { name: "Analytics", icon: Crown },
  { name: "Custom Domain", icon: Shield },
  { name: "Priority Support", icon: Headphones },
];

const Billing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("max_contacts", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: usage } = useQuery({
    queryKey: ["usage-counts"],
    queryFn: async () => {
      if (!user) return { contacts: 0, campaigns: 0 };
      const [contactsRes, campaignsRes] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "sent"),
      ]);
      return {
        contacts: contactsRes.count ?? 0,
        campaigns: campaignsRes.count ?? 0,
      };
    },
    enabled: !!user,
  });

  const proPlans = plans?.filter((p: any) => !p.is_free) ?? [];
  const selectedPeriod = isYearly ? billingPeriods[1] : billingPeriods[0];

  const currentPlan = subscription?.plans as any;
  const maxContacts = currentPlan?.max_contacts ?? 100;
  const maxMessages = currentPlan?.max_messages;
  const contactUsage = usage?.contacts ?? 0;
  const contactPercent = Math.min((contactUsage / maxContacts) * 100, 100);
  const isFree = currentPlan?.is_free ?? true;

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Missing user");
      const selectedPlan = proPlans.find((p: any) => p.id === planId);
      if (!selectedPlan) throw new Error("Plan not found");

      const months = selectedPeriod.months;
      const basePrice = selectedPlan.price_monthly;
      const discount = selectedPeriod.discount;
      const monthlyPrice = Math.round(basePrice * (1 - discount / 100));
      const totalPrice = monthlyPrice * months;

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      if (subscription) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("id", subscription.id);
      }

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        status: "active",
        duration_months: months,
        discount_percent: discount,
        price_per_month: monthlyPrice,
        total_price: totalPrice,
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plan berhasil diupgrade!");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setShowUpgrade(false);
    },
    onError: () => toast.error("Gagal mengupgrade plan."),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">Kelola plan dan pantau penggunaan Anda</p>
          </div>
          {!isFree && subscription && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
              <Crown className="h-4 w-4 text-primary" />
              {currentPlan?.name}
            </Badge>
          )}
        </div>

        {/* Current Plan Card */}
        <Card className={cn(
          "overflow-hidden",
          !isFree && "border-primary/30"
        )}>
          <div className={cn(
            "h-1",
            isFree ? "bg-muted" : "bg-gradient-to-r from-primary to-primary/60"
          )} />
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl",
                  isFree ? "bg-muted" : "bg-primary/10"
                )}>
                  {isFree ? (
                    <Users className="h-7 w-7 text-muted-foreground" />
                  ) : (
                    <Crown className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{currentPlan?.name ?? "Free Plan"}</CardTitle>
                  <CardDescription>
                    {isFree ? "Upgrade untuk fitur lebih lengkap" : "Plan aktif Anda"}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {isFree ? "Gratis" : formatCurrency(subscription?.price_per_month ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!isFree && subscription && (
                    `hingga ${format(new Date(subscription.expires_at), "dd MMM yyyy", { locale: idLocale })}`
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Kontak</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatNumber(contactUsage)} / {formatNumber(maxContacts)}
                  </span>
                </div>
                <Progress value={contactPercent} className="h-2" />
                {contactPercent >= 80 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {contactPercent >= 100 ? "Batas kontak tercapai" : "Mendekati batas kontak"}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span>Pesan terkirim</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {maxMessages ? `${formatNumber(usage?.campaigns ?? 0)} / ${formatNumber(maxMessages)}` : "Unlimited"}
                  </span>
                </div>
                {maxMessages ? (
                  <Progress value={Math.min(((usage?.campaigns ?? 0) / maxMessages) * 100, 100)} className="h-2" />
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <Zap className="h-3 w-3" />
                    Tanpa batas pengiriman
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Plan Features */}
            <div>
              <p className="text-sm font-medium mb-3">Fitur yang Anda dapatkan:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  const included = !isFree || i < 2;
                  return (
                    <div
                      key={feature.name}
                      className={cn(
                        "flex items-center gap-2 text-sm px-3 py-2 rounded-lg",
                        included ? "bg-primary/5 text-foreground" : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{feature.name}</span>
                      {included && <Check className="h-3 w-3 text-primary ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => setShowUpgrade(true)}
            >
              {isFree ? (
                <>
                  <Rocket className="h-4 w-4" />
                  Upgrade ke Pro
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Ubah Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        {showUpgrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Pilih Plan</CardTitle>
                  <CardDescription>Pilih plan yang sesuai dengan kebutuhan Anda</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowUpgrade(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-muted/30">
                  <span className={cn("text-sm", !isYearly && "font-medium")}>Bulanan</span>
                  <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                  <span className={cn("text-sm", isYearly && "font-medium")}>Tahunan</span>
                  <Badge variant="secondary" className="ml-2">Hemat 25%</Badge>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proPlans.map((plan: any) => {
                    const isSelected = currentPlan?.id === plan.id;
                    const monthlyPrice = isYearly 
                      ? Math.round(plan.price_monthly * 0.75) 
                      : plan.price_monthly;
                    const totalPrice = monthlyPrice * (isYearly ? 12 : 1);
                    const savings = isYearly ? plan.price_monthly * 12 - totalPrice : 0;

                    return (
                      <Card
                        key={plan.id}
                        className={cn(
                          "relative cursor-pointer transition-all hover:border-primary/50",
                          isSelected && "border-primary ring-1 ring-primary"
                        )}
                        onClick={() => {
                          if (!isSelected) {
                            upgradeMutation.mutate(plan.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary">Plan Saat Ini</Badge>
                          </div>
                        )}
                        <CardContent className="pt-6 pb-4 space-y-4">
                          <div className="text-center">
                            <p className="font-semibold text-lg">{plan.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {formatNumber(plan.max_contacts)} kontak
                            </p>
                          </div>

                          <div className="text-center py-2">
                            <p className="text-3xl font-bold">
                              {formatCurrency(monthlyPrice)}
                              <span className="text-sm font-normal text-muted-foreground">/bln</span>
                            </p>
                            {isYearly && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Total {formatCurrency(totalPrice)}/thn
                              </p>
                            )}
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              <span>{formatNumber(plan.max_contacts)} kontak</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              <span>Pesan unlimited</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              <span>Custom domain</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              <span>Analytics dashboard</span>
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            variant={isSelected ? "outline" : "default"}
                            disabled={isSelected || upgradeMutation.isPending}
                          >
                            {isSelected ? (
                              "Plan Aktif"
                            ) : upgradeMutation.isPending ? (
                              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                            ) : (
                              "Pilih Plan"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Help Section */}
                <div className="rounded-lg bg-muted/30 p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Garansi 14 Hari</p>
                    <p className="text-xs text-muted-foreground">
                      Tidak puas? Hubungi kami dalam 14 hari untuk refund penuh.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing History - For Pro Users */}
        {!isFree && subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detail Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="default" className="bg-green-600">Aktif</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Mulai</p>
                  <p className="text-sm font-medium">
                    {format(new Date(subscription.created_at), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Berakhir</p>
                  <p className="text-sm font-medium">
                    {format(new Date(subscription.expires_at), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-medium">{formatCurrency(subscription.total_price ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
