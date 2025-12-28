import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

const GroupPage = () => {
  const { groupId } = useParams();
  const [copied, setCopied] = useState(false);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [gifts, setGifts] = useState([]);

  const [giftName, setGiftName] = useState("");
  const [giftImage, setGiftImage] = useState("");
  const [giftLink, setGiftLink] = useState("");

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH GROUP =================
  const fetchGroup = async () => {
    try {
      const res = await API.get(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data);
    } catch {
      alert("Unable to load group");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH GIFTS =================
  const fetchGifts = async () => {
    try {
      const res = await API.get(`/api/gifts/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGifts(res.data);
    } catch {
      console.error("Failed to fetch gifts");
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchGifts();
  }, [groupId]);

  // ================= ADD GIFT =================
  const handleAddGift = async () => {
    if (!giftName || !giftImage || !giftLink) {
      return alert("All fields are required");
    }

    await API.post(
      `/api/gifts/${groupId}`,
      { name: giftName, image: giftImage, link: giftLink },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setGiftName("");
    setGiftImage("");
    setGiftLink("");
    fetchGifts();
  };

  // ================= VOTE =================
  const handleVote = async (giftId) => {
    await API.post(
      `/api/gifts/${giftId}/vote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchGifts();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading group...
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Group not found
        </div>
      </>
    );
  }

  const sortedGifts = [...gifts].sort(
    (a, b) => b.votes.length - a.votes.length
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 px-6 py-12">

        {/* GROUP NAME */}
        <h1 className="text-4xl font-bold text-center mb-8">
          {group.name}
        </h1>

        {/* STATS */}
        <div className="flex justify-center gap-8 mb-10">
          {/* Invite Code */}
          <div className="bg-white px-6 py-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500 mb-1">Invite Code</p>
            <p className="font-semibold tracking-widest mb-2">
              {group.inviteCode}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(group.inviteCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="text-xs text-pink-500 hover:underline"
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
          </div>

          {/* Members Count */}
          <div className="bg-white px-6 py-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Members</p>
            <p className="font-semibold">{group.members.length}</p>
          </div>
        </div>

        {/* MEMBERS */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-4">Members</h2>
          <div className="bg-white rounded-2xl shadow max-h-48 overflow-y-auto">
            {group.members.map((m, i) => (
              <div key={m._id} className="px-4 py-3 border-b">
                {i + 1}. <b>{m.name}</b> — {m.email}
              </div>
            ))}
          </div>
        </div>

        {/* ADD GIFT */}
        <div className="bg-white rounded-2xl p-6 shadow mb-12 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-4">Suggest a Gift 🎁</h3>

          <div className="flex flex-col gap-3">
            <input
              className="w-full border px-4 py-2 rounded-full text-sm focus:ring-2 focus:ring-pink-300"
              placeholder="Gift name"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
            />

            <input
              className="w-full border px-4 py-2 rounded-full text-sm focus:ring-2 focus:ring-pink-300"
              placeholder="Image URL"
              value={giftImage}
              onChange={(e) => setGiftImage(e.target.value)}
            />

            <input
              className="w-full border px-4 py-2 rounded-full text-sm focus:ring-2 focus:ring-pink-300"
              placeholder="Product link"
              value={giftLink}
              onChange={(e) => setGiftLink(e.target.value)}
            />

            <button
              onClick={handleAddGift}
              className="mt-2 self-start bg-pink-500 text-white px-6 py-2 rounded-full text-sm hover:bg-pink-600 transition"
            >
              Add Gift
            </button>
          </div>
        </div>

        {/* GIFTS */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-4">Gift Suggestions</h2>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {gifts.map((gift) => {
              const hasVoted = gift.votes.includes(currentUser._id);

              return (
                <div
                  key={gift._id}
                  className="min-w-[240px] bg-white rounded-2xl shadow p-4"
                >
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="h-40 w-full object-cover rounded mb-3"
                  />

                  <p className="font-semibold">{gift.name}</p>
                  <p className="text-sm text-gray-500">
                    👍 {gift.votes.length} votes
                  </p>

                  <a
                    href={gift.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-500 text-sm underline block mt-1"
                  >
                    View product
                  </a>

                  <button
                    disabled={hasVoted}
                    onClick={() => handleVote(gift._id)}
                    className={`mt-3 w-full py-1 rounded ${
                      hasVoted
                        ? "bg-gray-300"
                        : "bg-pink-500 text-white"
                    }`}
                  >
                    {hasVoted ? "Voted" : "Vote"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* VOTE SUMMARY */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Vote Summary</h2>
          <div className="bg-white rounded-2xl shadow p-4">
            {sortedGifts.map((gift, i) => (
              <div key={gift._id} className="py-2 border-b last:border-b-0">
                {i + 1}. {gift.name} — {gift.votes.length} votes
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default GroupPage;
