import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function PaymentSimulator({ group }) {
  const [payAmount, setPayAmount] = useState("");

  const simulatePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return;

    await updateDoc(doc(db, "groups", group.id), {
      walletBalance: group.walletBalance + Number(payAmount),
      transactions: arrayUnion({
        type: "deposit",
        amount: Number(payAmount),
        user: auth.currentUser.uid,
        source: "UPI Simulation",
        createdAt: new Date().toISOString(),
      }),
    });

    setPayAmount("");
    window.location.reload();
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        UPI Payment Simulator
      </h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={payAmount}
        onChange={(e) => setPayAmount(e.target.value)}
        className="w-full p-4 rounded-xl bg-slate-800 text-white mb-4"
      />

      <button
        onClick={simulatePayment}
        className="w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl"
      >
        Pay to Wallet
      </button>
    </div>
  );
}
