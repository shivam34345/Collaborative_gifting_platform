import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import StatCard from "./StatCard";
import ActionCard from "./ActionCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />

      {/* 🌸 Background */}
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
            value="4"
            color="text-pink-600"
          />
          <StatCard
            label="Active Groups"
            value="2"
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
    </>
  );
};

export default Dashboard;
