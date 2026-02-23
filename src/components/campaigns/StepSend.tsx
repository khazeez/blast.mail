import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Clock } from "lucide-react";
import type { CampaignData } from "@/pages/CampaignCreate";

interface StepSendProps {
  data: CampaignData;
  onChange: (partial: Partial<CampaignData>) => void;
}

export function StepSend({ data, onChange }: StepSendProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-medium">Send Options</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={data.scheduleType}
          onValueChange={(v) => onChange({ scheduleType: v as "now" | "later" })}
          className="space-y-4"
        >
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-4 transition-colors hover:bg-accent has-[data-state=checked]:border-primary has-[data-state=checked]:bg-accent">
            <RadioGroupItem value="now" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Send Now</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Campaign will be sent immediately to all recipients.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-4 transition-colors hover:bg-accent has-[data-state=checked]:border-primary has-[data-state=checked]:bg-accent">
            <RadioGroupItem value="later" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <p className="text-sm font-medium">Schedule for Later</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose a date and time to send the campaign.
              </p>
              {data.scheduleType === "later" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={data.scheduleDate}
                      onChange={(e) => onChange({ scheduleDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={data.scheduleTime}
                      onChange={(e) => onChange({ scheduleTime: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
