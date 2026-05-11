import { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useParams } from "react-router-dom";

import ExpenseInsights from "../components/ExpenseInsights";
import ExpenseChart from "../components/ExpenseChart";
import MemberContribution from "../components/MemberContribution";
import AISuggestions from "../components/AISuggestions";
import Notifications from "../components/Notifications";
import RazorpayPayment from "../components/RazorpayPayment";
import GroupChat from "../components/GroupChat";
import PaymentSimulator from "../components/PaymentSimulator";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [amount, setAmount] = useState("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "groups", id), (snap) => {
      if (snap.exists()) {
        setGroup({
          id: snap.id,
          ...snap.data(),
        });
      }
    });

    return () => unsub();
  }, [id]);

  const addMoney = async () => {
    if (!amount) return;

    await updateDoc(doc(db, "groups", id), {
      walletBalance: group.walletBalance + Number(amount),
      transactions: arrayUnion({
        type: "deposit",
        amount: Number(amount),
        user: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      }),
    });

    setAmount("");
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">{group.name}</h1>

      <p className="text-slate-400 mb-2">
        Approval Mode: {group.approvalMode}
      </p>

      <p className="text-cyan-400 mb-10">
        Invite Code: {group.inviteCode}
      </p>

      <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          Wallet Balance: ₹{group.walletBalance}
        </h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-4 rounded-xl bg-slate-800 text-white mb-4"
        />

        <button
          onClick={addMoney}
          className="w-full bg-green-600 p-4 rounded-xl"
        >
          Add Money
        </button>
      </div>

      <ExpenseInsights group={group} />
      <ExpenseChart group={group} />
      <MemberContribution group={group} />
      <AISuggestions group={group} />
      <Notifications group={group} />
      <GroupChat group={group} />
      <PaymentSimulator group={group} />
      <RazorpayPayment group={group} />
    </div>
  );
}