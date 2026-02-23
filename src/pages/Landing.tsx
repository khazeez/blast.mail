import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Zap, Shield, Globe, MousePointerClick, BarChart3,
  Send, Layers, Plug, FileText, Lock, CheckCircle2,
  ArrowRight, ChevronDown, Sparkles, Rocket, Users,
  MessageSquare, Bot, Eye, Link2, Server, Key,
  Facebook, Smartphone, PenTool, Database, Workflow,
  Award, Clock, Target, ShieldCheck, Cookie, Scale,
  FileSignature, AtSign, Fingerprint, Radio,
} from "lucide-react";

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

const solutions = [
  { icon: Send, title: "Transactional Email (SMTP)", desc: "Kirim email otomatis untuk notifikasi, verifikasi, dan invoice secara real-time." },
  { icon: PenTool, title: "Drag & Drop Email Builder", desc: "Buat email indah tanpa coding dengan editor visual intuitif." },
  { icon: Database, title: "Integrasi Google Sheets", desc: "Sinkronkan kontak dan data langsung dari Google Sheets." },
  { icon: Layers, title: "Landing Page Builder", desc: "Bangun landing page konversi tinggi dalam hitungan menit." },
  { icon: Facebook, title: "Integrasi Facebook Ads", desc: "Hubungkan lead dari Facebook Ads langsung ke daftar kontak." },
  { icon: Plug, title: "Integrasi WordPress", desc: "Pasang plugin WordPress untuk capture subscriber otomatis." },
  { icon: Smartphone, title: "Integrasi Tombol WhatsApp", desc: "Tambahkan tombol WhatsApp untuk komunikasi langsung." },
  { icon: MessageSquare, title: "Integrasi Telegram", desc: "Kirim notifikasi dan broadcast langsung via Telegram." },
  { icon: Workflow, title: "Marketing Automation", desc: "Otomatisasi alur email berdasarkan perilaku pengguna." },
  { icon: Sparkles, title: "Viral Campaign", desc: "Buat kampanye viral dengan referral dan sharing otomatis." },
  { icon: CheckCircle2, title: "Manual Approval", desc: "Kontrol penuh: setujui subscriber secara manual sebelum masuk list." },
  { icon: Zap, title: "Magic Opt-in", desc: "Subscriber langsung terverifikasi tanpa double opt-in yang merepotkan." },
  { icon: Fingerprint, title: "DKIM & SPF", desc: "Autentikasi email untuk deliverability maksimal dan anti-spam." },
  { icon: Radio, title: "Instant Email Sender", desc: "Kirim ribuan email dalam hitungan detik dengan infrastruktur kuat." },
  { icon: AtSign, title: "Custom Domain", desc: "Gunakan domain sendiri untuk branding email profesional." },
];

const legal = [
  { icon: Lock, title: "Kebijakan Privasi", desc: "Data pengguna dilindungi sesuai standar internasional." },
  { icon: Cookie, title: "Kebijakan Cookie", desc: "Transparansi penuh tentang penggunaan cookie di platform." },
  { icon: Scale, title: "GDPR Compliance", desc: "Mematuhi regulasi perlindungan data Uni Eropa." },
  { icon: FileSignature, title: "NDA & SLA", desc: "Perjanjian kerahasiaan dan jaminan layanan terukur." },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "10M+", label: "Email/Bulan" },
  { value: "500+", label: "Bisnis Aktif" },
  { value: "<1s", label: "Waktu Kirim" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Berapa lama untuk mulai mengirim email?", a: "Hanya butuh beberapa menit! Daftar, verifikasi domain Anda, dan mulai kirim email pertama." },
    { q: "Apakah ada batasan jumlah email?", a: "Tergantung paket yang dipilih. Paket gratis mendukung hingga 1.000 email/bulan, paket berbayar hingga tak terbatas." },
    { q: "Bagaimana cara memastikan email tidak masuk spam?", a: "Kami menyediakan DKIM & SPF, IP reputation management, dan konten scoring untuk memastikan deliverability tinggi." },
    { q: "Apakah data saya aman?", a: "Ya! Kami mematuhi GDPR, menggunakan enkripsi end-to-end, dan menyediakan NDA untuk klien enterprise." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MailBlast</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#solutions" className="text-sm text-muted-foreground transition hover:text-foreground">Solutions</a>
            <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">Fitur</a>
            <a href="#faq" className="text-sm text-muted-foreground transition hover:text-foreground">FAQ</a>
            <a href="/pricing" className="text-sm text-muted-foreground transition hover:text-foreground">Harga</a>
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
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <motion.div
          className="mx-auto max-w-4xl px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Platform Email Marketing #1 Indonesia
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Kirim Email yang{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Menghasilkan
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Platform lengkap untuk email marketing, automation, dan transactional email.
            Tingkatkan konversi hingga 3x dengan deliverability terbaik.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2 px-8 text-base" onClick={() => navigate("/login")}>
              <Rocket className="h-4 w-4" /> Mulai Gratis Sekarang
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base" onClick={() => document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" })}>
              Lihat Solutions <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/30 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-3xl font-extrabold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-4 gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Solutions
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
              Semua yang Anda Butuhkan
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Solusi lengkap dari transactional email hingga marketing automation dalam satu platform.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {solutions.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} custom={i}>
                <Card className="group h-full border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features / Legal & Compliance */}
      <section id="features" className="border-t border-border/60 bg-muted/20 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-4 gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Keamanan & Kepatuhan
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
              Aman dan Terpercaya
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Kami memprioritaskan keamanan data dan kepatuhan terhadap regulasi internasional.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {legal.map((l, i) => (
              <motion.div key={l.title} variants={fadeUp} custom={i}>
                <Card className="border-border/60 transition-all hover:border-primary/20 hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <l.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{l.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold tracking-tight">
              Pertanyaan Umum
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground">
              Jawaban untuk pertanyaan yang sering diajukan.
            </motion.p>
          </motion.div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-card px-5 py-4 text-left transition-colors hover:bg-accent"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 py-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5 py-24">
        <motion.div
          className="mx-auto max-w-3xl px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Siap Meningkatkan Email Marketing Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Mulai gratis hari ini. Tanpa kartu kredit. Upgrade kapan saja.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2 px-8 text-base" onClick={() => navigate("/login")}>
              <Rocket className="h-4 w-4" /> Daftar Sekarang
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis selamanya</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Tanpa kartu kredit</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Setup 5 menit</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">MailBlast</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition hover:text-foreground">Kebijakan Privasi</a>
              <a href="#" className="transition hover:text-foreground">Kebijakan Cookie</a>
              <a href="#" className="transition hover:text-foreground">GDPR</a>
              <a href="#" className="transition hover:text-foreground">NDA & SLA</a>
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

export default Landing;
