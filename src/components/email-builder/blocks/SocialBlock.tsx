import { SocialBlockProps } from "../types";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from "lucide-react";

const icons: Record<string, React.FC<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  email: Mail,
};

export function SocialBlock({ platforms, align }: SocialBlockProps) {
  return (
    <div style={{ textAlign: align }} className="flex gap-3 py-2">
      {platforms.map((platform, index) => {
        const Icon = icons[platform.icon] || icons[platform.name];
        return (
          <a
            key={index}
            href={platform.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
