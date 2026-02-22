import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { authStore, type AuthUser } from "./authStore";

interface AuthState {
  currentUser: AuthUser | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuthFromStore(): AuthState {
  const token = authStore.getToken();
  const currentUser = token ? authStore.getCurrentUser() : null;
  return { token, currentUser };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readAuthFromStore);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useCallback((token: string, user: AuthUser) => {
    authStore.setToken(token);
    authStore.setCurrentUser(user);
    setState({ token, currentUser: user });
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    authStore.clearToken();
    setState({ token: null, currentUser: null });
    navigate("/login", { replace: true });
  }, [queryClient, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser: state.currentUser,
      token: state.token,
      login,
      logout,
    }),
    [state.currentUser, state.token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
