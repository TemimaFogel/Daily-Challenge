import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { DemoPage } from "@/pages/DemoPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  ChallengesListPage,
  ChallengeDetailsPage,
  CreateChallengePage,
} from "@/features/challenges";
import { DashboardPage } from "@/features/dashboard";
import { GroupsPage, GroupDetailsPage, GroupManagePage } from "@/features/groups";
import { InvitationsPage } from "@/features/invitations";
import { HistoryPage } from "@/features/history";
import { SettingsPage } from "@/features/settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/challenges" element={<ChallengesListPage />} />
          <Route path="/challenges/new" element={<CreateChallengePage />} />
          <Route path="/challenges/create" element={<Navigate to="/challenges/new" replace />} />
          <Route path="/challenges/:id" element={<ChallengeDetailsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailsPage />} />
          <Route path="/groups/:id/manage" element={<GroupManagePage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
