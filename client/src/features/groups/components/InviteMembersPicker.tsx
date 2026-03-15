import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveApiUrl } from "@/lib/urls";
import { useUserSearch } from "../hooks/useUserSearch";
import type { UserSearchResult } from "../api/users.api";
import { cn } from "@/lib/utils";

const AVATAR_SIZE = "h-9 w-9";

function getInitials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

function UserAvatar({
  user,
  className,
}: {
  user: UserSearchResult;
  className?: string;
}) {
  const imgUrl = resolveApiUrl(user.profileImageUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = imgUrl && !imgFailed;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground",
        AVATAR_SIZE,
        className
      )}
    >
      {showImg ? (
        <img
          src={imgUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        getInitials(user.name)
      )}
    </div>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export interface InviteMembersPickerProps {
  selectedUsers: UserSearchResult[];
  onSelectedUsersChange: (users: UserSearchResult[]) => void;
  manualEmails: string[];
  onManualEmailsChange: (emails: string[]) => void;
  /** When provided (e.g. on Group Manage page), "Invite to Platform" calls this instead of adding to manualEmails. Use for immediate external invite when group exists. */
  onInviteToPlatform?: (email: string) => void | Promise<void>;
  className?: string;
}

export function InviteMembersPicker({
  selectedUsers,
  onSelectedUsersChange,
  manualEmails,
  onManualEmailsChange,
  onInviteToPlatform,
  className,
}: InviteMembersPickerProps) {
  const { query, setQuery, debouncedQuery, results, isFetching } = useUserSearch();
  const selectedIds = new Set(selectedUsers.map((u) => u.id));
  const selectedEmails = new Set([
    ...selectedUsers.map((u) => u.email.toLowerCase()),
    ...manualEmails.map((e) => e.trim().toLowerCase()),
  ]);

  const trimmedQuery = debouncedQuery.trim();
  const queryIsEmail = isValidEmail(trimmedQuery);
  const queryMatchesNoResult =
    queryIsEmail &&
    (results.length === 0 ||
      !results.some((r) => r.email?.toLowerCase() === trimmedQuery.toLowerCase()));
  const showUnregisteredCta = trimmedQuery.length >= 1 && queryIsEmail && queryMatchesNoResult;

  const toggleUser = useCallback(
    (user: UserSearchResult) => {
      if (selectedIds.has(user.id)) {
        onSelectedUsersChange(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        onSelectedUsersChange([...selectedUsers, user]);
      }
    },
    [selectedUsers, selectedIds, onSelectedUsersChange]
  );

  const addUnregisteredEmail = useCallback(() => {
    if (!trimmedQuery || !showUnregisteredCta) return;
    const lower = trimmedQuery.toLowerCase();
    if (selectedEmails.has(lower)) return;
    if (onInviteToPlatform) {
      void Promise.resolve(onInviteToPlatform(trimmedQuery)).then(() => setQuery(""));
    } else {
      onManualEmailsChange([...manualEmails, trimmedQuery]);
      setQuery("");
    }
  }, [trimmedQuery, showUnregisteredCta, selectedEmails, manualEmails, onManualEmailsChange, onInviteToPlatform, setQuery]);

  const removeManualEmail = useCallback(
    (email: string) => {
      onManualEmailsChange(manualEmails.filter((e) => e.toLowerCase() !== email.toLowerCase()));
    },
    [manualEmails, onManualEmailsChange]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Invite Members</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            leftIcon={<Search className="size-5" />}
            className="pr-3"
          />
        </div>
      </div>

      {/* Search results — only when user has typed something */}
      {debouncedQuery.length >= 1 && (
      <div className="rounded-md border border-input bg-muted/30 max-h-48 overflow-y-auto">
        {isFetching ? (
          <div className="flex items-center justify-center gap-2 p-6">
            <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <span className="text-sm text-muted-foreground">Searching…</span>
          </div>
        ) : results.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No users found</p>
        ) : (
          <ul className="divide-y divide-border">
            {results.map((user) => {
              const checked = selectedIds.has(user.id);
              return (
                <li key={user.id}>
                  <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50">
                    <UserAvatar user={user} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUser(user)}
                      className="h-4 w-4 rounded border-input"
                      aria-label={`Select ${user.name}`}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      )}

      {/* Unregistered email CTA — when query looks like email and no user found */}
      {showUnregisteredCta && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <p className="text-sm text-foreground">
            This email is not registered on DailyChallenge yet.
          </p>
          <p className="text-sm text-muted-foreground">
            You can send them an invitation to join the platform.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addUnregisteredEmail}
          >
            Invite to Platform
          </Button>
        </div>
      )}

      {/* Selected Invites — users from search + emails added via "Invite to Platform" */}
      {(selectedUsers.length > 0 || manualEmails.length > 0) ? (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Selected Invites</span>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pl-1.5 pr-2 text-sm"
              >
                <UserAvatar user={user} />
                <span className="max-w-[140px] truncate">
                  {user.name?.trim() ? user.name : user.email}
                </span>
                <button
                  type="button"
                  onClick={() => toggleUser(user)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${user.name || user.email}`}
                >
                  <X className="size-4" />
                </button>
              </span>
            ))}
            {manualEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1.5 text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeManualEmail(email)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${email}`}
                >
                  <X className="size-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
