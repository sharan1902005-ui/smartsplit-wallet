import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useParams } from "react-router-dom";
import {
  Wallet,
  Users,
  ShieldCheck
} from "lucide-react";

import ExpenseInsights from "../components/ExpenseInsights";
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
import AISuggestions from "../components/AISuggestions";
import ExpenseRequests from "../components/ExpenseRequests";
import ExpenseHistory from "../components/ExpenseHistory";
import RealUPIPayment from "../components/RealUPIPayment";
import GroupChat from "../components/GroupChat";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-2xl font-bold text-red-600 animate-pulse">
          Loading group...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 pb-28 md:pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-red-100 dark:border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
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
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-10 shadow-2xl text-white">
              <div className="flex items-center gap-4 mb-6">
                <Wallet size={36} />
                <h2 className="text-4xl font-black">
                  Wallet Balance
                </h2>
              </div>

              <p className="text-7xl font-black mb-8">
                ₹{group.walletBalance || 0}
              </p>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 p-5 rounded-2xl font-black text-xl transition"
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Tab Nav */}
      <div className="hidden md:block max-w-7xl mx-auto sticky top-0 z-50 bg-white dark:bg-slate-900 border border-red-100 dark:border-slate-700 rounded-3xl shadow-lg p-3 mb-6">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide">
          <TabButton label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <TabButton label="Wallet" active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} />
          <TabButton label="Expense" active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
          <TabButton label="Members" active={activeTab === "members"} onClick={() => setActiveTab("members")} />
          <TabButton label="Chat" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
        </div>
      </div>

      {/* Mobile Bottom Tab Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-red-100 dark:border-slate-700 shadow-2xl md:hidden">
        <div className="grid grid-cols-5 gap-2 p-3">
          <TabButton label="🏠" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <TabButton label="💰" active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} />
          <TabButton label="💸" active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
          <TabButton label="👥" active={activeTab === "members"} onClick={() => setActiveTab("members")} />
          <TabButton label="💬" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid gap-8">

        {activeTab === "home" && (
          <>
            <AISuggestions group={group} />
            <AnalyticsChart group={group} />
            <BudgetAlerts group={group} />
            <ActivityTimeline group={group} />
          </>
        )}

        {activeTab === "wallet" && (
          <>
            <SettlementCalculator group={group} />
            <MemberContribution group={group} />
          </>
        )}

        {activeTab === "expenses" && (
          <>
            <ExpenseRequests group={group} />
            <ExpenseHistory group={group} />
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
          <GroupChat group={group} />
        )}

      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">

              <button
                onClick={() =>
                  setShowPaymentModal(false)
                }
                className="absolute top-4 right-4 z-50 bg-white text-black w-12 h-12 rounded-full shadow-xl text-2xl font-bold"
              >
                ×
              </button>

              <RealUPIPayment group={group} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[110px] p-3 rounded-2xl font-bold text-sm transition ${
        active
          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-red-100 dark:border-slate-700"
      }`}
    >
      {label}
    </button>
  );
}