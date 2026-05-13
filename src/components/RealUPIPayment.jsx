import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Smartphone,
  Wallet,
  CheckCircle,
  Trophy,
} from "lucide-react";
import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");
  const [paymentStarted, setPaymentStarted] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const adminUpi = group?.adminUpi || "";

  const upiUrl =
    amount && adminUpi
      ? `upi://pay?pa=${encodeURIComponent(
          adminUpi
        )}&pn=${encodeURIComponent(
          group.name || "SmartSplit"
        )}&am=${encodeURIComponent(
          amount
        )}&cu=INR`
      : "";

  const payOnPhone = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (!adminUpi) {
      alert("Admin UPI not configured");
      return;
    }

    setPaymentStarted(true);
    window.location.href = upiUrl;
  };

  const confirmPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      const groupRef = doc(
        db,
        "groups",
        group.id
      );

      await updateDoc(groupRef, {
        walletBalance:
          (group.walletBalance || 0) +
          Number(amount),

        transactions: arrayUnion({
          type: "deposit",
          amount: Number(amount),
          title: "Wallet Deposit",
          userName:
            auth.currentUser?.displayName ||
            auth.currentUser?.email ||
            "Member",
          userId:
            auth.currentUser?.uid || "",
          createdAt:
            new Date().toISOString(),
        }),
      });

      alert(
        "Payment confirmed. Wallet updated."
      );

      setAmount("");
      setPaymentStarted(false);
    } catch (error) {
      console.error(error);
      alert(
        "Failed to update wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  const depositTransactions =
    group?.transactions?.filter(
      (t) => t.type === "deposit"
    ) || [];

  const contributorsMap = {};

  depositTransactions.forEach((txn) => {
    const name =
      txn.userName || "Unknown";

    contributorsMap[name] =
      (contributorsMap[name] || 0) +
      txn.amount;
  });

  const contributors =
    Object.entries(contributorsMap)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort(
        (a, b) => b.total - a.total
      );

  const getAvatar = (name) =>
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || "user")}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl">
          <Wallet size={24} />
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Add Money
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            Pay directly to shared wallet UPI
          </p>
        </div>
      </div>

      <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-6 mb-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Wallet Balance
        </p>

        <p className="text-4xl font-black text-red-500 mt-2">
          ₹{group.walletBalance || 0}
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Admin UPI:
          <span className="font-bold ml-2 text-slate-900 dark:text-white">
            {adminUpi || "Not configured"}
          </span>
        </p>
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
        className="w-full p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-6"
      />

      {amount &&
        Number(amount) > 0 &&
        adminUpi && (
          <div className="bg-[#fffdf8] dark:bg-slate-900 border border-orange-100 dark:border-slate-700 rounded-3xl p-6 mb-6 flex flex-col items-center">
            <p className="font-bold text-slate-900 dark:text-white mb-4">
              Scan QR to Pay
            </p>

            <QRCodeCanvas
              value={upiUrl}
              size={220}
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
              Scan with Google Pay / PhonePe / Paytm
            </p>
          </div>
        )}

      <button
        onClick={payOnPhone}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3"
      >
        <Smartphone size={20} />
        Pay on This Phone
      </button>

      {paymentStarted && (
        <>
          <div className="mt-4 bg-yellow-50 dark:bg-slate-900 border border-yellow-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="text-green-500" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              After completing payment, click confirm payment.
            </p>
          </div>

          <button
            onClick={confirmPayment}
            disabled={loading}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl font-bold"
          >
            {loading
              ? "Updating..."
              : "Confirm Payment"}
          </button>
        </>
      )}

      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="text-yellow-500" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Shared Wallet Contributors
          </h3>
        </div>

        {contributors.length === 0 ? (
          <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-6 text-center text-slate-500">
            No contributions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map(
              (contributor, index) => (
                <div
                  key={index}
                  className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getAvatar(
                        contributor.name
                      )}
                      alt={
                        contributor.name
                      }
                      className="w-14 h-14 rounded-full"
                    />

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {contributor.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Contributor
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-red-500 font-black text-xl">
                      ₹
                      {
                        contributor.total
                      }
                    </p>

                    {index === 0 && (
                      <p className="text-xs text-yellow-600 font-bold">
                        Top Contributor
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
