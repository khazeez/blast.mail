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
    <div style={{ textAlign: align }} className="flex gap-2 py-2">
      {platforms.map((platform, index) => {
        const Icon = icons[platform.icon] || icons[platform.name];
        return (
          <a
            key={index}
            href={platform.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Icon className="h-4 w-4 text-slate-600" />
          </a>
        );
      })}
    </div>
  );
}
