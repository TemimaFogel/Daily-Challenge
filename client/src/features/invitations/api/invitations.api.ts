import { http } from "@/api/http";

export type InviteStatus = "PENDING" | "APPROVED" | "DECLINED";

/** Group info nested in invite (GET /api/invites) */
export interface InviteGroup {
  id: string;
  name: string;
  description: string | null;
}

/** Invite from GET /api/invites (id, status, group: { id, name, description }, …) */
export interface Invite {
  id: string;
  groupId?: string;
  group?: InviteGroup | null;
  invitedUserId?: string;
  invitedUserEmail?: string | null;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  createdAt?: string | null;
  status: InviteStatus;
}

/** Group + members returned by GET /api/invites/{id}/preview */
export interface InvitePreviewGroup {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export interface InvitePreviewMember {
  id: string;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

export interface InvitePreview {
  group: InvitePreviewGroup;
  members: InvitePreviewMember[];
}

export const invitationsApi = {
  getList(): Promise<Invite[]> {
    return http
      .get<Invite[]>("/api/invites")
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  getPreview(inviteId: string): Promise<InvitePreview> {
    return http
      .get<InvitePreview>(`/api/invites/${inviteId}/preview`)
      .then((r) =>
        r.data ?? {
          group: { id: "", name: "", description: null, memberCount: 0 },
          members: [],
        }
      );
  },

  approve(id: string): Promise<Invite> {
    return http.post<Invite>(`/api/invites/${id}/approve`).then((r) => r.data ?? ({} as Invite));
  },

  decline(id: string): Promise<Invite> {
    return http.post<Invite>(`/api/invites/${id}/decline`).then((r) => r.data ?? ({} as Invite));
  },
};
