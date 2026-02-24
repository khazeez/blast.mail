import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Facebook, Globe, Smartphone, MessageSquare, ExternalLink, Settings2, Sheet, Webhook, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleSheetsDialog } from "@/components/integrations/GoogleSheetsDialog";
import { WebhooksDialog } from "@/components/integrations/WebhooksDialog";
import { N8nDialog } from "@/components/integrations/N8nDialog";

interface Integration {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  status: "coming_soon" | "available" | "real";
  color: string;
}

const integrations: Integration[] = [
  {
    id: "google-sheets",
    icon: Sheet,
    name: "Google Sheets",
    description: "Sinkronkan kontak dari Google Sheets / Google Form ke daftar kontak Anda secara otomatis.",
    status: "real",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "webhooks",
    icon: Webhook,
    name: "Webhooks",
    description: "Kirim notifikasi real-time ke URL Anda saat event terjadi (kontak baru, campaign terkirim, dll).",
    status: "real",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    id: "n8n",
    icon: Zap,
    name: "n8n",
    description: "Connect n8n untuk membuat automasi email visual dengan workflow builder yang powerful.",
    status: "real",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    id: "facebook-ads",
    icon: Facebook,
    name: "Facebook Ads",
    description: "Impor leads dari Facebook Lead Ads langsung ke daftar kontak Anda secara otomatis.",
    status: "available",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "wordpress",
    icon: Globe,
    name: "WordPress",
    description: "Pasang plugin untuk capture subscriber dari form WordPress ke MailBlast.",
    status: "available",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "whatsapp",
    icon: Smartphone,
    name: "Tombol WhatsApp",
    description: "Tambahkan floating WhatsApp button di website Anda untuk komunikasi langsung.",
    status: "available",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "telegram",
    icon: MessageSquare,
    name: "Telegram",
    description: "Kirim notifikasi campaign dan broadcast langsung melalui Telegram Bot.",
    status: "available",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
];

const Integrations = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const [webhooksOpen, setWebhooksOpen] = useState(false);
  const [n8nOpen, setN8nOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (id: string) => {
    if (id === "google-sheets") { setSheetsOpen(true); return; }
    if (id === "webhooks") { setWebhooksOpen(true); return; }
    if (id === "n8n") { setN8nOpen(true); return; }
    setEnabled((prev) => {
      const next = !prev[id];
      toast.info(
        next
          ? "Integrasi diaktifkan — konfigurasi segera hadir!"
          : "Integrasi dinonaktifkan."
      );
      return { ...prev, [id]: next };
    });
  };

  const handleConfigure = (id: string) => {
    if (id === "google-sheets") { setSheetsOpen(true); return; }
    if (id === "webhooks") { setWebhooksOpen(true); return; }
    if (id === "n8n") { setN8nOpen(true); return; }
    toast.info("Konfigurasi detail segera hadir di update berikutnya!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrasi</h1>
          <p className="text-sm text-muted-foreground">
            Hubungkan MailBlast dengan platform favorit Anda.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="group border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${integration.color} transition-transform group-hover:scale-110`}
                    >
                      <integration.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge variant={integration.status === "real" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                          {integration.status === "real" ? "Aktif" : "Preview"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                  {integration.status === "real" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleConfigure(integration.id)}
                    >
                      <Settings2 className="h-3.5 w-3.5" /> Konfigurasi
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!enabled[integration.id]}
                        onCheckedChange={() => handleToggle(integration.id)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {enabled[integration.id] ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {integration.status !== "real" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        disabled={!enabled[integration.id]}
                        onClick={() => handleConfigure(integration.id)}
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Konfigurasi
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        if (integration.id === "webhooks") {
                          navigate("/integrations/webhook-docs");
                        } else {
                          toast.info("Dokumentasi segera tersedia!");
                        }
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">Integrasi lainnya segera hadir</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Google Sheets, Zapier, dan lainnya sedang dalam pengembangan.
            </p>
          </CardContent>
        </Card>
      </div>

      <GoogleSheetsDialog open={sheetsOpen} onOpenChange={setSheetsOpen} />
      <WebhooksDialog open={webhooksOpen} onOpenChange={setWebhooksOpen} />
      <N8nDialog open={n8nOpen} onOpenChange={setN8nOpen} />
    </DashboardLayout>
  );
};

export default Integrations;
