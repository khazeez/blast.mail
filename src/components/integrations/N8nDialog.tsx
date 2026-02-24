import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, ExternalLink, Copy, Check, Globe, Cloud, 
  Webhook, Key, ArrowRight, Play
} from "lucide-react";
import { toast } from "sonner";

interface N8nDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function N8nDialog({ open, onOpenChange }: N8nDialogProps) {
  const [copied, setCopied] = useState(false);
  const [n8nType, setN8nType] = useState<"cloud" | "self-hosted">("cloud");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");

  const mailblastWebhookUrl = "https://your-mailblast-instance.com/api/webhooks/n8n";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleConnect = () => {
    if (n8nType === "cloud" && !instanceUrl) {
      toast.error("Please enter your n8n.cloud instance URL");
      return;
    }
    if (n8nType === "self-hosted" && (!instanceUrl || !apiKey)) {
      toast.error("Please enter your n8n URL and API key");
      return;
    }
    toast.success("n8n connected! You can now create automations.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Connect n8n
          </DialogTitle>
          <DialogDescription>
            Connect n8n to create powerful email automations with visual workflow builder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2 -mr-2">
          {/* What you can do */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Trigger Workflows</p>
                <p className="text-xs text-muted-foreground">
                  Start n8n workflows when subscribers join, click, or open
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Webhook className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Send Webhooks</p>
                <p className="text-xs text-muted-foreground">
                  Send data to n8n from campaigns and events
                </p>
              </div>
            </div>
          </div>

          <Tabs value={n8nType} onValueChange={(v) => setN8nType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cloud" className="gap-2">
                <Cloud className="h-4 w-4" />
                n8n.cloud
              </TabsTrigger>
              <TabsTrigger value="self-hosted" className="gap-2">
                <Globe className="h-4 w-4" />
                Self-Hosted
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cloud" className="space-y-4">
              <div className="space-y-2">
                <Label>Your n8n.cloud Instance</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="your-workspace.app.n8n.cloud"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your n8n.cloud workspace URL (e.g., mycompany.app.n8n.cloud)
                </p>
              </div>

              <div className="space-y-2">
                <Label>MailBlast Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={mailblastWebhookUrl}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(mailblastWebhookUrl)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this URL in your n8n workflows to receive data from MailBlast
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium mb-2">Setup Instructions</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to your n8n.cloud dashboard</li>
                  <li>Create a new workflow with a Webhook trigger</li>
                  <li>Copy the MailBlast Webhook URL above</li>
                  <li>Paste it in n8n's Webhook node</li>
                  <li>Connect your workflow nodes</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="self-hosted" className="space-y-4">
              <div className="space-y-2">
                <Label>n8n Instance URL</Label>
                <Input
                  placeholder="https://n8n.yourcompany.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Your n8n API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Generate an API key in n8n Settings → API → Create API Key
                </p>
              </div>

              <div className="space-y-2">
                <Label>MailBlast Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={mailblastWebhookUrl}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(mailblastWebhookUrl)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Example Workflows */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Example Workflows
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Welcome Series", icon: "📧" },
                { name: "Lead Scoring", icon: "⭐" },
                { name: "Re-engagement", icon: "🔄" },
              ].map((workflow) => (
                <button
                  key={workflow.name}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                >
                  <span className="text-lg">{workflow.icon}</span>
                  <span className="text-xs font-medium">{workflow.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t mt-4">
          <Button
            variant="ghost"
            onClick={() => window.open("https://n8n.io", "_blank")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open n8n
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} className="gap-2">
              <Zap className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
