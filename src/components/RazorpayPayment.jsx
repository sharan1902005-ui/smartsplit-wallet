import axios from "axios";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function RazorpayPayment({ group }) {
  const handlePayment = async () => {
    const amount = prompt("Enter payment amount");

    if (!amount || Number(amount) <= 0) return;

    try {
      let order_id, amount_paise, currency;

      if (import.meta.env.DEV) {
        // Local dev: skip backend, call Razorpay directly
        amount_paise = Number(amount) * 100;
        currency = "INR";
      } else {
        // Production (Vercel): create order via backend
        const { data } = await axios.post("/api/create-order", {
          amount: Number(amount),
        });
        order_id = data.id;
        amount_paise = data.amount;
        currency = data.currency;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount_paise,
        currency,
        name: "SmartSplit Wallet",
        description: "Wallet Funding",
        ...(order_id && { order_id }),

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
          window.location.reload();
        },

        theme: {
          color: "#6366f1",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Check console for details.");
    }
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
