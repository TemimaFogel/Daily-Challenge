import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
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
import { GroupsPage, GroupDetailsPage, GroupManagePage } from "@/features/groups";
import { InvitationsPage } from "@/features/invitations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/challenges" element={<ChallengesListPage />} />
          <Route path="/challenges/new" element={<CreateChallengePage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailsPage />} />
          <Route path="/groups/:id/manage" element={<GroupManagePage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/history" element={<PlaceholderPage title="History" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
