import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const ContributionPage = () => {
  const { groupId } = useParams();
  const token = localStorage.getItem("token");
  const userId = JSON.parse(atob(token.split(".")[1])).id;

  const [group, setGroup] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Amount setup
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [totalContributionAmount, setTotalContributionAmount] = useState(null);
  const [inputAmount, setInputAmount] = useState("");

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [upiRef, setUpiRef] = useState("");

  const isOrganizer = group && group.createdBy === userId;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const [groupRes, contributionRes] = await Promise.all([
        API.get(`/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get(`/api/contributions/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setGroup(groupRes.data);
      setContributions(contributionRes.data);

      // One-time total amount check (per group)
      const savedAmount = localStorage.getItem(
        `totalAmount_${groupRes.data._id}`
      );

      if (savedAmount) {
        setTotalContributionAmount(Number(savedAmount));
      } else {
        setShowAmountModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Failed to load contribution data");
    }
  };

  /* ================= SET TOTAL AMOUNT ================= */
  const handleSetAmount = () => {
    const amount = Number(inputAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setTotalContributionAmount(amount);
    localStorage.setItem(`totalAmount_${group._id}`, amount);
    setShowAmountModal(false);
  };

  /* ================= PAY NOW ================= */
  const handlePayNow = (contribution) => {
    setSelectedContribution(contribution);
    setShowPaymentModal(true);

    if (group?.organizerUpi) {
      const upiUrl = `upi://pay?pa=${group.organizerUpi}&pn=Gift Organizer&am=${perMemberAmount}&cu=INR&tn=Gift Contribution`;
      window.location.href = upiUrl;
    }
  };

  /* ================= MARK PAID ================= */
  const handleMarkAsPaid = async () => {
    if (!upiRef.trim()) {
      alert("Please enter UPI reference ID");
      return;
    }

    try {
      await API.patch(
        `/api/contributions/${selectedContribution._id}/proof`,
        { paymentProof: upiRef },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await API.patch(
        `/api/contributions/${selectedContribution._id}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowPaymentModal(false);
      setSelectedContribution(null);
      setUpiRef("");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to mark payment as paid");
    }
  };

  /* ================= CONFIRM PAYMENT ================= */
  const handleConfirmPayment = async (contributionId) => {
    if (!window.confirm("Confirm this payment?")) return;

    try {
      await API.patch(
  `/api/contributions/${contributionId}/confirm`,
  { amount: perMemberAmount }, // 🔥 REQUIRED
  { headers: { Authorization: `Bearer ${token}` } }
);

      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm payment");
    }
  };

  const statusBadge = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "paid") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  if (loading || !group) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  /* ================= CALCULATIONS ================= */
  const totalAmount = totalContributionAmount || 0;

  const perMemberAmount =
    group.members.length > 0
      ? Math.ceil(totalAmount / group.members.length)
      : 0;

  const collectedAmount = contributions
  .filter((c) => c.status === "confirmed")
  .length * perMemberAmount;


  const progressPercent =
    totalAmount === 0 ? 0 : (collectedAmount / totalAmount) * 100;

  return (
    <>
      {/* ================= SET TOTAL AMOUNT MODAL ================= */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Set Total Contribution Amount
            </h2>

            <p className="text-sm text-gray-600 text-center mb-4">
              This amount will be equally split among all members.
            </p>

            <input
              type="number"
              placeholder="Enter total amount (₹)"
              className="border px-3 py-2 rounded w-full mb-4"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
            />

            <button
              onClick={handleSetAmount}
              className="bg-purple-600 text-white w-full py-2 rounded-full"
            >
              Confirm Amount
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN PAGE ================= */}
      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="bg-white rounded-xl shadow p-6 flex gap-6">
            {group.finalGift?.image && (
              <img
                src={group.finalGift.image}
                alt={group.finalGift.name}
                className="w-32 h-32 object-cover rounded"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                🎁 Finalized Gift: {group.finalGift?.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Organizer UPI: <b>{group.organizerUpi}</b>
              </p>
              <p className="text-gray-600">
                {group.members.length} members participating
              </p>
            </div>

            {collectedAmount === totalAmount && totalAmount > 0 && (
              <div className="text-green-600 font-semibold text-sm text-right ml-auto">
                ✅ Total contribution completed <br />
                Product will be ordered by the organizer
              </div>
            )}
          </div>

          {/* PROGRESS */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>Collected ₹{collectedAmount}</span>
              <span>Total ₹{totalAmount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Contributions</h3>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {contributions.map((c) => {
                  const isMe = c.user._id === userId;

                  return (
                    <tr key={c._id} className="border-b last:border-none">
                      <td className="py-3">{c.user.name}</td>
                      <td>₹{perMemberAmount}</td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${statusBadge(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td>
                        {isMe && c.status === "pending" && (
                          <button
                            onClick={() => handlePayNow(c)}
                            className="bg-pink-500 text-white px-4 py-1 rounded"
                          >
                            Pay Now
                          </button>
                        )}

                        {isOrganizer && c.status === "paid" && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                alert(`UPI Reference: ${c.paymentProof}`)
                              }
                              className="text-blue-600 text-sm underline"
                            >
                              View Proof
                            </button>

                            <button
                              onClick={() => handleConfirmPayment(c._id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                            >
                              Confirm
                            </button>
                          </div>
                        )}

                        {c.status === "confirmed" && (
                          <span className="text-green-600 text-sm">
                            Confirmed
                          </span>
                        )}

                        {c.status === "paid" && !isOrganizer && (
                          <span className="text-blue-600 text-sm">
                            Waiting for confirmation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {showPaymentModal && selectedContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 text-center">
              Complete Payment
            </h2>

            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `upi://pay?pa=${group.organizerUpi}&pn=Gift Organizer&am=${perMemberAmount}&cu=INR&tn=Gift Contribution`
                )}`}
                alt="UPI QR"
                className="rounded-lg border"
              />
            </div>

            <p className="text-center text-sm text-gray-600 mb-4">
              Scan QR & pay <b>₹{perMemberAmount}</b>
            </p>

            <input
              type="text"
              placeholder="Enter UPI Transaction ID"
              className="border px-3 py-2 rounded w-full mb-4"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
            />

            <button
              onClick={handleMarkAsPaid}
              className="bg-green-600 text-white w-full py-2 rounded-full"
            >
              Mark as Paid
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContributionPage;
