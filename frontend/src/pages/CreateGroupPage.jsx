import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

const CreateGroupPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizerUpi, setOrganizerUpi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !organizerUpi.trim()) {
      return alert("Group name and Organizer UPI are required");
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/api/groups/create",
        { name, description, organizerUpi },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Group created:", res.data);

      navigate("/groups"); // next page
    } catch (error) {
      console.error("Create group error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex justify-center items-center px-4">

        <form
          onSubmit={handleCreateGroup}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create a New Group 🎁
          </h2>

          <input
            type="text"
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-pink-300 outline-none"
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-pink-300 outline-none"
            rows="3"
          />

          <input
            type="text"
            placeholder="Organizer UPI ID (e.g. name@upi)"
            value={organizerUpi}
            onChange={(e) => setOrganizerUpi(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-6 focus:ring-2 focus:ring-pink-300 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateGroupPage;
