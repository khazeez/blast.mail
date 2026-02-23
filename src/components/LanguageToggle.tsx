import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="text-xs font-medium px-2"
      aria-label="Toggle language"
    >
      {locale === "en" ? "🇮🇩 ID" : "🇬🇧 EN"}
    </Button>
  );
}
