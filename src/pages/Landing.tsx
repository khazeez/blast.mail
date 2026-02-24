import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail, Zap, Send, Users, BarChart3, Plug,
  CheckCircle2, ArrowRight, Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Send, title: "Email Marketing", desc: "Kirim campaign email ke ribuan subscriber dengan mudah." },
  { icon: Zap, title: "Automation", desc: "Automasi workflow email berdasarkan perilaku pengguna." },
  { icon: Users, title: "Contact Management", desc: "Kelola subscriber dan segmentasi dengan efisien." },
  { icon: BarChart3, title: "Analytics", desc: "Pantau performa email: open rate, click rate, dan lainnya." },
  { icon: Plug, title: "Integrasi", desc: "Hubungkan dengan Google Sheets, n8n, webhook, dan lainnya." },
  { icon: Sparkles, title: "Email Builder", desc: "Drag & drop editor untuk membuat email profesional." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MailBlast</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Harga</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Masuk</Button>
            <Button size="sm" className="gap-2" onClick={() => navigate("/login")}>
              Mulai Gratis <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <motion.div className="mx-auto max-w-3xl px-6 text-center" initial="hidden" animate="visible">
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> Platform Email Marketing Indonesia
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Email Marketing yang{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Simpel & Powerful
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
            Kirim email marketing, buat automation, dan kelola subscriber dalam satu platform.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2" onClick={() => navigate("/login")}>
              Mulai Gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              Lihat Harga
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} custom={4} className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis selamanya</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Tanpa kartu kredit</span>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Fitur Utama</h2>
            <p className="mt-2 text-muted-foreground">Semua yang Anda butuhkan untuk email marketing.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30 border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Siap Memulai?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Daftar gratis dan mulai kirim email dalam 5 menit.
          </p>
          <Button size="lg" className="mt-6 gap-2" onClick={() => navigate("/login")}>
            Daftar Sekarang <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">MailBlast</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MailBlast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
