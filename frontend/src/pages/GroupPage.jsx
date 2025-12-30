import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
    console.log("Sending confirm for:", giftId);

    const res = await API.patch(
      `/api/groups/${groupId}/confirm-gift`,
      { giftId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Confirm response:", res.data);

    // 🔥 THIS IS THE FIX
    setGroup(res.data.group);

  } catch (err) {
    console.error(
      "Confirm failed:",
      err.response?.data || err.message
    );
    alert("Failed to confirm gift");
  }
};



  /* -------- proceed to payment -------- */
  const handleProceedToPayment = async () => {
    const ok = window.confirm(
      "Once proceeded, you cannot change the gift. Continue?"
    );
    if (!ok) return;

    try {
      await API.patch(
        `/api/groups/${groupId}/open-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGroup();
    } catch {
      alert("Failed to open payments");
    }
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
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading...
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

  const isOrganizer =
    String(group.createdBy) === String(currentUserId);

  const sortedGifts = [...gifts].sort(
    (a, b) => b.votes.length - a.votes.length
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 px-6 py-12">

        <h1 className="text-4xl font-bold text-center mb-8">
          {group.name}
        </h1>

        {/* INVITE + MEMBERS */}
        <div className="flex justify-center gap-8 mb-10">
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

          <div className="bg-white px-6 py-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Members</p>
            <p className="font-semibold">{group.members.length}</p>
          </div>
        </div>

        {/* SUGGEST + SUMMARY */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Suggest a Gift 🎁</h3>
            <input
              className="border px-4 py-2 rounded-full w-full mb-2"
              placeholder="Gift name"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
            />
            <input
              className="border px-4 py-2 rounded-full w-full mb-2"
              placeholder="Image URL"
              value={giftImage}
              onChange={(e) => setGiftImage(e.target.value)}
            />
            <input
              className="border px-4 py-2 rounded-full w-full mb-3"
              placeholder="Product link"
              value={giftLink}
              onChange={(e) => setGiftLink(e.target.value)}
            />
            <button
              onClick={handleAddGift}
              className="bg-pink-500 text-white px-6 py-2 rounded-full"
            >
              Add Gift
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Vote Summary</h3>
            {sortedGifts.map((g, i) => (
              <div
                key={g._id}
                className="flex justify-between border-b py-1"
              >
                <span>{i + 1}. {g.name}</span>
                <span>{g.votes.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GIFT SUGGESTIONS */}
        {/* GIFT SUGGESTIONS */}
<div className="max-w-5xl mx-auto mb-12">
  <h2 className="text-xl font-semibold mb-4">Gift Suggestions</h2>

  <div className="flex gap-6 overflow-x-auto pb-4 pointer-events-auto">
    {gifts.map((gift) => {
      const isFinalized =
        group.finalGift &&
        String(group.finalGift._id || group.finalGift) ===
          String(gift._id);

      return (
        <div
          key={gift._id}
          className="min-w-[240px] bg-white rounded-2xl shadow p-4 relative pointer-events-auto"
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
            className="text-pink-500 text-sm underline"
          >
            View product
          </a>

          {/* VOTE */}
          <button
            onClick={() => handleVote(gift._id)}
            disabled={!!group.finalGift}
            className={`mt-3 w-full py-1 rounded text-white ${
              group.finalGift
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            Vote
          </button>

          {/* CONFIRM (ORGANIZER ONLY) */}
          {isOrganizer && (
            <button
              onClick={() => handleConfirmGift(gift._id)}
              disabled={!!group.finalGift}
              className={`mt-2 w-full py-1 rounded text-white ${
                group.finalGift
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
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
       {group.finalGift && typeof group.finalGift === "object" && (
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-xl font-semibold mb-4">🎁 Finalized Gift</h2>

    <div className="bg-white rounded-2xl shadow p-6">
      {/* IMAGE */}
      {group.finalGift.image && (
        <img
          src={group.finalGift.image}
          alt={group.finalGift.name || "Finalized gift"}
          className="h-48 w-full object-cover rounded mb-4"
        />
      )}

      {/* NAME */}
      <h3 className="font-semibold text-lg">
        {group.finalGift.name || "Selected Gift"}
      </h3>

      {/* PRODUCT LINK */}
      {group.finalGift.link && (
        <a
          href={group.finalGift.link}
          target="_blank"
          rel="noreferrer"
          className="text-pink-500 underline block mt-2"
        >
          View product
        </a>
      )}

      {/* MEMBER VIEW */}
      {!group.paymentOpen && !isOrganizer && (
        <p className="mt-4 text-gray-500">
          ⏳ Waiting for organizer to proceed to payment
        </p>
      )}

      {/* ORGANIZER VIEW */}
      {!group.paymentOpen && isOrganizer && (
        <button
          onClick={handleProceedToPayment}
          className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-full"
        >
          Proceed to Payment
        </button>
      )}
      {isOrganizer && !group.paymentOpen && (
  <button
    onClick={handleUndoConfirm}
    className="mt-7 bg-gray-300 text-black px-6 py-2 rounded-full"
  >
    Undo Selection
  </button>
)}


      {/* PAYMENT OPEN */}
      {group.paymentOpen && (
        <button
          onClick={() =>
            navigate(`/groups/${groupId}/contributions`)
          }
          className="mt-4 bg-pink-500 text-white px-8 py-2 rounded-full"
        >
          Contribute
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
