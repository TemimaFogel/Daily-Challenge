const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email?: string;
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; email?: string };
    return parsed?.id != null ? { id: String(parsed.id), email: parsed.email } : null;
  } catch {
    return null;
  }
}

export const authStore = {
  getToken(): string | null {
    return getStoredToken();
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },

  getCurrentUser(): AuthUser | null {
    return getStoredUser();
  },

  getCurrentUserId(): string | null {
    return getStoredUser()?.id ?? null;
  },

  setCurrentUser(user: AuthUser | null | undefined): void {
    try {
      if (user == null) {
        localStorage.removeItem(USER_KEY);
      } else {
        localStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, email: user.email }));
      }
    } catch {
      // ignore
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },
};
