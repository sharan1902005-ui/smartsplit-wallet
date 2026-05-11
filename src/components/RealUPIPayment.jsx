import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import {
  Wallet,
  Smartphone,
  Loader2,
} from "lucide-react";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      // Create Razorpay order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      const order = await res.json();

      if (!order?.id) {
        throw new Error("Failed to create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SmartSplit Wallet",
        description: `Top up ${group.name}`,
        order_id: order.id,

        prefill: {
          name:
            auth.currentUser?.displayName ||
            "SmartSplit User",
          email:
            auth.currentUser?.email || "",
        },

        theme: {
          color: "#ef4444",
        },

        handler: async function (response) {
          try {
            const depositAmount =
              Number(amount);

            await updateDoc(
              doc(db, "groups", group.id),
              {
                walletBalance:
                  (group.walletBalance || 0) +
                  depositAmount,

                totalIncome:
                  (group.totalIncome || 0) +
                  depositAmount,

                transactions: arrayUnion({
                  type: "deposit",
                  amount: depositAmount,
                  user:
                    auth.currentUser.uid,
                  userName:
                    auth.currentUser
                      .displayName ||
                    auth.currentUser
                      .email ||
                    "User",
                  paymentId:
                    response.razorpay_payment_id,
                  orderId:
                    response.razorpay_order_id,
                  source: "Razorpay",
                  createdAt:
                    new Date().toISOString(),
                }),

                activityTimeline:
                  arrayUnion({
                    type: "deposit",
                    text: `${
                      auth.currentUser
                        .displayName ||
                      auth.currentUser
                        .email
                    } added ₹${depositAmount} to shared wallet`,
                    createdAt:
                      new Date().toISOString(),
                  }),
              }
            );

            alert(
              "Payment successful! Wallet updated."
            );

            setAmount("");
          } catch (err) {
            alert(
              "Payment succeeded but wallet update failed."
            );
            console.error(err);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razor = new window.Razorpay(
        options
      );
      razor.open();

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl">
          <Wallet size={24} />
        </div>

        <div>
          <h2 className="text-3xl font-black">
            Add Money to Shared Wallet
          </h2>

          <p className="text-slate-500 mt-1">
            Pay using UPI, GPay, PhonePe,
            cards
          </p>
        </div>
      </div>

      <div className="bg-[#fff8f2] dark:bg-slate-800 rounded-2xl p-6 mb-6">
        <p className="text-slate-500 text-sm">
          Current Shared Wallet
        </p>

        <p className="text-4xl font-black text-red-500 mt-2">
          ₹{group.walletBalance || 0}
        </p>
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
        className="w-full p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6"
      />

      <button
        onClick={startPayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <Loader2
              size={20}
              className="animate-spin"
            />
            Processing...
          </>
        ) : (
          <>
            <Smartphone size={20} />
            Pay with Razorpay
          </>
        )}
      </button>
    </div>
  );
}
