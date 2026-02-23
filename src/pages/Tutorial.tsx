import { DashboardLayout } from "@/components/DashboardLayout";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Send,
  FileText,
  Settings,
  Globe,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ListPlus,
  Mail,
  MousePointerClick,
  Eye,
  Zap,
  AlertCircle,
} from "lucide-react";

interface TutorialStep {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
  tips?: string[];
  route?: string;
  routeLabel?: string;
}

const Tutorial = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const steps: TutorialStep[] = locale === "id" ? [
    {
      number: 1,
      title: "Daftar Akun & Login",
      description: "Langkah paling awal: buat akun dan masuk ke dashboard.",
      icon: Users,
      details: [
        "Buka halaman utama dan klik \"Mulai Sekarang\" atau \"Daftar\"",
        "Isi formulir pendaftaran: nama lengkap, email, dan password",
        "Cek inbox email kamu untuk link verifikasi (konfirmasi email)",
        "Klik link verifikasi, lalu login dengan email dan password yang sudah didaftarkan",
        "Setelah login, kamu akan langsung masuk ke Dashboard",
      ],
      tips: [
        "Gunakan email yang aktif karena semua notifikasi akan dikirim ke sana",
        "Password minimal 6 karakter — gunakan kombinasi huruf dan angka",
      ],
      route: "/auth",
      routeLabel: "Buka Halaman Login",
    },
    {
      number: 2,
      title: "Kenali Dashboard",
      description: "Pahami tampilan dashboard dan menu navigasi sebelum mulai menggunakan fitur.",
      icon: BarChart3,
      details: [
        "Dashboard menampilkan ringkasan: total kontak, kampanye aktif, email terkirim, dan open rate",
        "Sidebar kiri berisi menu navigasi: Dashboard, Kampanye, Kontak, Templat, Analitik, Pengaturan, dan Panduan",
        "Di bagian atas ada tombol untuk mengganti bahasa (ID/EN) dan tema (terang/gelap)",
        "Quick Actions di dashboard memungkinkan kamu langsung membuat kampanye, menambah kontak, atau membuat template",
      ],
      tips: [
        "Kamu bisa kembali ke Dashboard kapan saja dengan klik logo atau menu Dashboard di sidebar",
        "Gunakan tema gelap untuk kenyamanan mata saat bekerja di malam hari",
      ],
      route: "/",
      routeLabel: "Buka Dashboard",
    },
    {
      number: 3,
      title: "Buat Daftar Kontak",
      description: "Langkah pertama adalah membuat daftar (list) untuk mengelompokkan kontak/penerima email kamu.",
      icon: ListPlus,
      details: [
        "Buka halaman Kontak dari menu sidebar",
        "Klik tombol \"Kelola Daftar\" di bagian atas",
        "Buat daftar baru dengan nama yang deskriptif (contoh: \"Newsletter Pelanggan\", \"Promo Mei 2026\")",
        "Kamu bisa membuat beberapa daftar untuk segmentasi yang berbeda",
      ],
      tips: [
        "Gunakan nama yang jelas agar mudah dikenali saat membuat kampanye",
        "Pisahkan daftar berdasarkan tujuan: newsletter, promo, onboarding, dll",
      ],
      route: "/contacts",
      routeLabel: "Buka Halaman Kontak",
    },
    {
      number: 4,
      title: "Tambahkan Kontak",
      description: "Setelah membuat daftar, tambahkan kontak/subscriber ke dalam daftar tersebut.",
      icon: Users,
      details: [
        "Di halaman Kontak, klik tombol \"Tambah Kontak\"",
        "Isi nama dan alamat email penerima",
        "Pilih daftar (list) tujuan kontak tersebut",
        "Opsional: tambahkan tag untuk kategorisasi lebih lanjut",
        "Kamu juga bisa mengimpor kontak dari file CSV untuk menambahkan banyak kontak sekaligus",
      ],
      tips: [
        "Pastikan email yang dimasukkan valid untuk menghindari bounce",
        "Gunakan tag untuk mengelompokkan kontak berdasarkan minat atau kategori",
        "Format CSV: kolom pertama = nama, kolom kedua = email",
      ],
      route: "/contacts",
      routeLabel: "Tambah Kontak",
    },
    {
      number: 5,
      title: "Buat Template Email (Opsional)",
      description: "Buat template email yang bisa digunakan ulang untuk berbagai kampanye.",
      icon: FileText,
      details: [
        "Buka halaman Templat dari menu sidebar",
        "Klik \"Buat Templat\"",
        "Beri nama template dan pilih kategori (Newsletter, Promosi, Transaksional, dll)",
        "Gunakan editor visual untuk mendesain konten email",
        "Editor mendukung: heading, teks, gambar, link, alignment, bold/italic/underline",
        "Simpan template — template akan muncul saat membuat kampanye baru",
      ],
      tips: [
        "Buat template untuk format email yang sering digunakan",
        "Gunakan heading dan struktur yang jelas agar email mudah dibaca",
        "Tambahkan link CTA (Call to Action) yang jelas di setiap email",
      ],
      route: "/templates/new",
      routeLabel: "Buat Template",
    },
    {
      number: 6,
      title: "Buat Kampanye Email",
      description: "Saatnya membuat kampanye! Ikuti wizard 4 langkah untuk mengirim email ke kontak kamu.",
      icon: Send,
      details: [
        "Klik \"Kampanye Baru\" di dashboard atau halaman Kampanye",
        "Langkah 1 — Penerima: Beri nama kampanye dan pilih daftar penerima",
        "Langkah 2 — Konten: Tulis subjek email, teks preview, dan isi email menggunakan editor visual. Kamu juga bisa memilih template yang sudah dibuat",
        "Langkah 3 — Review: Periksa kembali semua detail kampanye sebelum mengirim",
        "Langkah 4 — Kirim: Pilih kirim sekarang atau jadwalkan untuk nanti",
      ],
      tips: [
        "Subjek email idealnya 30-60 karakter agar tidak terpotong",
        "Preview text muncul setelah subjek di inbox — manfaatkan untuk menarik perhatian",
        "Selalu review sebelum mengirim untuk menghindari kesalahan",
      ],
      route: "/campaigns/new",
      routeLabel: "Buat Kampanye",
    },
    {
      number: 7,
      title: "Konfigurasi Pengirim",
      description: "Atur identitas pengirim agar email terlihat profesional dan dipercaya penerima.",
      icon: Settings,
      details: [
        "Buka halaman Pengaturan dari menu sidebar",
        "Di bagian \"Konfigurasi Pengirim\", atur:",
        "• Nama Pengirim — nama yang muncul di inbox penerima (contoh: \"Tim Marketing\")",
        "• Email Pengirim — alamat email yang terlihat oleh penerima",
        "• Email Balasan — alamat untuk menerima balasan dari penerima",
        "Klik \"Perbarui Pengirim\" untuk menyimpan",
      ],
      tips: [
        "Gunakan nama yang dikenali penerima, bukan nama generik",
        "Email pengirim harus dari domain yang sudah diverifikasi",
      ],
      route: "/settings",
      routeLabel: "Buka Pengaturan",
    },
    {
      number: 8,
      title: "Hubungkan Custom Domain",
      description: "Hubungkan domain milikmu agar email dikirim dari domain brand kamu sendiri.",
      icon: Globe,
      details: [
        "Di halaman Pengaturan, scroll ke bagian \"Custom Domain\"",
        "Masukkan domain atau subdomain (contoh: mail.bisniskamu.com)",
        "Klik \"Add Domain\" — sistem akan mendaftarkan domain ke layanan email",
        "Salin DKIM CNAME records yang ditampilkan",
        "Tambahkan records tersebut ke pengaturan DNS domain kamu (di provider domain seperti Cloudflare, Namecheap, dll)",
        "Kembali ke Settings dan klik \"Check Status\" untuk verifikasi",
        "Setelah verified, semua email kampanye akan otomatis dikirim dari domain kamu",
      ],
      tips: [
        "Propagasi DNS bisa memakan waktu hingga 72 jam",
        "Gunakan subdomain (mail.domain.com) agar tidak mengganggu email utama",
        "Setelah domain terverifikasi, reputasi pengiriman email akan lebih baik",
      ],
      route: "/settings",
      routeLabel: "Setup Domain",
    },
    {
      number: 9,
      title: "Pantau Performa",
      description: "Lacak performa kampanye email kamu melalui halaman Analytics.",
      icon: BarChart3,
      details: [
        "Buka halaman Analitik dari menu sidebar",
        "Lihat metrik utama: jumlah email terkirim, open rate, dan click rate",
        "Grafik menunjukkan tren performa dari waktu ke waktu",
        "Di Dashboard, kamu juga bisa melihat ringkasan cepat kampanye terbaru",
        "Gunakan data ini untuk mengoptimalkan kampanye berikutnya",
      ],
      tips: [
        "Open rate yang baik biasanya di atas 20%",
        "Click rate yang baik biasanya di atas 2-3%",
        "Jika open rate rendah, coba perbaiki subjek email",
        "Jika click rate rendah, perbaiki CTA dan konten email",
      ],
      route: "/analytics",
      routeLabel: "Lihat Analytics",
    },
  ] : [
    {
      number: 1,
      title: "Sign Up & Login",
      description: "First step: create your account and log in to the dashboard.",
      icon: Users,
      details: [
        "Go to the landing page and click \"Get Started\" or \"Sign Up\"",
        "Fill in the registration form: full name, email, and password",
        "Check your email inbox for a verification link (email confirmation)",
        "Click the verification link, then log in with your registered email and password",
        "After logging in, you'll be taken directly to the Dashboard",
      ],
      tips: [
        "Use an active email as all notifications will be sent there",
        "Password must be at least 6 characters — use a mix of letters and numbers",
      ],
      route: "/auth",
      routeLabel: "Open Login Page",
    },
    {
      number: 2,
      title: "Explore the Dashboard",
      description: "Get familiar with the dashboard layout and navigation before using features.",
      icon: BarChart3,
      details: [
        "The Dashboard shows a summary: total contacts, active campaigns, emails sent, and open rate",
        "The left sidebar contains navigation: Dashboard, Campaigns, Contacts, Templates, Analytics, Settings, and Guide",
        "At the top you'll find toggles for language (ID/EN) and theme (light/dark)",
        "Quick Actions on the dashboard let you instantly create a campaign, add contacts, or create a template",
      ],
      tips: [
        "You can return to the Dashboard anytime by clicking the logo or Dashboard menu in the sidebar",
        "Use dark mode for eye comfort when working at night",
      ],
      route: "/",
      routeLabel: "Open Dashboard",
    },
    {
      number: 3,
      title: "Create Contact Lists",
      description: "Start by creating lists to organize your email recipients into groups.",
      icon: ListPlus,
      details: [
        "Navigate to the Contacts page from the sidebar",
        "Click the \"Manage Lists\" button at the top",
        "Create a new list with a descriptive name (e.g., \"Customer Newsletter\", \"May 2026 Promo\")",
        "You can create multiple lists for different segments",
      ],
      tips: [
        "Use clear names so they're easy to identify when creating campaigns",
        "Separate lists by purpose: newsletter, promo, onboarding, etc.",
      ],
      route: "/contacts",
      routeLabel: "Open Contacts",
    },
    {
      number: 4,
      title: "Add Contacts",
      description: "After creating lists, add contacts/subscribers to your lists.",
      icon: Users,
      details: [
        "On the Contacts page, click \"Add Contact\"",
        "Fill in the recipient's name and email address",
        "Select the target list for the contact",
        "Optional: add tags for further categorization",
        "You can also import contacts from a CSV file to add many contacts at once",
      ],
      tips: [
        "Make sure emails are valid to avoid bounces",
        "Use tags to group contacts by interest or category",
        "CSV format: first column = name, second column = email",
      ],
      route: "/contacts",
      routeLabel: "Add Contacts",
    },
    {
      number: 5,
      title: "Create Email Templates (Optional)",
      description: "Build reusable email templates for your campaigns.",
      icon: FileText,
      details: [
        "Go to the Templates page from the sidebar",
        "Click \"Create Template\"",
        "Name your template and choose a category (Newsletter, Promotion, Transactional, etc.)",
        "Use the visual editor to design your email content",
        "The editor supports: headings, text, images, links, alignment, bold/italic/underline",
        "Save — the template will appear when creating new campaigns",
      ],
      tips: [
        "Create templates for frequently used email formats",
        "Use clear headings and structure for easy reading",
        "Include a clear CTA (Call to Action) link in every email",
      ],
      route: "/templates/new",
      routeLabel: "Create Template",
    },
    {
      number: 6,
      title: "Create an Email Campaign",
      description: "Time to send emails! Follow the 4-step wizard to create and send your campaign.",
      icon: Send,
      details: [
        "Click \"New Campaign\" from the dashboard or Campaigns page",
        "Step 1 — Recipients: Name your campaign and select the recipient list",
        "Step 2 — Content: Write the email subject, preview text, and body using the visual editor. You can also select a saved template",
        "Step 3 — Review: Double-check all campaign details before sending",
        "Step 4 — Send: Choose to send now or schedule for later",
      ],
      tips: [
        "Keep subject lines 30-60 characters to avoid truncation",
        "Preview text appears after the subject in inbox — use it to grab attention",
        "Always review before sending to catch mistakes",
      ],
      route: "/campaigns/new",
      routeLabel: "Create Campaign",
    },
    {
      number: 7,
      title: "Configure Sender Identity",
      description: "Set up your sender identity so emails look professional and trustworthy.",
      icon: Settings,
      details: [
        "Go to the Settings page from the sidebar",
        "Under \"Sender Configuration\", set up:",
        "• Sender Name — the name that appears in recipient's inbox (e.g., \"Marketing Team\")",
        "• Sender Email — the email address visible to recipients",
        "• Reply-To Email — the address to receive replies from recipients",
        "Click \"Update Sender\" to save",
      ],
      tips: [
        "Use a recognizable name, not a generic one",
        "Sender email must be from a verified domain",
      ],
      route: "/settings",
      routeLabel: "Open Settings",
    },
    {
      number: 8,
      title: "Connect Custom Domain",
      description: "Connect your own domain so emails are sent from your brand.",
      icon: Globe,
      details: [
        "In Settings, scroll to the \"Custom Domain\" section",
        "Enter your domain or subdomain (e.g., mail.yourbusiness.com)",
        "Click \"Add Domain\" — the system will register your domain with the email service",
        "Copy the DKIM CNAME records displayed",
        "Add those records to your domain's DNS settings (at your domain provider like Cloudflare, Namecheap, etc.)",
        "Return to Settings and click \"Check Status\" to verify",
        "Once verified, all campaign emails will automatically be sent from your domain",
      ],
      tips: [
        "DNS propagation can take up to 72 hours",
        "Use a subdomain (mail.domain.com) to not affect your main email",
        "After verification, your email sending reputation will improve",
      ],
      route: "/settings",
      routeLabel: "Setup Domain",
    },
    {
      number: 9,
      title: "Monitor Performance",
      description: "Track your email campaign performance through the Analytics page.",
      icon: BarChart3,
      details: [
        "Go to the Analytics page from the sidebar",
        "View key metrics: emails sent, open rate, and click rate",
        "Charts show performance trends over time",
        "On the Dashboard, you can also see a quick summary of recent campaigns",
        "Use this data to optimize your next campaigns",
      ],
      tips: [
        "A good open rate is typically above 20%",
        "A good click rate is typically above 2-3%",
        "If open rate is low, try improving your subject lines",
        "If click rate is low, improve your CTA and email content",
      ],
      route: "/analytics",
      routeLabel: "View Analytics",
    },
  ];

  const faqItems = locale === "id" ? [
    {
      q: "Berapa banyak email yang bisa saya kirim?",
      a: "Batas pengiriman tergantung pada plan yang kamu gunakan. Lihat informasi plan di sidebar.",
    },
    {
      q: "Apakah saya perlu akses AWS atau layanan email lain?",
      a: "Tidak! Semua infrastruktur email dikelola oleh platform. Kamu cukup menggunakan fitur yang tersedia di dashboard.",
    },
    {
      q: "Bagaimana cara menghentikan langganan kontak?",
      a: "Kamu bisa mengubah status kontak menjadi 'Unsubscribed' di halaman Kontak. Kontak dengan status ini tidak akan menerima email kampanye.",
    },
    {
      q: "Apa itu DKIM dan mengapa perlu setup DNS?",
      a: "DKIM adalah standar autentikasi email yang membuktikan email dikirim dari domain yang sah. Setup DNS CNAME records memungkinkan verifikasi ini, sehingga email kamu tidak masuk spam.",
    },
    {
      q: "Bisakah saya menjadwalkan email untuk dikirim nanti?",
      a: "Ya! Saat membuat kampanye, di langkah terakhir kamu bisa memilih \"Jadwalkan Nanti\" dan mengatur tanggal serta waktu pengiriman.",
    },
  ] : [
    {
      q: "How many emails can I send?",
      a: "The sending limit depends on your plan. Check your plan information in the sidebar.",
    },
    {
      q: "Do I need access to AWS or other email services?",
      a: "No! All email infrastructure is managed by the platform. Just use the features available in your dashboard.",
    },
    {
      q: "How do I unsubscribe a contact?",
      a: "You can change a contact's status to 'Unsubscribed' on the Contacts page. Contacts with this status won't receive campaign emails.",
    },
    {
      q: "What is DKIM and why do I need DNS setup?",
      a: "DKIM is an email authentication standard that proves emails are sent from a legitimate domain. Setting up DNS CNAME records enables this verification, keeping your emails out of spam.",
    },
    {
      q: "Can I schedule emails to send later?",
      a: "Yes! When creating a campaign, in the last step you can choose \"Schedule for Later\" and set the date and time.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {locale === "id" ? "Panduan Lengkap" : "Complete Guide"}
              </h1>
              <p className="text-muted-foreground">
                {locale === "id"
                  ? "Ikuti langkah-langkah berikut untuk mulai mengirim kampanye email."
                  : "Follow these steps to start sending email campaigns."}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Overview */}
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  {locale === "id" ? "Mulai Cepat" : "Quick Start"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === "id"
                    ? "Untuk mengirim kampanye pertama kamu, minimal lakukan: (1) Buat daftar kontak → (2) Tambah kontak → (3) Buat kampanye → Kirim! Langkah lainnya opsional tapi sangat direkomendasikan."
                    : "To send your first campaign, at minimum do: (1) Create a contact list → (2) Add contacts → (3) Create a campaign → Send! Other steps are optional but highly recommended."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.number} className="border-border/40 overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      {step.number <= 2 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {locale === "id" ? "Setup" : "Setup"}
                        </Badge>
                      )}
                      {(step.number === 3 || step.number === 4) && (
                        <Badge variant="default" className="text-[10px]">
                          {locale === "id" ? "Wajib" : "Required"}
                        </Badge>
                      )}
                      {step.number === 5 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {locale === "id" ? "Opsional" : "Optional"}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pl-[4.5rem]">
                {/* Detail steps */}
                <div className="space-y-2">
                  {step.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      {detail.startsWith("•") ? (
                        <span className="mt-0.5 text-muted-foreground">{detail}</span>
                      ) : (
                        <>
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span className="text-foreground/80">{detail}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-4 rounded-lg border border-warning/20 bg-warning/[0.04] p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-warning">
                      💡 {locale === "id" ? "Tips" : "Tips"}
                    </p>
                    <ul className="space-y-1">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action button */}
                {step.route && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => navigate(step.route!)}
                  >
                    {step.routeLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            {locale === "id" ? "Pertanyaan Umum (FAQ)" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">{item.q}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help CTA */}
        <Card className="border-border/40">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {locale === "id" ? "Masih butuh bantuan?" : "Still need help?"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {locale === "id"
                    ? "Hubungi tim support kami jika ada pertanyaan."
                    : "Contact our support team if you have any questions."}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {locale === "id" ? "Hubungi Support" : "Contact Support"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Tutorial;
