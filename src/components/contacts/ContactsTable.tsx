import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/hooks/use-i18n";
import { format } from "date-fns";
import type { Contact } from "@/pages/Contacts";

interface ContactsTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectionChange: (ids: string[]) => void;
}

const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
  subscribed: "default",
  unsubscribed: "secondary",
  bounced: "destructive",
};

export function ContactsTable({
  contacts,
  selectedContacts,
  onSelectionChange,
}: ContactsTableProps) {
  const { t } = useI18n();
  const allSelected =
    contacts.length > 0 && selectedContacts.length === contacts.length;

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : contacts.map((c) => c.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(
      selectedContacts.includes(id)
        ? selectedContacts.filter((i) => i !== id)
        : [...selectedContacts, id]
    );
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>{t("contacts.name")}</TableHead>
              <TableHead>{t("contacts.email")}</TableHead>
              <TableHead>{t("contacts.tags")}</TableHead>
              <TableHead>{t("contacts.list")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("contacts.added")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t("contacts.noContacts")}
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleOne(contact.id)}
                      aria-label={`Select ${contact.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{contact.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(contact.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.list_name || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[contact.status]} className="capitalize">
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {format(new Date(contact.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
