import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function ExpenseRequests({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState("Food");

  const addExpense = async () => {
    if (!title || !amount) {
      alert("Fill all fields");
      return;
    }

    const expenseAmount =
      Number(amount);

    if (
      expenseAmount >
      (group.walletBalance || 0)
    ) {
      alert(
        "Not enough wallet balance"
      );
      return;
    }

    try {
      const groupRef = doc(
        db,
        "groups",
        group.id
      );

      await updateDoc(groupRef, {
        walletBalance:
          (group.walletBalance || 0) -
          expenseAmount,

        transactions: arrayUnion({
          type: "expense",
          title,
          amount: expenseAmount,
          category,
          userName:
            auth.currentUser
              ?.displayName ||
            auth.currentUser
              ?.email ||
            "Member",
          userId:
            auth.currentUser
              ?.uid || "",
          createdAt:
            new Date().toISOString(),
        }),
      });

      setTitle("");
      setAmount("");
      setCategory("Food");

      alert(
        "Expense added successfully"
      );
    } catch (err) {
      console.error(err);
      alert(
        "Failed to add expense"
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-red-100 dark:border-slate-700">
      <h2 className="text-3xl font-black text-red-600 mb-8">
        Add Expense
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-900"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          className="p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-900"
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          className="p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Fuel</option>
          <option>Shopping</option>
          <option>Hotel</option>
        </select>

        <button
          onClick={addExpense}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold w-full md:w-auto p-4"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
