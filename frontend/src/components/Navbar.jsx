import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const Navbar = () => {
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);


  /* =======================
     FETCH USER PROFILE
  ======================= */
  const fetchProfile = async () => {
    setShowProfileModal(true);
    setEditName(false);
    setError("");

    try {
      const res = await API.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(res.data);
      setName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };

  /* =======================
     SAVE NAME (✔️)
  ======================= */
 const saveName = async () => {
  if (!name || name.trim().length < 3) {
    setError("Name must be at least 3 characters");
    return;
  }

  try {
    const res = await API.patch(
      "/api/users/name",
      { name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setUser((prev) => ({
      ...prev,
      name: res.data.name,
    }));

    setEditName(false);

    // 🔑 force dashboard to reflect change
    window.location.reload();
  } catch (err) {
    setError(err.response?.data?.message || "Name already taken");
  }
};


  /* =======================
     FETCH CONTRIBUTIONS
  ======================= */
  const fetchContributions = async () => {
    setShowContributionModal(true);
    setLoading(true);

    try {
      const res = await API.get("/api/contributions/my-total", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="w-full flex justify-between items-center px-10 py-4 border-b">
        <h1 className="text-xl font-bold">
          Collaborative Gifting Platform
        </h1>

        <div className="flex gap-6 text-gray-700">
          <Link to="/dashboard" className="hover:text-black">
            Dashboard
          </Link>

          <span
            onClick={fetchContributions}
            className="cursor-pointer hover:text-black"
          >
            Tot. Contribution
          </span>

          <span
            onClick={fetchProfile}
            className="cursor-pointer hover:text-black"
          >
            Profile
          </span>

         <span
  onClick={() => setShowSettingsModal(true)}
  className="cursor-pointer hover:text-black"
>
  Settings
</span>

        </div>
      </nav>

      {/* ================= PROFILE MODAL ================= */}
      {showProfileModal && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 relative">

            {/* Close */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-center mb-6">
              Profile
            </h2>

            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                alt="avatar"
                className="w-20 h-20 rounded-full border"
              />
            </div>

            {/* Name */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {editName ? (
                <>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-3 py-1 text-center focus:outline-none focus:ring"
                    autoFocus
                  />

                  {/* ✔️ Save */}
                  <button
                    onClick={saveName}
                    disabled={saving}
                    className="text-green-600 text-lg"
                    title="Save"
                  >
                    ✔️
                  </button>

                  {/* ✖️ Cancel */}
                  <button
                    onClick={() => {
                      setEditName(false);
                      setName(user.name);
                      setError("");
                    }}
                    className="text-red-500 text-lg"
                    title="Cancel"
                  >
                    ✖️
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xl font-medium">
                    {user.name}
                  </span>

                  {/* ✏️ Edit */}
                  <button
                    onClick={() => setEditName(true)}
                    className="text-blue-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center mt-1">
                {error}
              </p>
            )}

            {/* Email */}
            <p className="text-gray-500 text-sm text-center mt-3">
              {user.email}
            </p>

            {/* Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= SETTINGS MODAL ================= */}
{showSettingsModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 relative text-center">

      {/* Close */}
      <button
        onClick={() => setShowSettingsModal(false)}
        className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
      >
        ×
      </button>

      <h2 className="text-lg font-semibold mb-4">
        Settings
      </h2>

      <p className="text-gray-600">
        🚧 Implementing soon!
      </p>

      <div className="mt-6">
        <button
          onClick={() => setShowSettingsModal(false)}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


      {/* ================= CONTRIBUTION MODAL ================= */}
      {showContributionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <button
              onClick={() => setShowContributionModal(false)}
              className="float-right text-xl"
            >
              ×
            </button>

            {loading ? (
              <p className="text-center">Loading...</p>
            ) : data ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  {data.email}
                </p>

                {data.groups.map((g, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{g.groupName}</span>
                    <span>₹{g.amount}</span>
                  </div>
                ))}

                <div className="flex justify-between font-semibold border-t mt-3 pt-2">
                  <span>Total</span>
                  <span>₹{data.total}</span>
                </div>
              </>
            ) : (
              <p>No contributions found</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
