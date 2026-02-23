import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignStepper } from "@/components/campaigns/CampaignStepper";
import { StepRecipients } from "@/components/campaigns/StepRecipients";
import { StepContent } from "@/components/campaigns/StepContent";
import { StepReview } from "@/components/campaigns/StepReview";
import { StepSend } from "@/components/campaigns/StepSend";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface CampaignData {
  name: string;
  subject: string;
  previewText: string;
  list: string;
  template: string;
  content: string;
  scheduleType: "now" | "later";
  scheduleDate: string;
  scheduleTime: string;
}

const initialData: CampaignData = {
  name: "",
  subject: "",
  previewText: "",
  list: "",
  template: "",
  content: "",
  scheduleType: "now",
  scheduleDate: "",
  scheduleTime: "",
};

const steps = ["Recipients", "Content", "Review", "Send"];

const CampaignCreate = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CampaignData>(initialData);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const update = (partial: Partial<CampaignData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const canNext = () => {
    if (step === 0) return !!data.name && !!data.list;
    if (step === 1) return !!data.subject && !!data.content;
    return true;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const scheduled_at =
        data.scheduleType === "later" && data.scheduleDate
          ? new Date(`${data.scheduleDate}T${data.scheduleTime || "00:00"}`).toISOString()
          : null;
      const { data: campaign, error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        name: data.name,
        subject: data.subject,
        preview_text: data.previewText,
        list_id: data.list || null,
        template_id: data.template || null,
        content: data.content,
        status: data.scheduleType === "now" ? "sending" : "scheduled",
        schedule_type: data.scheduleType,
        scheduled_at,
      }).select("id").single();
      if (error) throw error;

      // If sending now, trigger the edge function
      if (data.scheduleType === "now" && campaign) {
        const { data: result, error: sendErr } = await supabase.functions.invoke("send-campaign", {
          body: { campaignId: campaign.id },
        });
        if (sendErr) throw sendErr;
        if (result?.error) throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(data.scheduleType === "now" ? "Campaign sent!" : "Campaign scheduled!");
      navigate("/campaigns");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Campaign</h1>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length} — {steps[step]}
            </p>
          </div>
        </div>

        <CampaignStepper steps={steps} currentStep={step} />

        {step === 0 && <StepRecipients data={data} onChange={update} />}
        {step === 1 && <StepContent data={data} onChange={update} />}
        {step === 2 && <StepReview data={data} />}
        {step === 3 && <StepSend data={data} onChange={update} />}

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {data.scheduleType === "now" ? "Send Campaign" : "Schedule Campaign"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignCreate;
