import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Trash2 } from "lucide-react";

interface ManageListsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageListsDialog({ open, onOpenChange }: ManageListsDialogProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lists").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("lists").insert({
        user_id: user.id,
        name: newName,
        description: newDesc || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success(`List "${newName}" created!`);
      setNewName("");
      setNewDesc("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("List deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("contacts.manageLists")}</DialogTitle>
          <DialogDescription>{t("contacts.manageListsDesc")}</DialogDescription>
        </DialogHeader>

        {/* Existing lists */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {lists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No lists yet.</p>
          ) : (
            lists.map((list) => (
              <div key={list.id} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{list.name}</p>
                  {list.description && (
                    <p className="text-xs text-muted-foreground">{list.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(list.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Create new list */}
        <form onSubmit={handleCreate} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">{t("contacts.createList")}</p>
          <div className="space-y-2">
            <Label htmlFor="list-name">{t("contacts.name")}</Label>
            <Input
              id="list-name"
              placeholder="e.g. VIP Customers"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-desc">Description</Label>
            <Input
              id="list-desc"
              placeholder="Optional description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
              {t("contacts.createList")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
