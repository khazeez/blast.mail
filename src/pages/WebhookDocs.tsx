import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Webhook, Shield, RefreshCw, Bell, Code, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const events = [
  { name: "contact.created", desc: "Dipicu saat kontak baru ditambahkan (manual, import CSV, atau sync Google Sheets)." },
  { name: "contact.updated", desc: "Dipicu saat data kontak diperbarui (nama, email, list, tags)." },
  { name: "contact.deleted", desc: "Dipicu saat kontak dihapus dari sistem." },
  { name: "contact.unsubscribed", desc: "Dipicu saat kontak berhenti berlangganan (status berubah ke unsubscribed)." },
  { name: "campaign.created", desc: "Dipicu saat campaign baru dibuat." },
  { name: "campaign.sent", desc: "Dipicu saat campaign selesai dikirim ke semua penerima." },
  { name: "campaign.opened", desc: "Dipicu saat penerima membuka email campaign (coming soon)." },
  { name: "campaign.clicked", desc: "Dipicu saat penerima mengklik link di email campaign (coming soon)." },
  { name: "list.created", desc: "Dipicu saat list/daftar kontak baru dibuat." },
  { name: "list.deleted", desc: "Dipicu saat list/daftar kontak dihapus." },
];

const WebhookDocs = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 mb-2"
            onClick={() => navigate("/integrations")}
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Integrasi
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Webhook className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dokumentasi Webhook</h1>
              <p className="text-sm text-muted-foreground">
                Panduan lengkap untuk menggunakan webhook MailBlast.
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-4 w-4" /> Apa itu Webhook?
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Webhook memungkinkan MailBlast mengirim notifikasi HTTP POST secara real-time ke URL server Anda
              setiap kali event tertentu terjadi. Ini sangat berguna untuk:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Sinkronisasi data ke CRM atau sistem internal Anda</li>
              <li>Mengirim notifikasi ke Slack, Telegram, atau Discord</li>
              <li>Menjalankan automasi di Zapier, Make, atau n8n</li>
              <li>Logging dan monitoring aktivitas email marketing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cara Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, text: "Buka halaman Integrasi → klik Konfigurasi pada card Webhooks." },
                { step: 2, text: "Klik \"Tambah Webhook\" dan masukkan URL endpoint Anda." },
                { step: 3, text: "Pilih event yang ingin Anda subscribe." },
                { step: 4, text: "Simpan. Signing secret akan dibuat otomatis — simpan secret ini untuk verifikasi." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payload Format */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-4 w-4" /> Format Payload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Setiap webhook dikirim sebagai HTTP <Badge variant="secondary" className="text-[11px]">POST</Badge> dengan
              body JSON dan header berikut:
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Headers</h4>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                <div><span className="text-muted-foreground">Content-Type:</span> application/json</div>
                <div><span className="text-muted-foreground">X-Webhook-Event:</span> contact.created</div>
                <div><span className="text-muted-foreground">X-Webhook-Signature:</span> a1b2c3d4e5...</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Body</h4>
              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`{
  "event": "contact.created",
  "timestamp": "2026-02-21T10:30:00.000Z",
  "data": {
    "id": "uuid-kontak",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "subscribed",
    "list_id": "uuid-list"
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border/60">
              {events.map((ev) => (
                <div key={ev.name} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="font-mono text-[11px] shrink-0 mt-0.5">
                      {ev.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" /> Verifikasi Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Setiap request webhook menyertakan header <code className="bg-muted px-1.5 py-0.5 rounded text-xs">X-Webhook-Signature</code> yang
              berisi HMAC-SHA256 dari body request menggunakan signing secret Anda. Selalu verifikasi signature
              untuk memastikan request benar-benar dari MailBlast.
            </p>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Node.js / Express</h4>
              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Proses webhook
  const { event, data } = req.body;
  console.log(\`Event: \${event}\`, data);

  res.status(200).json({ received: true });
});`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Python / Flask</h4>
              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`import hmac, hashlib, os
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    body = request.get_data(as_text=True)

    expected = hmac.new(
        os.environ['WEBHOOK_SECRET'].encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return jsonify(error='Invalid signature'), 401

    data = request.json
    print(f"Event: {data['event']}", data['data'])

    return jsonify(received=True), 200`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">PHP</h4>
              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`<?php
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];
$body = file_get_contents('php://input');

$expected = hash_hmac('sha256', $body, getenv('WEBHOOK_SECRET'));

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$payload = json_decode($body, true);
error_log("Event: " . $payload['event']);

http_response_code(200);
echo json_encode(['received' => true]);`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Retry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Retry & Error Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jika endpoint Anda mengembalikan status code selain 2xx, MailBlast akan otomatis retry
              dengan mekanisme berikut:
            </p>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left font-medium">Attempt</th>
                    <th className="px-4 py-2 text-left font-medium">Delay</th>
                    <th className="px-4 py-2 text-left font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 text-muted-foreground">1</td>
                    <td className="px-4 py-2 text-muted-foreground">Langsung</td>
                    <td className="px-4 py-2 text-muted-foreground">Pengiriman pertama</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 text-muted-foreground">2</td>
                    <td className="px-4 py-2 text-muted-foreground">~4 detik</td>
                    <td className="px-4 py-2 text-muted-foreground">Retry pertama (exponential backoff)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">3</td>
                    <td className="px-4 py-2 text-muted-foreground">~8 detik</td>
                    <td className="px-4 py-2 text-muted-foreground">Retry terakhir</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Semua delivery attempt (berhasil maupun gagal) tercatat di <strong>Delivery Logs</strong> yang
              bisa dilihat dari dialog konfigurasi Webhook.
            </p>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li><strong>Selalu verifikasi signature</strong> — Jangan proses webhook tanpa validasi HMAC terlebih dahulu.</li>
              <li><strong>Respond dengan cepat</strong> — Kembalikan status 200 segera, lalu proses data secara asinkron jika perlu.</li>
              <li><strong>Handle duplikasi</strong> — Karena retry, endpoint Anda mungkin menerima event yang sama lebih dari sekali. Gunakan field <code className="bg-muted px-1 rounded">id</code> dalam data untuk deduplikasi.</li>
              <li><strong>Gunakan HTTPS</strong> — Selalu gunakan URL endpoint dengan HTTPS untuk keamanan data.</li>
              <li><strong>Monitor delivery logs</strong> — Cek logs secara berkala untuk memastikan webhook terkirim dengan baik.</li>
              <li><strong>Simpan secret dengan aman</strong> — Jangan hardcode signing secret di kode. Gunakan environment variable.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Example: Zapier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contoh: Integrasi dengan Zapier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {[
                "Buat Zap baru di Zapier → pilih trigger \"Webhooks by Zapier\" → \"Catch Hook\".",
                "Copy URL webhook yang diberikan Zapier.",
                "Di MailBlast, buka Integrasi → Webhooks → Tambah Webhook, paste URL tersebut.",
                "Pilih event yang diinginkan (misal: contact.created).",
                "Kembali ke Zapier, test trigger untuk menerima sample data.",
                "Tambahkan action sesuai kebutuhan (misal: kirim ke Google Sheets, Slack, dll).",
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WebhookDocs;
