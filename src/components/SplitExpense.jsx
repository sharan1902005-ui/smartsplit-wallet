import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function SplitExpense({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const members = group.members || [];

  const toggleMember = (uid) => {
    if (selectedMembers.includes(uid)) {
      setSelectedMembers(
        selectedMembers.filter((id) => id !== uid)
      );
    } else {
      setSelectedMembers([...selectedMembers, uid]);
    }
  };

  const addSplitExpense = async () => {
    if (
      !title ||
      !amount ||
      selectedMembers.length === 0
    ) {
      alert("Fill all fields");
      return;
    }

    const share =
      Number(amount) / selectedMembers.length;

    await updateDoc(doc(db, "groups", group.id), {
      transactions: arrayUnion({
        type: "split",
        title,
        amount: Number(amount),
        category,
        splitMembers: selectedMembers,
        sharePerPerson: share,
        user: auth.currentUser.uid,
        userName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "User",
        createdAt: new Date().toISOString(),
      }),
    });

    setTitle("");
    setAmount("");
    setSelectedMembers([]);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Split Specific Expense
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

      <div className="mb-6">
        <p className="font-semibold text-slate-700 mb-3">
          Select members
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {members.map((member) => (
            <button
              key={member.uid}
              onClick={() =>
                toggleMember(member.uid)
              }
              className={`p-4 rounded-2xl border text-left ${
                selectedMembers.includes(member.uid)
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white border-red-100"
              }`}
            >
              <div className="font-bold">
                {member.name}
              </div>
              <div className="text-sm opacity-70">
                {member.email}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMembers.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
          Share per person:
          <span className="font-bold text-red-600 ml-2">
            ₹
            {(
              Number(amount || 0) /
              selectedMembers.length
            ).toFixed(0)}
          </span>
        </div>
      )}

      <button
        onClick={addSplitExpense}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold p-4 rounded-2xl"
      >
        Add Split Expense
      </button>
    </div>
  );
}
