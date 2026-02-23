import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmailPreviewDialogProps {
  subject?: string;
  previewText?: string;
  content?: string | null;
  trigger?: React.ReactNode;
}

export function EmailPreviewDialog({
  subject,
  previewText,
  content,
  trigger,
}: EmailPreviewDialogProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const emailHtml = content || "<p style='color:#888;'>No content yet.</p>";

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <style>
        body {
          margin: 0;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #1a1a1a;
          background: #ffffff;
        }
        img { max-width: 100%; height: auto; }
        a { color: #4366d0; }
      </style>
    </head>
    <body>${emailHtml}</body>
    </html>
  `;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-medium">Email Preview</DialogTitle>
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <button
                onClick={() => setDevice("desktop")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "desktop"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  device === "mobile"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Email header simulation */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border space-y-1">
          {subject && (
            <p className="text-sm font-semibold text-foreground">{subject}</p>
          )}
          {previewText && (
            <p className="text-xs text-muted-foreground">{previewText}</p>
          )}
        </div>

        {/* Email body */}
        <div className="flex-1 overflow-auto bg-muted/20 p-6 flex justify-center">
          <div
            className={cn(
              "bg-background rounded-lg border border-border shadow-sm transition-all duration-300",
              device === "desktop" ? "w-full max-w-[600px]" : "w-[375px]"
            )}
          >
            <iframe
              srcDoc={wrappedHtml}
              title="Email Preview"
              className="w-full border-0 rounded-lg"
              style={{ minHeight: 400 }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}