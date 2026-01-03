import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import API from "../services/api";

/* -------- helper: get userId from JWT -------- */
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
};

/* -------- helper: generate avatar -------- */
const getAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=random&color=fff`;

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [giftName, setGiftName] = useState("");
  const [giftImage, setGiftImage] = useState("");
  const [giftLink, setGiftLink] = useState("");

  const token = localStorage.getItem("token");
  const currentUserId = getUserIdFromToken();

  const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");

const fetchMessages = async () => {
  const res = await API.get(`/api/chat/${groupId}/messages`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  setMessages(res.data);
};

useEffect(() => {
  fetchMessages();
}, []);

const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const res = await API.post(
    `/api/chat/${groupId}/messages`,
    { text: newMessage },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setMessages((prev) => [...prev, res.data]);
  setNewMessage("");
};

  /* -------- fetch group -------- */
  const fetchGroup = async () => {
    try {
      const res = await API.get(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data);
    } catch {
      alert("Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  /* -------- fetch gifts -------- */
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

  /* -------- add gift -------- */
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

  /* -------- vote -------- */
  const handleVote = async (giftId) => {
    await API.post(
      `/api/gifts/${giftId}/vote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchGifts();
  };

  /* -------- confirm gift (organizer) -------- */
  const handleConfirmGift = async (giftId) => {
    try {
      const res = await API.patch(
        `/api/groups/${groupId}/confirm-gift`,
        { giftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(res.data.group);
    } catch {
      alert("Failed to confirm gift");
    }
  };

  /* -------- proceed to payment -------- */
  const handleProceedToPayment = async () => {
    const ok = window.confirm(
      "Once proceeded, you cannot change the gift. Continue?"
    );
    if (!ok) return;

    await API.patch(
      `/api/groups/${groupId}/open-payment`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchGroup();
  };

  const handleUndoConfirm = async () => {
    const res = await API.patch(
      `/api/groups/${groupId}/undo-confirm`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setGroup(res.data.group);
  };

  if (loading) {
    return (
      <>
     
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
      
        <div className="min-h-screen flex items-center justify-center">
          Group not found
        </div>
      </>
    );
  }

  const isOrganizer =
    String(group.createdBy) === String(currentUserId);

  const sortedGifts = [...gifts].sort(
    (a, b) => b.votes.length - a.votes.length
  );

  return (
    <>
     

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 px-6 py-12">

        <h1 className="text-4xl font-bold text-center mb-8">
          {group.name}
        </h1>

        {/* INVITE + MEMBERS (MERGED CARD) */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-gray-500">Invite Code</p>
              <p className="font-semibold tracking-widest">
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

            <div className="text-center">
              <p className="text-xs text-gray-500">Total Members</p>
              <p className="text-xl font-bold">
                {group.members.length}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Members
            </p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {group.members.map((member, index) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-gray-400 w-4">
                    {index + 1}.
                  </span>

                  <img
                    src={getAvatar(member.name)}
                    alt={member.name}
                    className="w-7 h-7 rounded-full"
                  />

                  <div>
                    <p className="font-medium text-gray-800">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 💬 GROUP CHAT */}
<div className="bg-blue-50 border border-blue-200 rounded-lg shadow 
                p-3 mt-6 mb-5 w-[130%] max-w-2xl mx-auto m-2">
  <h3 className="text-sm font-semibold mb-2 text-blue-900 text-center">
    Group Chat
  </h3>

  <div className="h-40 overflow-y-auto border rounded p-2 space-y-1 mb-2 text-sm bg-white">
    {messages.map((msg) => (
      <div key={msg._id}>
        <span className="font-medium">{msg.sender.name}</span>
        <span className="text-gray-400 text-xs ml-1">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <p className="text-gray-700 leading-snug">
          {msg.text}
        </p>
      </div>
    ))}
  </div>

  <div className="flex gap-2">
    <input
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
      placeholder="Type a message…"
    />
    <button
      onClick={sendMessage}
      className="bg-blue-500 hover:bg-blue-900 text-white px-3 text-sm rounded"
    >
      Send
    </button>
  </div>
</div>


        {/* SUGGEST + SUMMARY */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Suggest a Gift 🎁</h3>
            <input className="border px-4 py-2 rounded-full w-full mb-2" placeholder="Gift name" value={giftName} onChange={(e) => setGiftName(e.target.value)} />
            <input className="border px-4 py-2 rounded-full w-full mb-2" placeholder="Image URL" value={giftImage} onChange={(e) => setGiftImage(e.target.value)} />
            <input className="border px-4 py-2 rounded-full w-full mb-3" placeholder="Product link" value={giftLink} onChange={(e) => setGiftLink(e.target.value)} />
            <button onClick={handleAddGift} className="bg-pink-500 text-white px-6 py-2 rounded-full">
              Add Gift
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Vote Summary</h3>
            {sortedGifts.map((g, i) => (
              <div key={g._id} className="flex justify-between border-b py-1">
                <span>{i + 1}. {g.name}</span>
                <span>{g.votes.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GIFT SUGGESTIONS */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-4">Gift Suggestions</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {gifts.map((gift) => {
              const isFinalized =
                group.finalGift &&
                String(group.finalGift._id || group.finalGift) ===
                  String(gift._id);

              return (
                <div key={gift._id} className="min-w-[240px] bg-white rounded-2xl shadow p-4">
                  <img src={gift.image} alt={gift.name} className="h-40 w-full object-cover rounded mb-3" />
                  <p className="font-semibold">{gift.name}</p>
                   {/* ✅ VIEW PRODUCT LINK */}
  {gift.link && (
    <a
      href={gift.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 underline block mt-1"
    >
      View Product
    </a>
  )}
                  <p className="text-sm text-gray-500">👍 {gift.votes.length} votes</p>

                  <button
                    onClick={() => handleVote(gift._id)}
                    disabled={!!group.finalGift}
                    className={`mt-3 w-full py-1 rounded text-white ${
                      group.finalGift ? "bg-gray-300" : "bg-pink-500"
                    }`}
                  >
                    Vote
                  </button>

                  {isOrganizer && (
                    <button
                      onClick={() => handleConfirmGift(gift._id)}
                      disabled={!!group.finalGift}
                      className={`mt-2 w-full py-1 rounded text-white ${
                        group.finalGift ? "bg-gray-300" : "bg-green-500"
                      }`}
                    >
                      {isFinalized ? "Finalized" : "Confirm Gift"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FINALIZED GIFT */}
        {group.finalGift && (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">🎁 Finalized Gift</h2>
            <div className="bg-white rounded-2xl shadow p-6">
              <img src={group.finalGift.image} alt="" className="h-48 w-full object-cover rounded mb-4" />
              <h3 className="font-semibold text-lg">{group.finalGift.name}</h3>

              {!group.paymentOpen && isOrganizer && (
                <button onClick={handleProceedToPayment} className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-full">
                  Proceed to Payment
                </button>
              )}

              {group.paymentOpen && (
                <button onClick={() => navigate(`/groups/${groupId}/contributions`)} className="mt-4 bg-pink-500 text-white px-8 py-2 rounded-full">
                  Contribute
                </button>
              )}

              {isOrganizer && !group.paymentOpen && (
                <button onClick={handleUndoConfirm} className="mt-6 bg-gray-300 px-6 py-2 rounded-full">
                  Undo Selection
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupPage;
