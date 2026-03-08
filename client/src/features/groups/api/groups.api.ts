import { http } from "@/api/http";
import type { ChallengeDTO } from "@/features/challenges/types";

export interface GroupSummary {
  id: string;
  ownerId?: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string | null;
}

export interface GroupDTO {
  id: string;
  name: string;
  description?: string | null;
  [key: string]: unknown;
}

export interface GroupMember {
  userId: string;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
  joinedAt: string;
}

/** Invite status from API */
export type GroupInviteStatus = "PENDING" | "APPROVED" | "DECLINED";

/** Invited user info in invite view */
export interface GroupInviteViewInvited {
  id?: string;
  name?: string | null;
  email: string;
  profileImageUrl?: string | null;
}

/** Group challenge item from GET /api/groups/{id}/challenges */
export interface GroupChallengeItem {
  challenge: ChallengeDTO;
  joined: boolean;
  completed: boolean;
}

/** Invite view from GET /api/groups/{id}/invites */
export interface GroupInviteView {
  id: string;
  groupId: string;
  groupName: string;
  status: GroupInviteStatus;
  invited: GroupInviteViewInvited;
  createdAt?: string | null;
}

export const groupsApi = {
  getMy(): Promise<GroupSummary[]> {
    return http.get<GroupSummary[]>("/api/groups/my").then((r) => r.data ?? []);
  },

  getMembers(groupId: string): Promise<GroupMember[]> {
    return http
      .get<GroupMember[]>(`/api/groups/${groupId}/members`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  getInvites(groupId: string): Promise<GroupInviteView[]> {
    return http
      .get<GroupInviteView[]>(`/api/groups/${groupId}/invites`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  create(body: CreateGroupRequest): Promise<GroupDTO> {
    return http.post<GroupDTO>("/api/groups", body).then((r) => r.data ?? ({} as GroupDTO));
  },

  createInvite(groupId: string, body: { email: string }): Promise<unknown> {
    return http.post(`/api/groups/${groupId}/invites`, body).then((r) => r.data);
  },

  removeMember(groupId: string, userId: string): Promise<void> {
    return http.delete(`/api/groups/${groupId}/members/${userId}`).then(() => undefined);
  },

  getChallenges(groupId: string): Promise<GroupChallengeItem[]> {
    return http
      .get<GroupChallengeItem[]>(`/api/groups/${groupId}/challenges`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
};
