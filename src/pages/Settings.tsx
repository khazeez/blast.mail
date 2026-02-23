import { DashboardLayout } from "@/components/DashboardLayout";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { SenderConfigCard } from "@/components/settings/SenderConfigCard";
import { CustomDomainCard } from "@/components/settings/CustomDomainCard";

const Settings = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect /settings to /settings/profile
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/profile", { replace: true });
    }
  }, [location.pathname, navigate]);

  const section = location.pathname.split("/settings/")[1] || "profile";

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setEmail(user?.email ?? "");
      setSenderName(profile.sender_name ?? "");
      setSenderEmail(profile.sender_email ?? "");
      setReplyTo(profile.reply_to_email ?? "");
    }
  }, [profile, user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        {section === "profile" && (
          <ProfileCard
            userId={user?.id}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
          />
        )}

        {section === "sender" && (
          <SenderConfigCard
            userId={user?.id}
            senderName={senderName}
            setSenderName={setSenderName}
            senderEmail={senderEmail}
            setSenderEmail={setSenderEmail}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
          />
        )}

        {section === "domain" && (
          <CustomDomainCard
            customDomain={profile?.custom_domain ?? null}
            domainVerified={profile?.domain_verified ?? false}
            verificationToken={profile?.domain_verification_token ?? null}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
