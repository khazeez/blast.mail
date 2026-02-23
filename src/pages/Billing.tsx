import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Crown, Zap, Users, Send, CheckCircle2, ArrowRight,
  Calendar, CreditCard, Rocket, AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const formatNumber = (n: number) => n.toLocaleString("id-ID");
const formatCurrency = (n: number) => `Rp ${formatNumber(n)}`;

const durationOptions = [
  { value: "1", label: "1 Bulan", discount: 0 },
  { value: "3", label: "3 Bulan", discount: 10 },
  { value: "6", label: "6 Bulan", discount: 15 },
  { value: "12", label: "1 Tahun", discount: 25 },
];

const Billing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [contactIndex, setContactIndex] = useState(0);
  const [duration, setDuration] = useState("1");

  // Fetch current subscription with plan
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

  // Fetch all plans
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

  // Fetch usage counts
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
  const contactTiers = proPlans.map((p: any) => p.max_contacts);

  const selectedPlan = proPlans[contactIndex];
  const selectedDuration = durationOptions.find((d) => d.value === duration)!;
  const months = parseInt(selectedDuration.value);

  const monthlyPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    const base = selectedPlan.price_monthly;
    return Math.round(base * (1 - selectedDuration.discount / 100));
  }, [selectedPlan, selectedDuration]);

  const totalPrice = monthlyPrice * months;

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPlan) throw new Error("Missing data");
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Cancel current subscription if exists
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
        discount_percent: selectedDuration.discount,
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

  const currentPlan = subscription?.plans as any;
  const maxContacts = currentPlan?.max_contacts ?? 100;
  const maxMessages = currentPlan?.max_messages;
  const contactUsage = usage?.contacts ?? 0;
  const contactPercent = Math.min((contactUsage / maxContacts) * 100, 100);
  const isFree = currentPlan?.is_free ?? true;

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
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing & Plan</h1>
          <p className="text-sm text-muted-foreground">Kelola langganan dan lihat penggunaan Anda.</p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isFree ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {isFree ? <Users className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{currentPlan?.name ?? "Free"}</CardTitle>
                  <p className="text-sm text-muted-foreground">Plan aktif Anda saat ini</p>
                </div>
              </div>
              <Badge variant={isFree ? "secondary" : "default"} className="gap-1">
                {isFree ? "Free" : "Pro"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Usage: Contacts */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Kontak
                </span>
                <span className="font-medium">{formatNumber(contactUsage)} / {formatNumber(maxContacts)}</span>
              </div>
              <Progress value={contactPercent} className="h-2" />
              {contactPercent >= 90 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Mendekati batas kontak
                </p>
              )}
            </div>

            {/* Usage: Messages */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Pesan
                </span>
                <span className="font-medium">
                  {maxMessages ? `${formatNumber(usage?.campaigns ?? 0)} / ${formatNumber(maxMessages)}` : "Unlimited"}
                </span>
              </div>
              {maxMessages && (
                <Progress value={Math.min(((usage?.campaigns ?? 0) / maxMessages) * 100, 100)} className="h-2" />
              )}
              {!maxMessages && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Zap className="h-3 w-3" /> Unlimited — tanpa batas pengiriman
                </div>
              )}
            </div>

            {/* Billing info */}
            {!isFree && subscription && (
              <div className="rounded-lg border border-border/60 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Harga / bulan
                  </span>
                  <span className="font-medium">{formatCurrency(subscription.price_per_month)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Berlaku hingga
                  </span>
                  <span className="font-medium">
                    {format(new Date(subscription.expires_at), "dd MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
                {subscription.discount_percent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diskon</span>
                    <Badge variant="secondary" className="text-xs">{subscription.discount_percent}%</Badge>
                  </div>
                )}
              </div>
            )}

            {/* Upgrade Button */}
            {isFree ? (
              <Button className="w-full gap-2" size="lg" onClick={() => setShowUpgrade(!showUpgrade)}>
                <Rocket className="h-4 w-4" /> Upgrade ke Pro
              </Button>
            ) : (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowUpgrade(!showUpgrade)}>
                <Zap className="h-4 w-4" /> Ubah Plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Section */}
        {showUpgrade && proPlans.length > 0 && (
          <Card className="border-primary/30 shadow-md shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" /> Pilih Plan Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Jumlah Kontak</Label>
                  <Badge variant="outline" className="font-mono text-sm">
                    {selectedPlan ? formatNumber(selectedPlan.max_contacts) : "—"}
                  </Badge>
                </div>
                <Slider
                  value={[contactIndex]}
                  onValueChange={([v]) => setContactIndex(v)}
                  min={0}
                  max={Math.max(proPlans.length - 1, 0)}
                  step={1}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{proPlans[0] ? formatNumber(proPlans[0].max_contacts) : ""}</span>
                  <span>{proPlans[proPlans.length - 1] ? formatNumber(proPlans[proPlans.length - 1].max_contacts) : ""}</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Durasi Langganan</Label>
                <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-2">
                  {durationOptions.map((d) => (
                    <Label
                      key={d.value}
                      htmlFor={`billing-dur-${d.value}`}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all text-sm ${
                        duration === d.value
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={d.value} id={`billing-dur-${d.value}`} />
                      <span className="flex-1">{d.label}</span>
                      {d.discount > 0 && (
                        <span className="text-[10px] font-semibold text-primary">-{d.discount}%</span>
                      )}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Price Summary */}
              <div className="rounded-lg bg-muted/50 border border-border/60 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga / bulan</span>
                  <span className="font-semibold">{formatCurrency(monthlyPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durasi</span>
                  <span>{selectedDuration.label}</span>
                </div>
                {selectedDuration.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diskon</span>
                    <Badge variant="secondary" className="text-xs">Hemat {selectedDuration.discount}%</Badge>
                  </div>
                )}
                <div className="border-t border-border/60 pt-2 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                <Send className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">Pesan Unlimited</span>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => upgradeMutation.mutate()}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Konfirmasi Upgrade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
