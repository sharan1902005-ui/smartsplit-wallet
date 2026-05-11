import { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useParams } from "react-router-dom";
import {
  Wallet,
  Users,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import ExpenseInsights from "../components/ExpenseInsights";
import ExpenseChart from "../components/ExpenseChart";
import MemberContribution from "../components/MemberContribution";
import SettlementCalculator from "../components/SettlementCalculator";
import ActivityTimeline from "../components/ActivityTimeline";
import ExportPDF from "../components/ExportPDF";
import BudgetAlerts from "../components/BudgetAlerts";
import AISuggestions from "../components/AISuggestions";
import Notifications from "../components/Notifications";
import ExpenseRequests from "../components/ExpenseRequests";
import RazorpayPayment from "../components/RazorpayPayment";
import RealUPIPayment from "../components/RealUPIPayment";
import GroupChat from "../components/GroupChat";
import PaymentSimulator from "../components/PaymentSimulator";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [amount, setAmount] = useState("");

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
      <div className="min-h-screen flex items-center justify-center bg-[#fff8e7]">
        <div className="text-2xl font-bold text-red-600 animate-pulse">
          Loading SmartSplit...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8e7] via-[#fff3d4] to-[#ffe5d9] text-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <h1 className="text-5xl font-black text-red-600 mb-3">
                {group.name}
              </h1>

              <p className="text-lg text-slate-600 mb-4">
                Split expenses, manage wallet, and vibe smarter 💸
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-yellow-100 px-5 py-3 rounded-2xl flex items-center gap-2 shadow">
                  <ShieldCheck className="text-red-500" />
                  <span className="font-semibold">
                    Approval: {group.approvalMode}
                  </span>
                </div>

                <div className="bg-red-100 px-5 py-3 rounded-2xl flex items-center gap-2 shadow">
                  <Users className="text-red-500" />
                  <span className="font-semibold">
                    Invite: {group.inviteCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="w-full md:w-[450px] bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <Wallet size={30} />
                <h2 className="text-2xl font-bold">Wallet Balance</h2>
              </div>

              <div className="text-5xl font-black mb-6">
                ₹{group.walletBalance}
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-4 rounded-2xl bg-white text-slate-900 mb-4 outline-none shadow"
              />

              <button
                onClick={addMoney}
                className="w-full bg-yellow-400 hover:bg-yellow-300 transition-all text-slate-900 font-bold p-4 rounded-2xl shadow-xl"
              >
                Add Money Instantly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6">
          <ExpenseInsights group={group} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 min-h-[420px]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-red-500" />
              <h2 className="text-2xl font-bold text-red-600">
                Wallet Analytics
              </h2>
            </div>
            <ExpenseChart group={group} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6">
            <MemberContribution group={group} />
          </div>
        </div>

        <SettlementCalculator group={group} />

        <ActivityTimeline group={group} />

        <BudgetAlerts group={group} />

        <ExportPDF group={group} />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6">
            <AISuggestions group={group} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6">
            <Notifications group={group} />
          </div>
        </div>

        <ExpenseRequests group={group} />

        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6">
          <GroupChat group={group} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <RealUPIPayment group={group} />
        </div>
      </div>
    </div>
  );
}