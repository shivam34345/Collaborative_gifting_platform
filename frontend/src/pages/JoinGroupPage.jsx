import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

const JoinGroupPage = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async (e) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      return alert("Invite code is required");
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/api/groups/join",
        { inviteCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(res.data.message || "Joined group successfully");
      navigate("/groups");
    } catch (error) {
      console.error("Join group error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex justify-center items-center px-4">

        <form
          onSubmit={handleJoinGroup}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Join a Group 🔑
          </h2>

          <input
            type="text"
            placeholder="Enter Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-6 focus:ring-2 focus:ring-pink-300 outline-none text-center tracking-widest"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        </form>
      </div>
    </>
  );
};

export default JoinGroupPage;
