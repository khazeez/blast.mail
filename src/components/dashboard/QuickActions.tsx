import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";

export function QuickActions() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="flex gap-2">
      <Button size="sm" className="gap-2 shadow-sm" onClick={() => navigate("/campaigns/new")}>
        <Plus className="h-4 w-4" />
        {t("dashboard.newCampaign")}
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/contacts")}>
        <UserPlus className="h-4 w-4" />
        {t("dashboard.addContacts")}
      </Button>
    </div>
  );
}
