import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveApiUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined): string {
  if (name == null || name.trim() === "") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export interface ProfileCardProps {
  name: string;
  profileImageUrl: string | null;
  onNameChange: (name: string) => void;
  onNameSave: () => void;
  nameSaving: boolean;
  onPhotoUpload: (file: File) => void;
  photoUploading: boolean;
  photoError: string | null;
  clearPhotoError: () => void;
}

export function ProfileCard({
  name,
  profileImageUrl,
  onNameChange,
  onNameSave,
  nameSaving,
  onPhotoUpload,
  photoUploading,
  photoError,
  clearPhotoError,
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = !imageFailed ? resolveApiUrl(profileImageUrl) : null;
  const showImage = resolvedSrc != null && resolvedSrc !== "";

  const handleFile = (file: File | null) => {
    clearPhotoError();
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      return;
    }
    onPhotoUpload(file);
  };

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            <div
              className={cn(
                "flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-medium text-muted-foreground ring-2 ring-background",
                "border-2 border-border"
              )}
            >
              {showImage && resolvedSrc ? (
                <img
                  src={resolvedSrc}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span>{getInitials(name)}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                handleFile(f ?? null);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full size-8 p-0 shadow-md"
              disabled={photoUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a new photo. Large images are resized automatically.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={photoUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUploading ? "Uploading…" : "Upload new photo"}
            </Button>
            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="settings-name" className="text-sm font-medium text-foreground">
            Display name
          </label>
          <div className="flex gap-2">
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Your name"
              maxLength={255}
              className="max-w-xs"
            />
            <Button
              type="button"
              onClick={onNameSave}
              disabled={nameSaving}
            >
              {nameSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
