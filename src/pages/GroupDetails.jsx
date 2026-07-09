import { useEffect, useMemo, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useParams } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import MemberContribution from "../components/MemberContribution";
import SettlementCalculator from "../components/SettlementCalculator";
import MemberProfiles from "../components/MemberProfiles";
import InviteByEmail from "../components/InviteByEmail";
import ActivityTimeline from "../components/ActivityTimeline";
import ExportPDF from "../components/ExportPDF";
import AnalyticsChart from "../components/AnalyticsChart";
import BudgetAlerts from "../components/BudgetAlerts";
import SplitExpense from "../components/SplitExpense";
import AISuggestions from "../components/AISuggestions";
import ExpenseRequests from "../components/ExpenseRequests";
import ExpenseHistory from "../components/ExpenseHistory";
import RealUPIPayment from "../components/RealUPIPayment";
import GroupChat from "../components/GroupChat";
import ThemeToggle from "../components/ThemeToggle";
import { normalizeMemberRecord } from "../utils/memberDisplay";

const tabs = [
  { id: "home", label: "Home", icon: <Home size={18} /> },
  { id: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
  { id: "expenses", label: "Expense", icon: <Receipt size={18} /> },
  { id: "members", label: "Members", icon: <Users size={18} /> },
  { id: "chat", label: "Chat", icon: <MessageCircle size={18} /> },
];

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const groupRef = doc(db, "groups", id);
    const unsub = onSnapshot(groupRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const members = data.members || [];
        const normalizedMembers = members.map(normalizeMemberRecord);
        const membersChanged =
          JSON.stringify(members) !== JSON.stringify(normalizedMembers);

        if (membersChanged) {
          updateDoc(groupRef, { members: normalizedMembers }).catch(console.error);
        }

        setGroup({
          id: snap.id,
          ...data,
          members: normalizedMembers,
        });
      }
    });

    return () => unsub();
  }, [id]);

  const metrics = useMemo(() => {
    const transactions = group?.transactions || [];
    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      expenses,
      members: group?.members?.length || 0,
      transactions: transactions.length,
      pendingApprovals: (group?.expenseRequests || []).filter(
        (request) => request.status === "pending"
      ).length,
    };
  }, [group]);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAE1CC] dark:bg-[#171512]">
        <div className="text-2xl font-black text-[#B23A2E] animate-pulse">
          Loading group...
        </div>
      </div>
    );
  }

  const activeTitle = tabs.find((tab) => tab.id === activeTab)?.label || "Home";

  return (
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6]">
      <div className="grid min-h-screen lg:grid-cols-[304px_1fr]">
        <aside className="hidden lg:flex flex-col gap-6 border-r border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] px-6 py-8">
          <SidebarHeader group={group} metrics={metrics} onAddMoney={() => setShowPaymentModal(true)} />

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8 pb-28 lg:pb-8">
          <div className="lg:hidden mb-5">
            <MobileHeader group={group} metrics={metrics} onAddMoney={() => setShowPaymentModal(true)} />
          </div>

          <div className="hidden lg:flex items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6350] dark:text-[#a89a6d]">
                {group.name}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
                {activeTitle}
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[480px]">
              <MetricCard label="Expenses" value={`Rs. ${metrics.expenses}`} />
              <MetricCard label="Members" value={metrics.members} />
              <MetricCard label="Pending" value={metrics.pendingApprovals} tone="gold" />
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] space-y-6">
            {activeTab === "home" && (
              <>
                <AISuggestions group={group} />
                <AnalyticsChart group={group} />
                <BudgetAlerts group={group} />
                <ActivityTimeline group={group} />
              </>
            )}

            {activeTab === "wallet" && (
              <div className="grid xl:grid-cols-[1fr_420px] gap-6 items-start">
                <SettlementCalculator group={group} />
                <MemberContribution group={group} />
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="grid xl:grid-cols-[1fr_420px] gap-6 items-start">
                <div className="space-y-6">
                  <ExpenseRequests group={group} />
                  <ExpenseHistory group={group} />
                </div>
                <div className="space-y-6">
                  <SplitExpense group={group} />
                  <ExportPDF group={group} />
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="grid xl:grid-cols-[1fr_420px] gap-6 items-start">
                <MemberProfiles group={group} />
                <InviteByEmail group={group} />
              </div>
            )}

            {activeTab === "chat" && <GroupChat group={group} />}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border-t border-[#C7B98F] dark:border-[#3a352b] shadow-2xl lg:hidden">
        <div className="grid grid-cols-5 gap-2 p-3">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              compact
            />
          ))}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-md">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 z-50 bg-[#F8F4EA] text-[#24322E] w-12 h-12 rounded-full shadow-xl text-2xl font-bold"
              >
                x
              </button>

              <RealUPIPayment group={group} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarHeader({ group, metrics, onAddMoney }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6b6350]">
          Goa wallet
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          {group.name}
        </h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d]">
          Wallet balance
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Rs. {group.walletBalance || 0}
        </p>
        <button
          onClick={onAddMoney}
          className="mt-5 w-full rounded-md bg-[#B23A2E] hover:bg-[#9a3227] px-4 py-3 font-bold text-[#F8F4EA] shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
        >
          Add Money
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SmallPill icon={<ShieldCheck size={16} />} label="Approval" value={group.approvalMode || "free"} />
        <SmallPill icon={<Users size={16} />} label="Members" value={metrics.members} />
      </div>
    </div>
  );
}

function MobileHeader({ group, metrics, onAddMoney }) {
  return (
    <div className="rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b6350]">
            Shared wallet
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#24322E] dark:text-[#EFE7D6]">
            {group.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddMoney}
            className="rounded-md bg-[#B23A2E] hover:bg-[#9a3227] px-4 py-3 text-sm font-bold text-[#F8F4EA] shadow-lg"
          >
            Add Money
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricCard label="Wallet" value={`Rs. ${group.walletBalance || 0}`} />
        <MetricCard label="Expenses" value={`Rs. ${metrics.expenses}`} />
        <MetricCard label="Pending" value={metrics.pendingApprovals} tone="gold" />
      </div>
    </div>
  );
}

function SmallPill({ icon, label, value }) {
  return (
    <div className="rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] p-3">
      <div className="flex items-center gap-2 text-[#6b6350] dark:text-[#a89a6d]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-sm font-black capitalize text-[#24322E] dark:text-[#EFE7D6]">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, tone = "ink" }) {
  const toneClass =
    tone === "gold"
      ? "text-[#D9A441]"
      : "text-[#24322E] dark:text-[#EFE7D6]";

  return (
    <div className="rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b6350] dark:text-[#a89a6d]">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tracking-tight ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function TabButton({ icon, label, active, onClick, compact = false }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`${compact ? "min-w-0 p-3" : "w-full px-4 py-3 justify-start"} rounded-md font-bold text-sm transition flex items-center justify-center gap-3 ${
        active
          ? "bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] shadow-lg"
          : "text-[#6b6350] dark:text-[#a89a6d] hover:bg-[#EAE1CC] dark:hover:bg-[#221F1A]"
      }`}
    >
      {icon}
      <span className={compact ? "sr-only" : ""}>{label}</span>
    </button>
  );
}


