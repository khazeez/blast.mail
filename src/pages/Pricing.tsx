import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Mail, CheckCircle2, ArrowRight, Sparkles, Rocket,
  Users, Send, Zap, Crown,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const durationOptions = [
  { value: "1", label: "1 Bulan", discount: 0 },
  { value: "3", label: "3 Bulan", discount: 10 },
  { value: "6", label: "6 Bulan", discount: 15 },
  { value: "12", label: "1 Tahun", discount: 25 },
];

const formatNumber = (n: number) => n.toLocaleString("id-ID");
const formatCurrency = (n: number) => `Rp ${formatNumber(n)}`;

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contactIndex, setContactIndex] = useState(0);
  const [duration, setDuration] = useState("1");

  // Fetch plans from DB
  const { data: allPlans } = useQuery({
    queryKey: ["plans-public"],
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

  const freePlan = allPlans?.find((p: any) => p.is_free);
  const proPlans = allPlans?.filter((p: any) => !p.is_free) ?? [];

  const selectedPlan = proPlans[contactIndex];
  const selectedDuration = durationOptions.find((d) => d.value === duration)!;
  const months = parseInt(selectedDuration.value);

  const monthlyPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return Math.round(selectedPlan.price_monthly * (1 - selectedDuration.discount / 100));
  }, [selectedPlan, selectedDuration]);

  const totalPrice = monthlyPrice * months;

  const freeFeatures = (freePlan?.features as string[]) ?? [
    "100 kontak", "200 pesan/bulan", "Email editor dasar", "1 template", "Statistik dasar",
  ];

  const proFeatures = (selectedPlan?.features as string[]) ?? [];

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPlan) throw new Error("Login required");
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Cancel existing active subscriptions
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");

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
      toast.success("Berhasil berlangganan! Selamat menggunakan Pro plan.");
      navigate("/billing");
    },
    onError: () => toast.error("Gagal berlangganan. Silakan coba lagi."),
  });

  const handleSubscribe = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    subscribeMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/landing")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MailBlast</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="/landing#solutions" className="text-sm text-muted-foreground transition hover:text-foreground">Solutions</a>
            <a href="/landing#features" className="text-sm text-muted-foreground transition hover:text-foreground">Fitur</a>
            <span className="text-sm font-medium text-foreground">Harga</span>
            <a href="/landing#faq" className="text-sm text-muted-foreground transition hover:text-foreground">FAQ</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Masuk</Button>
            <Button size="sm" className="gap-2" onClick={() => navigate("/login")}>
              Mulai Gratis <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <motion.div
          className="mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Harga Transparan, Tanpa Biaya Tersembunyi
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Pilih Plan yang{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tepat untuk Anda
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Mulai gratis, upgrade sesuai kebutuhan. Semua plan Pro termasuk pesan unlimited.
          </motion.p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="h-full border-border/60 relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Free</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">Sempurna untuk memulai dan mencoba platform.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">Rp 0</span>
                      <span className="text-muted-foreground text-sm">/ selamanya</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2" size="lg" onClick={() => navigate("/login")}>
                    Mulai Gratis <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Termasuk:</p>
                    {freeFeatures.map((f: string) => (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="h-full border-primary/40 relative shadow-lg shadow-primary/5">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 px-3 py-1 bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3" /> Paling Populer
                  </Badge>
                </div>
                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Pro</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">Untuk bisnis yang serius dengan email marketing.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">{formatCurrency(monthlyPrice)}</span>
                      <span className="text-muted-foreground text-sm">/ bulan</span>
                    </div>
                    {months > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Total {formatCurrency(totalPrice)} untuk {selectedDuration.label.toLowerCase()}
                        {selectedDuration.discount > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                            Hemat {selectedDuration.discount}%
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>

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
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{proPlans[0] ? formatNumber(proPlans[0].max_contacts) : "1K"}</span>
                      <span>{proPlans[proPlans.length - 1] ? formatNumber(proPlans[proPlans.length - 1].max_contacts) : "75K"}</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Durasi Langganan</Label>
                    <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-2">
                      {durationOptions.map((d) => (
                        <Label
                          key={d.value}
                          htmlFor={`dur-${d.value}`}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all text-sm ${
                            duration === d.value
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border/60 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value={d.value} id={`dur-${d.value}`} />
                          <span className="flex-1">{d.label}</span>
                          {d.discount > 0 && (
                            <span className="text-[10px] font-semibold text-primary">-{d.discount}%</span>
                          )}
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                    <Send className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">Pesan Unlimited</span>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleSubscribe}
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    ) : (
                      <Rocket className="h-4 w-4" />
                    )}
                    {user ? "Berlangganan Sekarang" : "Mulai Sekarang"}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Semua fitur termasuk:</p>
                    {proFeatures.map((f: string) => (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-20">
        <motion.div
          className="mx-auto max-w-3xl px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Butuh Lebih dari 75.000 Kontak?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Hubungi kami untuk paket Enterprise dengan harga khusus, dedicated support, dan SLA terjamin.
          </p>
          <Button size="lg" variant="outline" className="mt-8 gap-2 px-8" onClick={() => window.open("mailto:sales@mailblast.id")}>
            Hubungi Sales <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/landing")}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">MailBlast</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="/landing" className="transition hover:text-foreground">Home</a>
              <a href="/landing#solutions" className="transition hover:text-foreground">Solutions</a>
              <a href="/landing#faq" className="transition hover:text-foreground">FAQ</a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MailBlast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
