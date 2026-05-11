import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import toast from "react-hot-toast";
import {
  Wallet,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [paymentStarted, setPaymentStarted] =
    useState(false);

  const upiUrl =
    amount && group.adminUpi
      ? `upi://pay?pa=${group.adminUpi}&pn=SmartSplit Wallet&am=${amount}&cu=INR`
      : "";

  const payViaUPI = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (!group.adminUpi) {
      alert("Admin UPI not configured");
      return;
    }

    window.location.href = upiUrl;
    setPaymentStarted(true);
  };

  const confirmPayment = async () => {
    if (!paymentStarted) {
      alert("Start payment first");
      return;
    }

    if (!utr.trim()) {
      alert("Enter UTR / transaction ID");
      return;
    }

    if (utr.trim().length < 8) {
      alert("Enter valid UTR");
      return;
    }

    try {
      const depositAmount = Number(amount);

      await updateDoc(doc(db, "groups", group.id), {
        depositRequests: arrayUnion({
          amount: depositAmount,
          utr: utr,
          user: auth.currentUser.uid,
          userName:
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "User",
          status: "pending",
          createdAt: new Date().toISOString(),
        }),

        activityTimeline: arrayUnion({
          type: "deposit_request",
          text: `${
            auth.currentUser.displayName ||
            auth.currentUser.email
          } requested deposit approval for ₹${depositAmount}`,
          createdAt: new Date().toISOString(),
        }),
      });

      toast.success("Deposit request sent to admin for approval");

      setAmount("");
      setUtr("");
      setPaymentStarted(false);
    } catch (err) {
      console.error(err);
      toast.error("Request failed");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl">
          <Wallet size={24} />
        </div>

        <div>
          <h2 className="text-3xl font-black">
            Add Money to Shared Wallet
          </h2>

          <p className="text-slate-500 mt-1">
            Pay directly to admin wallet
          </p>
        </div>
      </div>

      <div className="bg-[#fff8f2] rounded-2xl p-6 mb-6">
        <p className="text-slate-500 text-sm">
          Shared Wallet Balance
        </p>

        <p className="text-4xl font-black text-red-500 mt-2">
          ₹{group.walletBalance || 0}
        </p>

        <p className="text-sm text-slate-500 mt-4">
          Admin UPI:
          <span className="font-bold ml-2">
            {group.adminUpi}
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
        className="w-full p-4 rounded-2xl border border-red-100 bg-white mb-5"
      />

      <input
        type="text"
        placeholder="Enter UTR / Transaction ID"
        value={utr}
        onChange={(e) => setUtr(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 bg-white mb-5"
      />

      {amount && (
        <div className="bg-[#fffdf8] border border-orange-100 rounded-2xl p-6 mb-5 flex flex-col items-center">
          <p className="font-semibold mb-4">
            Scan to Pay
          </p>

          <QRCodeCanvas
            value={upiUrl}
            size={200}
          />
        </div>
      )}

      <button
        onClick={payViaUPI}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 mb-4"
      >
        <Smartphone size={20} />
        Pay via GPay / PhonePe
      </button>

      {paymentStarted && (
        <button
          onClick={confirmPayment}
          className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3"
        >
          <CheckCircle size={20} />
          I Completed Payment
        </button>
      )}
    </div>
  );
}