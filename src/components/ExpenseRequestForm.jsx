import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function ExpenseRequestForm({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const submitRequest = async () => {
    if (!title || !amount) {
      alert("Fill all fields");
      return;
    }

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: arrayUnion({
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        requestedBy: auth.currentUser.uid,
        requestedByName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "User",
        status: "pending",
        createdAt: new Date().toISOString(),
      }),

      activityTimeline: arrayUnion({
        type: "request",
        text: `${
          auth.currentUser.displayName ||
          auth.currentUser.email
        } requested ₹${amount} for ${title}`,
        createdAt: new Date().toISOString(),
      }),
    });

    setTitle("");
    setAmount("");
    setCategory("Food");

    alert("Expense request submitted");
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Request Payment
      </h2>

      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 mb-4"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-4 rounded-2xl border border-red-100 mb-6"
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Fuel</option>
        <option>Hotel</option>
        <option>Shopping</option>
      </select>

      <button
        onClick={submitRequest}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold p-4 rounded-2xl"
      >
        Submit Expense Request
      </button>
    </div>
  );
}
