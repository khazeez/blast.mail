import { FooterBlockProps } from "../types";
import { Mail } from "lucide-react";

export function FooterBlock({
  companyName,
  address,
  unsubscribeLink,
  socialLinks,
}: FooterBlockProps) {
  return (
    <div className="text-center text-sm text-muted-foreground py-4 border-t">
      <p className="font-medium text-foreground">{companyName || "Your Company"}</p>
      {address && <p className="mt-1">{address}</p>}
      {socialLinks && (
        <div className="flex justify-center gap-3 mt-3">
          <a href="#" className="hover:text-foreground" onClick={(e) => e.preventDefault()}>
            <Mail className="h-4 w-4" />
          </a>
        </div>
      )}
      {unsubscribeLink && (
        <p className="mt-3">
          <a 
            href="{{unsubscribe_url}}" 
            className="text-primary hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Unsubscribe
          </a>{" "}
          from this list.
        </p>
      )}
    </div>
  );
}
