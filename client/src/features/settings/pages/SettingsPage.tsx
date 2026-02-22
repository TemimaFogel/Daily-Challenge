import { useState, useEffect } from "react";
import { User, Mail, Sliders, Shield, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAuth } from "@/auth/AuthContext";
import { useMe } from "../hooks/useMe";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useUploadProfileImage } from "../hooks/useUploadProfileImage";
import { getPreference, setPreference, type PreferenceKey } from "../lib/preferencesStorage";
import { prepareProfileImage } from "@/lib/imageProcessing";
import { ProfileCard } from "../components/ProfileCard";
import { AccountCard } from "../components/AccountCard";
import { PreferencesCard } from "../components/PreferencesCard";
import { SecurityCard } from "../components/SecurityCard";
import { DangerZoneCard } from "../components/DangerZoneCard";
import { cn } from "@/lib/utils";

type SectionId = "profile" | "account" | "preferences" | "security" | "danger-zone";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Mail },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
];

export function SettingsPage() {
  const { logout } = useAuth();
  const { data: me, isLoading: meLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();

  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dailyReminders = getPreference("dailyReminders");
  const groupInvites = getPreference("groupInvites");
  const completionConfirmations = getPreference("completionConfirmations");

  useEffect(() => {
    if (me) {
      setName(me.name ?? "");
      setTimezone(me.timezone ?? "UTC");
    }
  }, [me?.id, me?.name, me?.timezone]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleNameSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setToast("Name is required.");
      return;
    }
    if (trimmed.length > 255) {
      setToast("Name is too long.");
      return;
    }
    updateProfile.mutate(
      { name: trimmed },
      {
        onSuccess: () => setToast("Profile updated."),
        onError: () => setToast("Failed to update profile."),
      }
    );
  };

  const handleTimezoneSave = () => {
    updateProfile.mutate(
      { timezone: timezone.trim() || "UTC" },
      {
        onSuccess: () => setToast("Timezone updated."),
        onError: () => setToast("Failed to update timezone."),
      }
    );
  };

  const handlePhotoUpload = async (file: File) => {
    setPhotoError(null);
    try {
      const processed = await prepareProfileImage(file);
      uploadImage.mutate(processed, {
        onSuccess: () => {
          setToast("Photo updated.");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Upload failed.";
          setPhotoError(msg);
        },
      });
    } catch {
      setPhotoError("Failed to prepare image.");
    }
  };

  const handlePreferenceToggle = (key: PreferenceKey, value: boolean) => {
    setPreference(key, value);
  };

  if (meLoading && !me) {
    return (
      <AppLayout title="Settings">
        <PageHeader title="Settings" description="Manage your profile and preferences" hideTitle />
        <div className="space-y-6">
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          <LoadingSkeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const user = me ?? { id: "", email: "", name: "", timezone: "UTC", profileImageUrl: null };

  return (
    <AppLayout title="Settings">
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-foreground text-background px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}

      <PageHeader
        title="Settings"
        description="Manage your profile and preferences"
        hideTitle
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <nav
          className="lg:w-52 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0"
          aria-label="Settings sections"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === "profile" && (
            <ProfileCard
              name={name}
              profileImageUrl={user.profileImageUrl ?? null}
              onNameChange={setName}
              onNameSave={handleNameSave}
              nameSaving={updateProfile.isPending}
              onPhotoUpload={handlePhotoUpload}
              photoUploading={uploadImage.isPending}
              photoError={photoError}
              clearPhotoError={() => setPhotoError(null)}
            />
          )}
          {activeSection === "account" && (
            <AccountCard email={user.email ?? ""} />
          )}
          {activeSection === "preferences" && (
            <PreferencesCard
              timezone={timezone}
              onTimezoneChange={setTimezone}
              onTimezoneSave={handleTimezoneSave}
              timezoneSaving={updateProfile.isPending}
              dailyReminders={dailyReminders}
              groupInvites={groupInvites}
              completionConfirmations={completionConfirmations}
              onPreferenceToggle={handlePreferenceToggle}
            />
          )}
          {activeSection === "security" && <SecurityCard />}
          {activeSection === "danger-zone" && (
            <DangerZoneCard onLogout={logout} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
