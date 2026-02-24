import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Locale = "en" | "id";

interface Translations {
  [key: string]: { en: string; id: string };
}

const translations: Translations = {
  // Sidebar
  "nav.learn": { en: "Learn", id: "Belajar" },
  "nav.dashboard": { en: "Dashboard", id: "Dasbor" },
  "nav.campaigns": { en: "Campaigns", id: "Kampanye" },
  "nav.contacts": { en: "Contacts", id: "Kontak" },
  "nav.templates": { en: "Templates", id: "Templat" },
  "nav.analytics": { en: "Analytics", id: "Analitik" },
  "nav.settings": { en: "Settings", id: "Pengaturan" },
  "nav.integrations": { en: "Integrations", id: "Integrasi" },
  "nav.billing": { en: "Billing", id: "Billing" },
  "nav.automations": { en: "Automation", id: "Otomasi" },
  "nav.automationWorkflow": { en: "Automation Workflow", id: "Alur Otomasi" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", id: "Dasbor" },
  "dashboard.subtitle": { en: "Welcome back! Here's an overview of your email marketing.", id: "Selamat datang! Berikut ringkasan email marketing Anda." },
  "dashboard.totalSubscribers": { en: "Total Subscribers", id: "Total Pelanggan" },
  "dashboard.campaignsSent": { en: "Campaigns Sent", id: "Kampanye Terkirim" },
  "dashboard.avgOpenRate": { en: "Avg. Open Rate", id: "Rata-rata Open Rate" },
  "dashboard.avgClickRate": { en: "Avg. Click Rate", id: "Rata-rata Click Rate" },
  "dashboard.emailPerformance": { en: "Email Performance — Last 30 Days", id: "Performa Email — 30 Hari Terakhir" },
  "dashboard.recentCampaigns": { en: "Recent Campaigns", id: "Kampanye Terbaru" },
  "dashboard.newCampaign": { en: "New Campaign", id: "Kampanye Baru" },
  "dashboard.addContacts": { en: "Add Contacts", id: "Tambah Kontak" },

  // Campaigns
  "campaigns.title": { en: "Campaigns", id: "Kampanye" },
  "campaigns.subtitle": { en: "Create and manage your email campaigns.", id: "Buat dan kelola kampanye email Anda." },
  "campaigns.new": { en: "New Campaign", id: "Kampanye Baru" },
  "campaigns.campaign": { en: "Campaign", id: "Kampanye" },
  "campaigns.status": { en: "Status", id: "Status" },
  "campaigns.recipients": { en: "Recipients", id: "Penerima" },
  "campaigns.openRate": { en: "Open Rate", id: "Open Rate" },
  "campaigns.clickRate": { en: "Click Rate", id: "Click Rate" },
  "campaigns.date": { en: "Date", id: "Tanggal" },
  "campaigns.sent": { en: "Sent", id: "Terkirim" },
  "campaigns.scheduled": { en: "Scheduled", id: "Terjadwal" },
  "campaigns.draft": { en: "Draft", id: "Draf" },

  // Contacts
  "contacts.title": { en: "Contacts", id: "Kontak" },
  "contacts.subtitle": { en: "Manage your subscribers and contact lists.", id: "Kelola pelanggan dan daftar kontak Anda." },
  "contacts.addContact": { en: "Add Contact", id: "Tambah Kontak" },
  "contacts.importCSV": { en: "Import CSV", id: "Impor CSV" },
  "contacts.export": { en: "Export", id: "Ekspor" },
  "contacts.searchPlaceholder": { en: "Search by name or email...", id: "Cari berdasarkan nama atau email..." },
  "contacts.allStatus": { en: "All Status", id: "Semua Status" },
  "contacts.subscribed": { en: "Subscribed", id: "Berlangganan" },
  "contacts.unsubscribed": { en: "Unsubscribed", id: "Berhenti" },
  "contacts.bounced": { en: "Bounced", id: "Gagal" },
  "contacts.allLists": { en: "All Lists", id: "Semua List" },
  "contacts.name": { en: "Name", id: "Nama" },
  "contacts.email": { en: "Email", id: "Email" },
  "contacts.tags": { en: "Tags", id: "Tag" },
  "contacts.list": { en: "List", id: "Daftar" },
  "contacts.added": { en: "Added", id: "Ditambahkan" },
  "contacts.noContacts": { en: "No contacts found.", id: "Tidak ada kontak ditemukan." },
  "contacts.addNew": { en: "Add New Contact", id: "Tambah Kontak Baru" },
  "contacts.addDescription": { en: "Add a subscriber to your contact list.", id: "Tambahkan pelanggan ke daftar kontak Anda." },
  "contacts.selectList": { en: "Select a list", id: "Pilih daftar" },
  "contacts.cancel": { en: "Cancel", id: "Batal" },
  "contacts.manageLists": { en: "Manage Lists", id: "Kelola Daftar" },
  "contacts.manageListsDesc": { en: "Create and manage your subscriber lists.", id: "Buat dan kelola daftar pelanggan Anda." },
  "contacts.createList": { en: "Create List", id: "Buat Daftar" },

  // Templates
  "templates.title": { en: "Templates", id: "Templat" },
  "templates.subtitle": { en: "Browse and customize email templates.", id: "Jelajahi dan sesuaikan templat email." },
  "templates.create": { en: "Create Template", id: "Buat Templat" },
  "templates.preview": { en: "Preview", id: "Pratinjau" },

  // Analytics
  "analytics.title": { en: "Analytics", id: "Analitik" },
  "analytics.subtitle": { en: "Track your email campaign performance over time.", id: "Pantau performa kampanye email Anda dari waktu ke waktu." },
  "analytics.overview": { en: "Emails Overview — 6 Months", id: "Ringkasan Email — 6 Bulan" },
  "analytics.ratesOverTime": { en: "Rates Over Time", id: "Tren Rasio" },

  // Settings
  "settings.title": { en: "Settings", id: "Pengaturan" },
  "settings.subtitle": { en: "Manage your account and sender settings.", id: "Kelola akun dan pengaturan pengirim Anda." },
  "settings.profile": { en: "Profile", id: "Profil" },
  "settings.profileDesc": { en: "Your personal information.", id: "Informasi pribadi Anda." },
  "settings.fullName": { en: "Full Name", id: "Nama Lengkap" },
  "settings.saveChanges": { en: "Save Changes", id: "Simpan Perubahan" },
  "settings.senderConfig": { en: "Sender Configuration", id: "Konfigurasi Pengirim" },
  "settings.senderDesc": { en: "Default sender details for your campaigns.", id: "Detail pengirim default untuk kampanye Anda." },
  "settings.senderName": { en: "Sender Name", id: "Nama Pengirim" },
  "settings.senderEmail": { en: "Sender Email", id: "Email Pengirim" },
  "settings.replyTo": { en: "Reply-To Email", id: "Email Balasan" },
  "settings.updateSender": { en: "Update Sender", id: "Perbarui Pengirim" },

  // Campaign Create
  "campaignCreate.title": { en: "New Campaign", id: "Kampanye Baru" },
  "campaignCreate.step": { en: "Step", id: "Langkah" },
  "campaignCreate.of": { en: "of", id: "dari" },
  "campaignCreate.back": { en: "Back", id: "Kembali" },
  "campaignCreate.next": { en: "Next", id: "Selanjutnya" },
  "campaignCreate.sendCampaign": { en: "Send Campaign", id: "Kirim Kampanye" },
  "campaignCreate.scheduleCampaign": { en: "Schedule Campaign", id: "Jadwalkan Kampanye" },
  "campaignCreate.campaignDetails": { en: "Campaign Details", id: "Detail Kampanye" },
  "campaignCreate.campaignName": { en: "Campaign Name", id: "Nama Kampanye" },
  "campaignCreate.selectRecipients": { en: "Select Recipients", id: "Pilih Penerima" },
  "campaignCreate.contacts": { en: "contacts", id: "kontak" },
  "campaignCreate.emailSubject": { en: "Email Subject", id: "Subjek Email" },
  "campaignCreate.subjectLine": { en: "Subject Line", id: "Baris Subjek" },
  "campaignCreate.characters": { en: "characters", id: "karakter" },
  "campaignCreate.previewText": { en: "Preview Text", id: "Teks Pratinjau" },
  "campaignCreate.template": { en: "Template", id: "Templat" },
  "campaignCreate.emailBody": { en: "Email Body", id: "Isi Email" },
  "campaignCreate.summary": { en: "Campaign Summary", id: "Ringkasan Kampanye" },
  "campaignCreate.emailPreview": { en: "Email Preview", id: "Pratinjau Email" },
  "campaignCreate.noContent": { en: "No content yet.", id: "Belum ada konten." },
  "campaignCreate.sendOptions": { en: "Send Options", id: "Opsi Pengiriman" },
  "campaignCreate.sendNow": { en: "Send Now", id: "Kirim Sekarang" },
  "campaignCreate.sendNowDesc": { en: "Campaign will be sent immediately to all recipients.", id: "Kampanye akan langsung dikirim ke semua penerima." },
  "campaignCreate.scheduleLater": { en: "Schedule for Later", id: "Jadwalkan Nanti" },
  "campaignCreate.scheduleLaterDesc": { en: "Choose a date and time to send the campaign.", id: "Pilih tanggal dan waktu untuk mengirim kampanye." },

  // Template Create
  "templateCreate.title": { en: "Create Template", id: "Buat Templat" },
  "templateCreate.subtitle": { en: "Design a reusable email template.", id: "Desain templat email yang bisa digunakan ulang." },
  "templateCreate.details": { en: "Template Details", id: "Detail Templat" },
  "templateCreate.name": { en: "Template Name", id: "Nama Templat" },
  "templateCreate.category": { en: "Category", id: "Kategori" },
  "templateCreate.content": { en: "Template Content", id: "Konten Templat" },
  "templateCreate.save": { en: "Save Template", id: "Simpan Templat" },

  // Auth
  "auth.tagline": { en: "Email marketing made simple.", id: "Email marketing jadi mudah." },
  "auth.signIn": { en: "Sign In", id: "Masuk" },
  "auth.signUp": { en: "Sign Up", id: "Daftar" },
  "auth.signInDesc": { en: "Enter your credentials to access your account.", id: "Masukkan kredensial untuk mengakses akun Anda." },
  "auth.signUpDesc": { en: "Create an account to get started.", id: "Buat akun untuk memulai." },
  "auth.fullName": { en: "Full Name", id: "Nama Lengkap" },
  "auth.password": { en: "Password", id: "Kata Sandi" },
  "auth.noAccount": { en: "Don't have an account?", id: "Belum punya akun?" },
  "auth.hasAccount": { en: "Already have an account?", id: "Sudah punya akun?" },
  "auth.nameRequired": { en: "Full name is required.", id: "Nama lengkap wajib diisi." },
  "auth.checkEmail": { en: "Check your email to confirm your account!", id: "Cek email Anda untuk konfirmasi akun!" },
  "auth.signOut": { en: "Sign Out", id: "Keluar" },

  // Common
  "common.status": { en: "Status", id: "Status" },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale");
      if (stored === "en" || stored === "id") return stored;
    }
    return "en";
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "en" ? "id" : "en";
      localStorage.setItem("locale", next);
      return next;
    });
  }, []);

  const handleSetLocale = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale];
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
