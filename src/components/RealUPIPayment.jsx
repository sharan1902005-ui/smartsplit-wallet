import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Smartphone, Wallet, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");

  const upiLink =
    amount && group.adminUpi
      ? `upi://pay?pa=${group.adminUpi}&pn=${encodeURIComponent(
          group.name
        )}&am=${amount}&cu=INR`
      : "";

  const payWithUPI = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    window.location.href = upiLink;
  };

  const confirmPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter amount first");
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
    });

    alert("Payment recorded successfully!");
    setAmount("");
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500 text-white p-3 rounded-2xl">
          <Wallet size={24} />
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

      {/* UPI ID */}
      <div className="bg-[#fff8f2] rounded-2xl border border-orange-100 p-5 mb-6">
        <p className="text-sm text-slate-500 mb-2">
          Common Wallet UPI
        </p>

        <p className="text-xl font-bold text-red-600">
          {group.adminUpi}
        </p>
      </div>

      {/* Amount */}
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 mb-6"
      />

      {/* QR */}
      {amount && (
        <div className="bg-[#fffdf7] border border-yellow-100 rounded-3xl p-6 flex flex-col items-center mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="text-red-500" />
            <span className="font-semibold text-slate-700">
              Scan to Pay
            </span>
          </div>

          <QRCode
            value={upiLink}
            size={200}
            bgColor="#ffffff"
            fgColor="#111827"
          />

          <p className="text-slate-500 text-sm mt-4 text-center">
            Scan using Google Pay / PhonePe / Paytm
          </p>
        </div>
      )}

      {/* Buttons */}
      <button
        onClick={payWithUPI}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold p-4 rounded-2xl shadow-xl mb-4"
      >
        Pay via UPI App
      </button>

      <button
        onClick={confirmPayment}
        className="w-full border border-green-200 bg-green-50 text-green-700 font-bold p-4 rounded-2xl"
      >
        I Completed Payment
      </button>

      <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
        <Smartphone size={16} />
        Opens installed UPI apps automatically
      </div>
    </div>
  );
}
