import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Wallet, Smartphone, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");

  const validUpi =
    group?.adminUpi &&
    group.adminUpi.includes("@");

  const upiLink =
    validUpi && amount
      ? `upi://pay?pa=${group.adminUpi}&pn=${encodeURIComponent(
          group.name || "SmartSplit"
        )}&am=${Number(amount)}&cu=INR`
      : "";

  const payWithUPI = () => {
    if (!validUpi) {
      alert("Invalid UPI ID");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (!isMobile) {
      alert(
        "UPI apps open only on mobile. Use QR scan from phone."
      );
      return;
    }

    window.location.href = upiLink;
  };

  const confirmPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    await updateDoc(doc(db, "groups", group.id), {
      walletBalance: group.walletBalance + Number(amount),

      transactions: arrayUnion({
        type: "deposit",
        amount: Number(amount),
        user: auth.currentUser.uid,
        userName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "User",
        userPhoto:
          auth.currentUser.photoURL || "",
        source: "UPI",
        createdAt: new Date().toISOString(),
      }),

      activityTimeline: arrayUnion({
        type: "deposit",
        text: `${
          auth.currentUser.displayName ||
          auth.currentUser.email
        } added ₹${amount} to shared wallet`,
        createdAt: new Date().toISOString(),
      }),
    });

    setAmount("");
    alert("Payment recorded");
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500 text-white p-3 rounded-2xl">
          <Wallet size={22} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Shared Wallet Payment
          </h2>
          <p className="text-slate-500">
            Real GPay / PhonePe / Paytm payments
          </p>
        </div>
      </div>

      <div className="bg-[#fff8f2] rounded-2xl border border-orange-100 p-5 mb-6">
        <p className="text-sm text-slate-500 mb-2">
          Common Wallet UPI
        </p>

        <p className="text-xl font-bold text-red-600">
          {group.adminUpi || "No UPI configured"}
        </p>
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 mb-6"
      />

      {validUpi && amount && Number(amount) > 0 && (
        <div className="bg-[#fffdf7] border border-yellow-100 rounded-3xl p-6 flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="text-red-500" />
            <span className="font-semibold">
              Scan to Pay
            </span>
          </div>

          <QRCodeSVG value={String(upiLink)} size={200} />
        </div>
      )}

      <button
        onClick={payWithUPI}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold p-4 rounded-2xl mb-4"
      >
        Pay via UPI App
      </button>

      <button
        onClick={confirmPayment}
        className="w-full bg-green-50 border border-green-200 text-green-700 font-bold p-4 rounded-2xl"
      >
        I Completed Payment
      </button>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        <Smartphone size={16} />
        Opens installed UPI apps automatically
      </div>
    </div>
  );
}
