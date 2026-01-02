import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import GroupPage from "./pages/GroupPage";
import ContributionPage from "./pages/ContributionPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      {/* Navbar visible only after login */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected / App Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="create-group" element={<CreateGroupPage />} />
                <Route path="groups" element={<MyGroupsPage />} />
                <Route path="join-group" element={<JoinGroupPage />} />
                <Route path="groups/:groupId" element={<GroupPage />} />
                <Route
                  path="groups/:groupId/contributions"
                  element={<ContributionPage />}
                />
              </Routes>
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
