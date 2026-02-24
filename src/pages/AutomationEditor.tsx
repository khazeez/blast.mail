import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Play, Save, Plus, Mail, Clock, UserPlus, Tag, 
  MousePointer, Trash2, GripVertical, Zap, ArrowRight, Settings,
  X, Check, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type TriggerType = "subscribe" | "tag_added" | "tag_removed" | "date" | "click" | "open" | "purchase";
type ActionType = "send_email" | "wait" | "add_tag" | "remove_tag" | "condition" | "webhook";

interface WorkflowNode {
  id: string;
  type: "trigger" | "action";
  subType: TriggerType | ActionType;
  name: string;
  config: Record<string, any>;
  x: number;
  y: number;
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const triggerOptions: { value: TriggerType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "subscribe", label: "Subscribes to list", icon: UserPlus },
  { value: "tag_added", label: "Tag is added", icon: Tag },
  { value: "tag_removed", label: "Tag is removed", icon: Tag },
  { value: "date", label: "Specific date", icon: Clock },
  { value: "click", label: "Clicks a link", icon: MousePointer },
  { value: "open", label: "Opens an email", icon: Mail },
];

const actionOptions: { value: ActionType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "send_email", label: "Send email", icon: Mail },
  { value: "wait", label: "Wait", icon: Clock },
  { value: "add_tag", label: "Add tag", icon: Tag },
  { value: "remove_tag", label: "Remove tag", icon: Tag },
  { value: "condition", label: "Condition (If/Else)", icon: Zap },
];

