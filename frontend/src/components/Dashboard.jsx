import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "./StatCard";
import ActionCard from "./ActionCard";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [joinedGroups, setJoinedGroups] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Fetch user from backend (SOURCE OF TRUTH)
        const userRes = await API.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(userRes.data);

        // ✅ Fetch group stats
        const groupsRes = await API.get("/api/groups/my-groups", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const groups = groupsRes.data;
        setJoinedGroups(groups.length);

        const active = groups.filter(
          (group) => group.paymentOpen === true
        ).length;
        setActiveGroups(active);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex flex-col items-center px-6">
      {/* 👋 Welcome */}
      <div className="mt-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Hi {user?.name || "User"} 💖
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to Collaborative Gifting Platform
        </p>
      </div>

      {/* 📊 Stats */}
      <div className="flex gap-16 mt-12 mb-16">
        <StatCard
          label="Joined Groups"
          value={loading ? "—" : joinedGroups}
          color="text-pink-600"
        />
        <StatCard
          label="Active Groups"
          value={loading ? "—" : activeGroups}
          color="text-purple-600"
        />
      </div>

      {/* 🚀 Action Cards */}
      <div className="flex gap-10 flex-wrap justify-center">
        <ActionCard
          title="My Groups"
          bgColor="bg-gradient-to-br from-pink-200 to-pink-300"
          onClick={() => navigate("/groups")}
        />
        <ActionCard
          title="Create Group"
          bgColor="bg-gradient-to-br from-purple-200 to-purple-300"
          onClick={() => navigate("/create-group")}
        />
        <ActionCard
          title="Join Group"
          bgColor="bg-gradient-to-br from-rose-200 to-rose-300"
          onClick={() => navigate("/join-group")}
        />
      </div>
    </div>
  );
};

export default Dashboard;
