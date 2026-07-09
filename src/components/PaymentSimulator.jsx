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
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        UPI Payment Simulator
      </h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={payAmount}
        onChange={(e) => setPayAmount(e.target.value)}
        className="w-full p-4 rounded-md bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6] mb-4"
      />

      <button
        onClick={simulatePayment}
        className="w-full bg-[#3F6B4F] text-[#F8F4EA] p-4 rounded-md"
      >
        Pay to Wallet
      </button>
    </div>
  );
}
