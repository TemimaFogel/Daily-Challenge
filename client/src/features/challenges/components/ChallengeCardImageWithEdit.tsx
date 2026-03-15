import { useRef, useEffect, useState } from "react";
import { Pencil, Upload, Sparkles } from "lucide-react";
import { ChallengeCardImage } from "./ChallengeCardImage";
import { useReplaceChallengeImage, useGenerateChallengeImage } from "../hooks/useChallenges";
import { cn } from "@/lib/utils";

interface ChallengeCardImageWithEditProps {
  challengeId: string;
  imageUrl?: string | null;
  title?: string;
  isCreator: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
  onError?: (message: string) => void;
}

/**
 * Challenge image with optional edit overlay (bottom-right). Only shown when isCreator.
 * Clicking the edit button opens a simple menu: "Upload from device" or "Generate AI Image".
 * Uses a plain state-based panel (no dropdown lib) to avoid render-time crashes.
 */
export function ChallengeCardImageWithEdit({
  challengeId,
  imageUrl,
  title,
  isCreator,
  className,
  objectFit = "cover",
  onError,
}: ChallengeCardImageWithEditProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const replaceImage = useReplaceChallengeImage();
  const generateImage = useGenerateChallengeImage();
  const isPending = replaceImage.isPending || generateImage.isPending;

  const challengeIdSafe = challengeId != null && String(challengeId).trim() !== "";
  const showImageActions = Boolean(isCreator && challengeIdSafe);

  useEffect(() => {
    if (replaceImage.isError) {
      onError?.("Failed to update image.");
      replaceImage.reset();
    }
  }, [replaceImage.isError, replaceImage, onError]);

  useEffect(() => {
    if (generateImage.isError) {
      onError?.("Failed to generate AI image.");
      generateImage.reset();
    }
  }, [generateImage.isError, generateImage, onError]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleUploadFromDevice = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleGenerateAI = () => {
    setMenuOpen(false);
    if (!challengeIdSafe) return;
    generateImage.mutate(String(challengeId).trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file?.type.startsWith("image/") || !challengeIdSafe) return;
    replaceImage.mutate({ id: String(challengeId).trim(), file });
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <ChallengeCardImage
        imageUrl={imageUrl}
        title={title}
        className="w-full h-full"
        objectFit={objectFit}
      />
      {showImageActions && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-hidden
            onChange={handleFileChange}
          />
          <div className="absolute bottom-3 right-3 z-20" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              disabled={isPending}
              className={cn(
                "flex items-center justify-center rounded-full p-2",
                "bg-white/90 dark:bg-background/90 text-foreground shadow-md",
                "hover:bg-white dark:hover:bg-background transition-colors",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
              aria-label="Edit challenge image"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {isPending ? (
                <span className="text-xs">…</span>
              ) : (
                <Pencil className="size-4" />
              )}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 bottom-full mb-1 min-w-[180px] rounded-md border border-border bg-card p-1 text-card-foreground shadow-md z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleUploadFromDevice}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50 text-left"
                >
                  <Upload className="size-4 shrink-0" />
                  Upload from device
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleGenerateAI}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50 text-left"
                >
                  <Sparkles className="size-4 shrink-0" />
                  Generate AI Image
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
