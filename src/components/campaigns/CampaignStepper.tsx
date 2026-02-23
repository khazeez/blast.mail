import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CampaignStepperProps {
  steps: string[];
  currentStep: number;
}

export function CampaignStepper({ steps, currentStep }: CampaignStepperProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                i < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                i <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1",
                i < currentStep ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
