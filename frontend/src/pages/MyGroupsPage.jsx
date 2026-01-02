import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

const MyGroupsPage = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/api/groups/my-groups", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setGroups(res.data);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        alert("Unable to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // ✅ delete handler (OUTSIDE useEffect)
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Are you sure? This will permanently delete the group for all members."
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // remove from UI instantly
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete group");
    }
  };

  return (
    <>
     

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          My Groups 🎁
        </h1>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-600">Loading groups...</p>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="text-center text-gray-600">
            <p className="mb-4">You’re not part of any group yet.</p>
            <button
              onClick={() => navigate("/create-group")}
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600"
            >
              Create Your First Group
            </button>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {group.name}
                </h2>

                <p className="text-gray-600 mb-2">
                  {group.description || "No description provided"}
                </p>

                <p className="text-sm text-gray-500">
                  <span className="font-medium">Invite Code:</span>{" "}
                  {group.inviteCode}
                </p>

                <p className="text-sm text-gray-500">
                  <span className="font-medium">Organizer UPI:</span>{" "}
                  {group.organizerUpi}
                </p>
              </div>

              {/* Open Group */}
              <button
                onClick={() => navigate(`/groups/${group._id}`)}
                className="mt-6 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
              >
                Open Group
              </button>

              {/* Delete Group – organizer only */}
              {group.createdBy === user?._id && (
                <button
                  onClick={() => handleDeleteGroup(group._id)}
className="mt-3 mx-auto block bg-red-500 text-white text-xs px-4 py-1 rounded-full hover:bg-red-600 transition"
                >
                  Delete Group
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyGroupsPage;
