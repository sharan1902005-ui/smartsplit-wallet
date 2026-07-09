import { useState } from "react";
import { doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { auth, db } from "../firebase/config";
import { submitExpense } from "../utils/expenseWorkflow";

export default function ExpenseRequestForm({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const submitRequest = async () => {
    if (!title || !amount) {
      alert("Fill all fields");
      return;
    }

    try {
      const result = await submitExpense(
        doc(db, "groups", group.id),
        group,
        {
          title,
          amount: Number(amount),
          category,
          source: "expense-request-form",
        },
        auth.currentUser
      );

      setTitle("");
      setAmount("");
      setCategory("Food");

      toast.success(
        result.status === "pending"
          ? "Expense request submitted"
          : "Expense added successfully"
      );
    } catch (error) {
      toast.error(error.message || "Failed to submit expense");
    }
  };

  return (
    <div className="bg-[#F8F4EA] rounded-md shadow-xl border border-[#C7B98F] p-8">
      <h2 className="text-3xl font-bold text-[#B23A2E] mb-6">
        Request Payment
      </h2>

      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] mb-4"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] mb-6"
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Fuel</option>
        <option>Hotel</option>
        <option>Shopping</option>
      </select>

      <button
        onClick={submitRequest}
        className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] font-bold p-4 rounded-md"
      >
        Submit Expense Request
      </button>
    </div>
  );
}
