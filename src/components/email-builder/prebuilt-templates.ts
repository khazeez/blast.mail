export interface PrebuiltTemplate {
  id: string;
  name: string;
  category: "newsletter" | "promo" | "welcome" | "announcement" | "transactional";
  description: string;
  thumbnail: string;
  content: string;
  blocks: any[];
}

export const prebuiltTemplates: PrebuiltTemplate[] = [
  {
    id: "newsletter-modern",
    name: "Modern Newsletter",
    category: "newsletter",
    description: "Clean and modern newsletter template",
    thumbnail: "📧",
    content: "",
    blocks: [
      { id: "1", type: "heading", props: { content: "Newsletter Mingguan", level: 1, align: "center", color: "#ffffff" } },
      { id: "2", type: "text", props: { content: "Halo {{first_name}}, berikut update terbaru untuk Anda!", align: "center", color: "#e0e0e0", fontSize: "medium" } },
      { id: "3", type: "divider", props: { style: "solid", color: "#3b82f6", thickness: 2 } },
      { id: "4", type: "heading", props: { content: "Berita Utama", level: 2, align: "left", color: "#ffffff" } },
      { id: "5", type: "text", props: { content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", align: "left", color: "#ffffff", fontSize: "medium" } },
      { id: "6", type: "button", props: { text: "Baca Selengkapnya", link: "{{link}}", backgroundColor: "#3b82f6", textColor: "#ffffff", align: "center", borderRadius: 8 } },
      { id: "7", type: "spacer", props: { height: 20 } },
      { id: "8", type: "footer", props: { companyName: "Your Company", address: "Jakarta, Indonesia", unsubscribeLink: true, socialLinks: true } }
    ]
  },
  {
    id: "promo-flash-sale",
    name: "Flash Sale",
    category: "promo",
    description: "Eye-catching promotional template for sales",
    thumbnail: "🔥",
    content: "",
    blocks: [
      { id: "1", type: "heading", props: { content: "🔥 FLASH SALE!", level: 1, align: "center", color: "#ffffff" } },
      { id: "2", type: "heading", props: { content: "DISKON HINGGA 70%", level: 2, align: "center", color: "#fbbf24" } },
      { id: "3", type: "text", props: { content: "Penawaran terbatas! Hanya berlaku 24 jam.", align: "center", color: "#e0e0e0", fontSize: "medium" } },
      { id: "4", type: "spacer", props: { height: 20 } },
      { id: "5", type: "button", props: { text: "BELANJA SEKARANG", link: "{{shop_link}}", backgroundColor: "#ef4444", textColor: "#ffffff", align: "center", borderRadius: 50 } },
      { id: "6", type: "spacer", props: { height: 30 } },
      { id: "7", type: "text", props: { content: "Gunakan kode: FLASH70", align: "center", color: "#fbbf24", fontSize: "large" } },
      { id: "8", type: "divider", props: { style: "solid", color: "#374151", thickness: 1 } },
      { id: "9", type: "footer", props: { companyName: "Your Store", address: "", unsubscribeLink: true, socialLinks: false } }
    ]
  },
  {
    id: "welcome-new-user",
    name: "Welcome Email",
    category: "welcome",
    description: "Warm welcome for new subscribers",
    thumbnail: "👋",
    content: "",
    blocks: [
      { id: "1", type: "heading", props: { content: "Selamat Datang! 👋", level: 1, align: "center", color: "#ffffff" } },
      { id: "2", type: "text", props: { content: "Terima kasih telah bergabung dengan kami, {{first_name}}!", align: "center", color: "#e0e0e0", fontSize: "medium" } },
      { id: "3", type: "spacer", props: { height: 20 } },
      { id: "4", type: "heading", props: { content: "Apa yang bisa Anda lakukan?", level: 2, align: "left", color: "#ffffff" } },
      { id: "5", type: "text", props: { content: "✅ Buat campaign email pertama Anda\n✅ Import kontak dari CSV\n✅ Pilih template yang sesuai\n✅ Lacak performa email Anda", align: "left", color: "#ffffff", fontSize: "medium" } },
      { id: "6", type: "spacer", props: { height: 20 } },
      { id: "7", type: "button", props: { text: "Mulai Sekarang", link: "{{dashboard_link}}", backgroundColor: "#3b82f6", textColor: "#ffffff", align: "center", borderRadius: 8 } },
      { id: "8", type: "social", props: { platforms: [{ name: "facebook", url: "", icon: "facebook" }, { name: "instagram", url: "", icon: "instagram" }], align: "center" } },
      { id: "9", type: "footer", props: { companyName: "MailBlast", address: "", unsubscribeLink: true, socialLinks: false } }
    ]
  },
  {
    id: "announcement-product",
    name: "Product Announcement",
    category: "announcement",
    description: "Announce new product or feature",
    thumbnail: "🚀",
    content: "",
    blocks: [
      { id: "1", type: "heading", props: { content: "🎉 Fitur Baru!", level: 1, align: "center", color: "#ffffff" } },
      { id: "2", type: "heading", props: { content: "Email Builder Drag & Drop", level: 2, align: "center", color: "#3b82f6" } },
      { id: "3", type: "text", props: { content: "Sekarang Anda bisa membuat email yang cantik tanpa coding! Cukup drag & drop elemen yang Anda inginkan.", align: "center", color: "#e0e0e0", fontSize: "medium" } },
      { id: "4", type: "spacer", props: { height: 20 } },
      { id: "5", type: "heading", props: { content: "Fitur Unggulan:", level: 3, align: "left", color: "#ffffff" } },
      { id: "6", type: "text", props: { content: "🎨 9+ komponen siap pakai\n📱 Responsive design\n🔗 UTM tracking otomatis\n💾 Simpan sebagai template", align: "left", color: "#ffffff", fontSize: "medium" } },
      { id: "7", type: "spacer", props: { height: 20 } },
      { id: "8", type: "button", props: { text: "Coba Sekarang", link: "{{link}}", backgroundColor: "#10b981", textColor: "#ffffff", align: "center", borderRadius: 8 } },
      { id: "9", type: "footer", props: { companyName: "MailBlast", address: "", unsubscribeLink: true, socialLinks: false } }
    ]
  },
  {
    id: "promo-discount",
    name: "Discount Offer",
    category: "promo",
    description: "Special discount offer template",
    thumbnail: "🎁",
    content: "",
    blocks: [
      { id: "1", type: "heading", props: { content: "🎁 Penawaran Spesial!", level: 1, align: "center", color: "#ffffff" } },
      { id: "2", type: "text", props: { content: "Khusus untuk Anda, {{first_name}}!", align: "center", color: "#e0e0e0", fontSize: "medium" } },
      { id: "3", type: "spacer", props: { height: 10 } },
      { id: "4", type: "heading", props: { content: "DISKON 25%", level: 2, align: "center", color: "#fbbf24" } },
      { id: "5", type: "text", props: { content: "Untuk semua paket berlangganan", align: "center", color: "#ffffff", fontSize: "large" } },
      { id: "6", type: "spacer", props: { height: 20 } },
      { id: "7", type: "text", props: { content: "Gunakan kode promo:", align: "center", color: "#9ca3af", fontSize: "small" } },
      { id: "8", type: "heading", props: { content: "SPECIAL25", level: 2, align: "center", color: "#3b82f6" } },
      { id: "9", type: "spacer", props: { height: 20 } },
      { id: "10", type: "button", props: { text: "Klaim Sekarang", link: "{{link}}", backgroundColor: "#3b82f6", textColor: "#ffffff", align: "center", borderRadius: 8 } },
      { id: "11", type: "text", props: { content: "Berlaku hingga 31 Desember 2024", align: "center", color: "#6b7280", fontSize: "small" } },
      { id: "12", type: "footer", props: { companyName: "Your Company", address: "", unsubscribeLink: true, socialLinks: false } }
    ]
  },
  {
    id: "newsletter-minimal",
    name: "Minimal Newsletter",
    category: "newsletter",
    description: "Simple and clean newsletter design",
    thumbnail: "📰",
    content: "",
    blocks: [
      { id: "1", type: "text", props: { content: "NEWSLETTER", align: "center", color: "#6b7280", fontSize: "small" } },
      { id: "2", type: "heading", props: { content: "Update Bulanan", level: 1, align: "center", color: "#ffffff" } },
      { id: "3", type: "text", props: { content: "Desember 2024", align: "center", color: "#9ca3af", fontSize: "small" } },
      { id: "4", type: "divider", props: { style: "solid", color: "#374151", thickness: 1 } },
      { id: "5", type: "heading", props: { content: "Artikel Pilihan", level: 2, align: "left", color: "#ffffff" } },
      { id: "6", type: "text", props: { content: "Tips meningkatkan deliverability email Anda. Baca selengkapnya tentang cara menghindari spam folder dan meningkatkan open rate.", align: "left", color: "#d1d5db", fontSize: "medium" } },
      { id: "7", type: "button", props: { text: "Baca Artikel", link: "{{link}}", backgroundColor: "transparent", textColor: "#3b82f6", align: "left", borderRadius: 0 } },
      { id: "8", type: "spacer", props: { height: 20 } },
      { id: "9", type: "heading", props: { content: "Tips & Trik", level: 2, align: "left", color: "#ffffff" } },
      { id: "10", type: "text", props: { content: "Cara membuat subject line yang menarik dan meningkatkan open rate hingga 40%.", align: "left", color: "#d1d5db", fontSize: "medium" } },
      { id: "11", type: "divider", props: { style: "solid", color: "#374151", thickness: 1 } },
      { id: "12", type: "footer", props: { companyName: "Your Company", address: "", unsubscribeLink: true, socialLinks: true } }
    ]
  }
];
