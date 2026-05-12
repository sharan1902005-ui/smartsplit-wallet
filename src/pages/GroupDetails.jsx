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
import MemberProfiles from "../components/MemberProfiles";
import InviteByEmail from "../components/InviteByEmail";
import ActivityTimeline from "../components/ActivityTimeline";
import ExportPDF from "../components/ExportPDF";
import ExportReport from "../components/ExportReport";
import AnalyticsChart from "../components/AnalyticsChart";
import BudgetAlerts from "../components/BudgetAlerts";
import SplitExpense from "../components/SplitExpense";
import ExpenseApproval from "../components/ExpenseApproval";
import AISuggestions from "../components/AISuggestions";
import Notifications from "../components/Notifications";
import ExpenseRequests from "../components/ExpenseRequests";
import RazorpayPayment from "../components/RazorpayPayment";
import RealUPIPayment from "../components/RealUPIPayment";
import DepositApproval from "../components/DepositApproval";
import ExpenseRequestForm from "../components/ExpenseRequestForm";
import GroupChat from "../components/GroupChat";
import PaymentSimulator from "../components/PaymentSimulator";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-2xl font-bold text-red-600 animate-pulse">
          Loading SmartSplit...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 pb-28 md:pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-red-100 dark:border-slate-700 rounded-3xl shadow-2xl p-8">
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

      {/* Desktop Tab Nav */}
      <div className="hidden md:block max-w-7xl mx-auto sticky top-0 z-50 bg-white dark:bg-slate-900 border border-red-100 dark:border-slate-700 rounded-3xl shadow-lg p-3 mb-6">
        <div className="grid grid-cols-5 gap-2">
          <TabButton label="Home" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton label="Wallet" active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} />
          <TabButton label="Expense" active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
          <TabButton label="Members" active={activeTab === "members"} onClick={() => setActiveTab("members")} />
          <TabButton label="Chat" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
        </div>
      </div>

      {/* Mobile Bottom Tab Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-red-100 dark:border-slate-700 shadow-2xl md:hidden">
        <div className="grid grid-cols-5 gap-2 p-3">
          <TabButton label="🏠" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton label="💰" active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} />
          <TabButton label="💸" active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
          <TabButton label="👥" active={activeTab === "members"} onClick={() => setActiveTab("members")} />
          <TabButton label="💬" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid gap-8">

        {activeTab === "overview" && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-6">
              <ExpenseInsights group={group} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-6 min-h-[420px]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-red-500" />
                  <h2 className="text-2xl font-bold text-red-600">Wallet Analytics</h2>
                </div>
                <ExpenseChart group={group} />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-6">
                <MemberContribution group={group} />
              </div>
            </div>

            <BudgetAlerts group={group} />
            <AISuggestions group={group} />
            <AnalyticsChart group={group} />
            <ActivityTimeline group={group} />
            <ExportReport group={group} />
          </>
        )}

        {activeTab === "wallet" && (
          <>
            <SettlementCalculator group={group} />
            <div className="grid md:grid-cols-2 gap-8">
              <RealUPIPayment group={group} />
              <DepositApproval group={group} />
            </div>
            <Notifications group={group} />
          </>
        )}

        {activeTab === "expenses" && (
          <>
            <ExpenseRequestForm group={group} />
            <ExpenseApproval group={group} />
            <ExpenseRequests group={group} />
            <SplitExpense group={group} />
            <ExportPDF group={group} />
          </>
        )}

        {activeTab === "members" && (
          <>
            <MemberProfiles group={group} />
            <InviteByEmail group={group} />
          </>
        )}

        {activeTab === "chat" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-6">
            <GroupChat group={group} />
          </div>
        )}

      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-2xl font-bold text-sm transition ${
        active
          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-red-100 dark:border-slate-700"
      }`}
    >
      {label}
    </button>
  );
}