import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CampaignData } from "@/pages/CampaignCreate";

interface StepRecipientsProps {
  data: CampaignData;
  onChange: (partial: Partial<CampaignData>) => void;
}

export function StepRecipients({ data, onChange }: StepRecipientsProps) {
  const { data: lists = [] } = useQuery({
    queryKey: ["lists-with-count"],
    queryFn: async () => {
      const { data: listsData, error } = await supabase.from("lists").select("id, name");
      if (error) throw error;
      // Get contact counts per list
      const counts = await Promise.all(
        (listsData ?? []).map(async (l) => {
          const { count } = await supabase.from("contacts").select("id", { count: "exact", head: true }).eq("list_id", l.id);
          return { ...l, count: count ?? 0 };
        })
      );
      return counts;
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g. Weekly Newsletter #43"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">Select Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          {lists.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No lists yet. Create a list first in Contacts.</p>
          ) : (
            <RadioGroup
              value={data.list}
              onValueChange={(v) => onChange({ list: v })}
              className="space-y-3"
            >
              {lists.map((list) => (
                <label
                  key={list.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 p-4 transition-colors hover:bg-accent has-[data-state=checked]:border-primary has-[data-state=checked]:bg-accent"
                >
                  <RadioGroupItem value={list.id} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{list.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {list.count.toLocaleString()} contacts
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
