import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { ContactFilters } from "@/components/contacts/ContactFilters";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { ManageListsDialog } from "@/components/contacts/ManageListsDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Upload, Download, Trash2, List } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export type Contact = Tables<"contacts"> & { list_name?: string };

const Contacts = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [listFilter, setListFilter] = useState<string>("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [listsDialogOpen, setListsDialogOpen] = useState(false);

  // Fetch lists
  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lists").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch contacts with list name
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, lists(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((c: any) => ({
        ...c,
        tags: c.tags ?? [],
        list_name: c.lists?.name ?? "",
      }));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("contacts").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedContacts([]);
      toast.success("Contacts deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Client-side filtering
  const filtered = contacts.filter((c) => {
    const matchSearch =
      (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchList = listFilter === "all" || c.list_id === listFilter;
    return matchSearch && matchStatus && matchList;
  });

  const listNames = lists.map((l) => ({ id: l.id, name: l.name }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("contacts.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("contacts.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            {selectedContacts.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => deleteMutation.mutate(selectedContacts)}
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedContacts.length})
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setListsDialogOpen(true)}>
              <List className="h-4 w-4" />
              {t("contacts.manageLists")}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              {t("contacts.importCSV")}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {t("contacts.export")}
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              {t("contacts.addContact")}
            </Button>
          </div>
        </div>

        <ContactFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          listFilter={listFilter}
          onListChange={setListFilter}
          lists={listNames}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <ContactsTable
            contacts={filtered}
            selectedContacts={selectedContacts}
            onSelectionChange={setSelectedContacts}
          />
        )}

        <AddContactDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} lists={listNames} />
        <ManageListsDialog open={listsDialogOpen} onOpenChange={setListsDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