const AutomationEditor = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("New Automation");
  const [description, setDescription] = useState("");
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: "trigger-1",
      type: "trigger",
      subType: "subscribe",
      name: "When someone subscribes",
      config: { list: "Newsletter" },
      x: 0,
      y: 0,
    },
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);

  const addNode = (type: ActionType) => {
    const newNode: WorkflowNode = {
      id: `action-${Date.now()}`,
      type: "action",
      subType: type,
      name: actionOptions.find(a => a.value === type)?.label || "",
      config: {},
      x: 0,
      y: nodes.length * 120 + 120,
    };
    setNodes([...nodes, newNode]);
    setShowAddAction(false);
    setSelectedNode(newNode);
  };

  const updateNodeConfig = (id: string, config: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, config: { ...n.config, ...config } } : n));
  };

  const deleteNode = (id: string) => {
    if (nodes.find(n => n.id === id)?.type === "trigger") return;
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    setSelectedNode(null);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/automations")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-semibold border-none h-auto p-0 focus-visible:ring-0"
              />
              <p className="text-sm text-muted-foreground">Automation workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Test
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save & Activate
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Node Types */}
          <div className="w-64 border-r bg-muted/30 p-4">
            <h3 className="font-medium text-sm mb-3">Add Steps</h3>
            <div className="space-y-2">
              {actionOptions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.value}
                    onClick={() => addNode(action.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-background transition-all text-left"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-sm mb-3">Settings</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="What does this automation do?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-8 bg-slate-50">
            <div className="max-w-2xl mx-auto">
              {/* Workflow Visual */}
              <div className="space-y-2">
                {nodes.map((node, index) => {
                  const isTrigger = node.type === "trigger";
                  const Icon = isTrigger 
                    ? triggerOptions.find(t => t.value === node.subType)?.icon || Zap
                    : actionOptions.find(a => a.value === node.subType)?.icon || Zap;

                  return (
                    <div key={node.id}>
                      {/* Connector Line */}
                      {index > 0 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-8 bg-slate-300" />
                        </div>
                      )}

                      {/* Node Card */}
                      <Card
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedNode?.id === node.id && "ring-2 ring-primary ring-offset-2",
                          isTrigger && "border-primary/50"
                        )}
                        onClick={() => setSelectedNode(node)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              isTrigger ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "h-5 w-5",
                                isTrigger ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{node.name}</span>
                                {isTrigger && (
                                  <Badge variant="secondary" className="text-xs">Trigger</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {isTrigger 
                                  ? `List: ${node.config.list || "Select list"}`
                                  : node.subType === "send_email"
                                  ? node.config.subject || "Configure email"
                                  : node.subType === "wait"
                                  ? `Wait ${node.config.duration || 1} ${node.config.unit || "days"}`
                                  : node.subType === "add_tag"
                                  ? `Add: ${node.config.tag || "Select tag"}`
                                  : node.subType === "remove_tag"
                                  ? `Remove: ${node.config.tag || "Select tag"}`
                                  : "Click to configure"
                                }
                              </p>
                            </div>
                            {!isTrigger && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNode(node.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}

                {/* Add Step Button */}
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowAddAction(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Config Panel */}
          {selectedNode && (
            <div className="w-80 border-l bg-background">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">Configure</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="p-4 space-y-4">
                  {/* Trigger Config */}
                  {selectedNode.type === "trigger" && (
                    <>
                      <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <Select value={selectedNode.subType} onValueChange={(v) => {
                          const icon = triggerOptions.find(t => t.value === v)?.icon || Zap;
                          setNodes(nodes.map(n => 
                            n.id === selectedNode.id 
                              ? { ...n, subType: v as TriggerType, name: triggerOptions.find(t => t.value === v)?.label || "" }
                              : n
                          ));
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {triggerOptions.map((t) => {
                              const I = t.icon;
                              return (
                                <SelectItem key={t.value} value={t.value}>
                                  <div className="flex items-center gap-2">
                                    <I className="h-4 w-4" />
                                    {t.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedNode.subType === "subscribe" && (
                        <div className="space-y-2">
                          <Label>List</Label>
                          <Select 
                            value={selectedNode.config.list} 
                            onValueChange={(v) => updateNodeConfig(selectedNode.id, { list: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select list" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Newsletter">Newsletter</SelectItem>
                              <SelectItem value="Promotions">Promotions</SelectItem>
                              <SelectItem value="Updates">Updates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {selectedNode.subType === "tag_added" && (
                        <div className="space-y-2">
                          <Label>Tag</Label>
                          <Select 
                            value={selectedNode.config.tag}
                            onValueChange={(v) => updateNodeConfig(selectedNode.id, { tag: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Config */}
                  {selectedNode.type === "action" && (
                    <>
                      <div className="space-y-2">
                        <Label>Action Type</Label>
                        <Select value={selectedNode.subType} onValueChange={(v) => {
                          setNodes(nodes.map(n => 
                            n.id === selectedNode.id 
                              ? { ...n, subType: v as ActionType, name: actionOptions.find(a => a.value === v)?.label || "" }
                              : n
                          ));
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionOptions.map((a) => {
                              const I = a.icon;
                              return (
                                <SelectItem key={a.value} value={a.value}>
                                  <div className="flex items-center gap-2">
                                    <I className="h-4 w-4" />
                                    {a.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedNode.subType === "send_email" && (
                        <>
                          <div className="space-y-2">
                            <Label>Email Template</Label>
                            <Select 
                              value={selectedNode.config.template}
                              onValueChange={(v) => updateNodeConfig(selectedNode.id, { template: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="welcome-1">Welcome Email #1</SelectItem>
                                <SelectItem value="welcome-2">Welcome Email #2</SelectItem>
                                <SelectItem value="promo">Promo Email</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                              placeholder="Email subject"
                              value={selectedNode.config.subject || ""}
                              onChange={(e) => updateNodeConfig(selectedNode.id, { subject: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>From Name</Label>
                            <Input
                              placeholder="Your Company"
                              value={selectedNode.config.fromName || ""}
                              onChange={(e) => updateNodeConfig(selectedNode.id, { fromName: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      {selectedNode.subType === "wait" && (
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={selectedNode.config.duration || 1}
                              onChange={(e) => updateNodeConfig(selectedNode.id, { duration: parseInt(e.target.value) })}
                              className="w-20"
                            />
                            <Select 
                              value={selectedNode.config.unit || "days"}
                              onValueChange={(v) => updateNodeConfig(selectedNode.id, { unit: v })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {(selectedNode.subType === "add_tag" || selectedNode.subType === "remove_tag") && (
                        <div className="space-y-2">
                          <Label>Tag</Label>
                          <Select 
                            value={selectedNode.config.tag}
                            onValueChange={(v) => updateNodeConfig(selectedNode.id, { tag: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Add Action Dialog */}
      <Dialog open={showAddAction} onOpenChange={setShowAddAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {actionOptions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  onClick={() => addNode(action.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AutomationEditor;
