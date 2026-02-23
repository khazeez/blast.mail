import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface ListOption {
  id: string;
  name: string;
}

interface ContactFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  listFilter: string;
  onListChange: (value: string) => void;
  lists: ListOption[];
}

export function ContactFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  listFilter,
  onListChange,
  lists,
}: ContactFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("contacts.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("common.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("contacts.allStatus")}</SelectItem>
          <SelectItem value="subscribed">{t("contacts.subscribed")}</SelectItem>
          <SelectItem value="unsubscribed">{t("contacts.unsubscribed")}</SelectItem>
          <SelectItem value="bounced">{t("contacts.bounced")}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={listFilter} onValueChange={onListChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("contacts.list")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("contacts.allLists")}</SelectItem>
          {lists.map((list) => (
            <SelectItem key={list.id} value={list.id}>
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
