import { useState } from "react";
import {
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { getMemberName } from "../utils/memberDisplay";
import { submitExpense } from "../utils/expenseWorkflow";

export default function SplitExpense({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const expenseAmount = Number(amount);
    const trimmedTitle = title.trim();

    if (
      !trimmedTitle ||
      !Number.isFinite(expenseAmount) ||
      expenseAmount <= 0 ||
      selectedMembers.length === 0
    ) {
      alert("Enter a title, valid amount, and at least one member");
      return;
    }

    if (!auth.currentUser) {
      alert("Please log in again");
      return;
    }

    const share =
      expenseAmount / selectedMembers.length;

    try {
      setLoading(true);

      const result = await submitExpense(
        doc(db, "groups", group.id),
        group,
        {
          source: "split-specific",
          splitType: "specific",
          title: trimmedTitle,
          amount: expenseAmount,
          category,
          splitMembers: selectedMembers,
          sharePerPerson: Number(share.toFixed(2)),
        },
        auth.currentUser
      );

      setTitle("");
      setAmount("");
      setCategory("Food");
      setSelectedMembers([]);
      alert(
        result.status === "pending"
          ? "Split expense submitted for approval"
          : "Split expense added successfully"
      );
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to add split expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Split Specific Expense
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Choose exactly who should share this spend
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] dark:bg-[#171512] mb-4"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] dark:bg-[#171512] mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] dark:bg-[#171512] mb-6"
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Fuel</option>
        <option>Hotel</option>
        <option>Shopping</option>
      </select>

      <div className="mb-6">
        <p className="font-semibold text-[#24322E] dark:text-[#EFE7D6] mb-3">
          Select members
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {members.map((member) => (
            <button
              key={member.uid}
              onClick={() =>
                toggleMember(member.uid)
              }
              className={`p-4 rounded-md border text-left ${
                selectedMembers.includes(member.uid)
                  ? "bg-[#B23A2E] text-[#F8F4EA] border-[#B23A2E] shadow-lg"
                  : "bg-[#F8F4EA] dark:bg-[#171512] border-[#C7B98F] dark:border-[#3a352b] hover:border-[#B23A2E]"
              }`}
            >
              <div className="font-bold">
                {getMemberName(member)}
              </div>
              <div className="text-sm opacity-70">
                {member.email}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMembers.length > 0 && (
        <div className="bg-[#EAE1CC] dark:bg-[#171512] border border-[#D9A441] rounded-md p-4 mb-6 text-[#24322E] dark:text-[#EFE7D6]">
          Share per person:
          <span className="font-['IBM_Plex_Mono'] font-bold text-[#B23A2E] ml-2">
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
        disabled={loading}
        className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] font-bold p-4 rounded-md disabled:opacity-60 shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? "Adding..." : "Add Split Expense"}
      </button>
    </section>
  );
}

