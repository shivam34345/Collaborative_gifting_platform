import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import GroupPage from "./pages/GroupPage";
import ContributionPage from "./pages/ContributionPage";
function App() {
  return (
  
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/groups" element={<MyGroupsPage />} />
        <Route path="/join-group" element={<JoinGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route
          path="/groups/:groupId/contributions"
          element={<ContributionPage />}
        />


      </Routes>
  
  );
}

export default App;
