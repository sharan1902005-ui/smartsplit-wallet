import axios from "axios";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function RazorpayPayment({ group }) {
  const handlePayment = async () => {
    const amount = prompt("Enter payment amount");

    if (!amount) return;

    const { data } = await axios.post("/api/create-order", {
      amount: Number(amount),
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "SmartSplit Wallet",
      description: "Wallet Funding",
      order_id: data.id,

      handler: async function () {
        await updateDoc(doc(db, "groups", group.id), {
          walletBalance: group.walletBalance + Number(amount),

          transactions: arrayUnion({
            type: "deposit",
            amount: Number(amount),
            user: auth.currentUser.uid,
            source: "Razorpay",
            createdAt: new Date().toISOString(),
          }),
        });

        alert("Payment successful!");
      },

      theme: {
        color: "#6366f1",
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <button
        onClick={handlePayment}
        className="w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl"
      >
        Pay via UPI / Razorpay
      </button>
    </div>
  );
}
