import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, Zap, Play, Pause, Mail, UserPlus, Clock, Tag, 
  MousePointer, MoreVertical, Edit, Trash2, Copy, ExternalLink, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { N8nDialog } from "@/components/integrations/N8nDialog";

interface Automation {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  trigger: string;
  triggerType: "subscribe" | "tag" | "date" | "click" | "open";
  enrolled: number;
  completed: number;
  lastRun: string;
  createdAt: string;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Welcome Series",
    description: "Send 3 welcome emails to new subscribers",
    status: "active",
    trigger: "When someone subscribes to 'Newsletter'",
    triggerType: "subscribe",
    enrolled: 1234,
    completed: 890,
    lastRun: "2 hours ago",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Abandoned Cart Recovery",
    description: "Remind customers about abandoned carts",
    status: "active",
    trigger: "When tag 'abandoned_cart' is added",
    triggerType: "tag",
    enrolled: 567,
    completed: 234,
    lastRun: "5 hours ago",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Birthday Campaign",
    description: "Send birthday wishes with special offer",
    status: "paused",
    trigger: "On subscriber's birthday",
    triggerType: "date",
    enrolled: 234,
    completed: 0,
    lastRun: "1 day ago",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Re-engagement Series",
    description: "Win back inactive subscribers",
    status: "draft",
    trigger: "When no open in 30 days",
    triggerType: "open",
    enrolled: 0,
    completed: 0,
    lastRun: "Never",
    createdAt: "2024-02-10",
  },
];

const triggerIcons: Record<string, React.FC<{ className?: string }>> = {
  subscribe: UserPlus,
  tag: Tag,
  date: Clock,
  click: MousePointer,
  open: Mail,
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-200",
  paused: "bg-amber-500/10 text-amber-600 border-amber-200",
  draft: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const Automations = () => {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState(mockAutomations);
  const [n8nConnected, setN8nConnected] = useState(false);
  const [n8nOpen, setN8nOpen] = useState(false);

  const toggleStatus = (id: string) => {
    setAutomations(automations.map(a => 
      a.id === id 
        ? { ...a, status: a.status === "active" ? "paused" : "active" }
        : a
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Automation</h1>
            <p className="text-sm text-muted-foreground">
              Create automated email workflows to engage your audience
            </p>
          </div>
          <Button className="gap-2" onClick={() => n8nConnected ? navigate("/automations/new") : setN8nOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Automation
          </Button>
        </div>

        {/* n8n Connection Banner */}
        {!n8nConnected && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
            <Zap className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Connect n8n</span>
                <span className="text-muted-foreground ml-2">
                  — Automation powered by n8n workflow builder. Connect to create workflows.
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-4 gap-2"
                onClick={() => setN8nOpen(true)}
              >
                <Zap className="h-4 w-4" />
                Connect n8n
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {n8nConnected && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium text-green-700 dark:text-green-400">n8n Connected</span>
                <span className="text-muted-foreground ml-2">
                  — You can create and manage email automation workflows.
                </span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-4 gap-2"
                onClick={() => window.open("https://n8n.io", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Open n8n
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {automations.filter(a => a.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + a.enrolled, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + a.completed, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">72%</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation List */}
        <div className="space-y-4">
          {automations.map((automation) => {
            const TriggerIcon = triggerIcons[automation.triggerType];
            return (
              <Card key={automation.id} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        automation.status === "active" 
                          ? "bg-green-500/10" 
                          : automation.status === "paused"
                          ? "bg-amber-500/10"
                          : "bg-muted"
                      }`}>
                        <Zap className={`h-5 w-5 ${
                          automation.status === "active"
                            ? "text-green-600"
                            : automation.status === "paused"
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{automation.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={statusColors[automation.status]}
                          >
                            {automation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {automation.description}
                        </p>
                        <div className="flex items-center gap-4 pt-2 text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <TriggerIcon className="h-4 w-4" />
                            {automation.trigger}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>{automation.enrolled.toLocaleString()}</strong> enrolled
                          </span>
                          <span className="text-muted-foreground">
                            <strong>{automation.completed.toLocaleString()}</strong> completed
                          </span>
                          <span className="text-muted-foreground">
                            Last run: {automation.lastRun}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {automation.status !== "draft" && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={automation.status === "active"}
                            onCheckedChange={() => toggleStatus(automation.id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {automation.status === "active" ? "On" : "Off"}
                          </span>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/automations/${automation.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <N8nDialog 
        open={n8nOpen} 
        onOpenChange={(open) => {
          setN8nOpen(open);
          if (!open) setN8nConnected(true);
        }} 
      />
    </DashboardLayout>
  );
};

export default Automations;
