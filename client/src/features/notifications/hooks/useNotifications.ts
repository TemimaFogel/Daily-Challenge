import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { authStore } from "@/auth/authStore";
import { invitationsApi } from "@/features/invitations/api/invitations.api";

export type NotificationItem = {
  id: string;
  type: "INVITE";
  title: string;
  message: string;
  createdAt?: string;
  href: string;
};

const STORAGE_KEY = "dailychallenge_lastSeenNotificationsAt";

function getLastSeen(): number | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? parseInt(s, 10) : null;
  } catch {
    return null;
  }
}

function setLastSeen(ms: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {
    // ignore
  }
}

function mapInviteToNotification(invite: {
  id: string;
  group?: { name?: string } | null;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  createdAt?: string | null;
}): NotificationItem {
  const groupName = invite.group?.name ?? "a group";
  const inviter = invite.invitedByName ?? invite.invitedByEmail ?? "Someone";
  return {
    id: invite.id,
    type: "INVITE",
    title: "Group invite",
    message: `${inviter} invited you to ${groupName}`,
    createdAt: invite.createdAt ?? undefined,
    href: "/invitations",
  };
}

export function useNotifications() {
  const token = authStore.getToken();
  const userId = authStore.getCurrentUserId();

  const query = useQuery({
    queryKey: ["notifications", "invites", userId ?? ""],
    queryFn: () => invitationsApi.getList(),
    enabled: !!token && !!userId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const pendingInvites = useMemo(() => {
    const list = query.data ?? [];
    return list.filter((inv) => inv.status === "PENDING");
  }, [query.data]);

  const notifications = useMemo(
    () => pendingInvites.map(mapInviteToNotification),
    [pendingInvites]
  );

  const lastSeen = getLastSeen();

  const newCount = useMemo(() => {
    if (lastSeen == null) return notifications.length;
    return notifications.filter((n) => {
      if (!n.createdAt) return true;
      const created = new Date(n.createdAt).getTime();
      return created > lastSeen;
    }).length;
  }, [notifications, lastSeen]);

  const markAsSeen = useCallback(() => {
    setLastSeen(Date.now());
  }, []);

  return {
    notifications,
    newCount,
    markAsSeen,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
