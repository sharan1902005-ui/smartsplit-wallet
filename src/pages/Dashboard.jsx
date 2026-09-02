import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";
import {
  Wallet,
  Users,
  Receipt,
  Plus,
  LogOut,
  ArrowRight,
  Luggage,
  Clock3,
  TrendingUp,
  X,
  Plane,
} from "lucide-react";
import AnalyticsChart from "../components/AnalyticsChart";
import ThemeToggle from "../components/ThemeToggle";
import { submitExpense } from "../utils/expenseWorkflow";

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        navigate("/login", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "groups"), (snap) => {
      const uid = user.uid;
      if (!uid) return;

      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((g) =>
          (g.members || []).some((m) => m?.uid === uid)
        );

      setGroups(filtered);
    });

    return () => unsub();
  }, [user]);

  const totals = useMemo(() => {
    let wallet = 0;
    let expenses = 0;
    let members = new Set();
    let activities = [];

    groups.forEach((g) => {
      wallet += g.walletBalance || 0;
      (g.transactions || []).forEach((t) => {
        if (t.type === "expense") expenses += t.amount || 0;
      });
      (g.members || []).forEach((m) => members.add(m.uid));
      activities.push(...(g.transactions || []));
    });

    activities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      wallet,
      expenses,
      members: members.size,
      activities: activities.slice(0, 6),
    };
  }, [groups]);

  const addQuickExpense = async () => {
    if (!expenseName || !expenseAmount || !selectedGroup) {
      alert("Fill all fields");
      return;
    }

    const groupRef = doc(db, "groups", selectedGroup.id);

    try {
      const result = await submitExpense(
        groupRef,
        selectedGroup,
        {
          title: expenseName,
          category: expenseCategory,
          amount: Number(expenseAmount),
          source: "quick-add",
        },
        auth.currentUser
      );

      alert(
        result.status === "pending"
          ? "Expense submitted for approval"
          : "Expense added successfully"
      );
    } catch (error) {
      alert(error.message || "Failed to add expense");
      return;
    }

    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("Food");
    setSelectedGroup(null);
    setShowExpenseModal(false);
  };
  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6] flex items-center justify-center p-6">
        <p className="font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-semibold text-[#B23A2E] uppercase tracking-widest">
              SmartSplit {"\u00B7"} Departures
            </p>
            <h1 className="text-5xl font-black text-[#24322E] dark:text-[#EFE7D6] mt-2">
              Welcome, {user?.displayName?.split(" ")[0] || "User"}
            </h1>
            <p className="text-[#6b6350] dark:text-[#a89a6d] mt-2">
              Manage your shared finances smarter.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=B23A2E&color=fff`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=B23A2E&color=fff`;
              }}
              alt={user?.displayName || "User"}
              className="w-14 h-14 rounded-full border-2 border-[#C7B98F] dark:border-[#3a352b] shadow"
            />
            <button
              onClick={logout}
              className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] px-5 py-3 rounded-md shadow flex items-center gap-2 font-semibold"
            >
              <LogOut size={18} /> Log out
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <button onClick={() => navigate("/create-group")} className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-5 rounded-md font-bold shadow-xl">Create group</button>
          <button onClick={() => navigate("/join-group")} className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] p-5 rounded-md font-bold shadow">Join group</button>
          <button onClick={() => setShowExpenseModal(true)} className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] p-5 rounded-md font-bold shadow">Quick expense</button>
          <button className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] p-5 rounded-md font-bold shadow">Insights</button>
        </div>

        {/* Summary stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<Wallet />} title="Total wallet" value={`\u20B9${totals.wallet}`} />
          <StatCard icon={<Receipt />} title="Total expenses" value={`\u20B9${totals.expenses}`} />
          <StatCard icon={<Users />} title="Members" value={totals.members} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6]">Your groups</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {groups.length === 0 ? (
                  <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-dashed border-[#C7B98F] dark:border-[#3a352b] rounded-md p-10 shadow col-span-full text-center">
                    <Luggage className="mx-auto mb-4 text-[#B23A2E]" />
                    <h3 className="font-bold text-xl text-[#24322E] dark:text-[#EFE7D6]">No groups yet</h3>
                    <p className="text-[#6b6350] dark:text-[#a89a6d] mt-2">Create your first shared wallet.</p>
                  </div>
                ) : (
                  <>
                    {groups.map((group) => (
                      <motion.div
                        key={group.id}
                        whileHover={{ y: -3 }}
                        className="relative bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 shadow-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#B23A2E]">
                              {group.type || "Shared group"}
                            </p>
                            <h3 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6] leading-tight">{group.name}</h3>
                          </div>
                          <Plane size={20} className="text-[#B23A2E] rotate-45 mt-1" />
                        </div>

                        <div className="h-px bg-[#C7B98F] dark:bg-[#3a352b] my-5" />

                        <div className="space-y-2 text-sm">
                          <p className="flex justify-between"><span className="text-[#6b6350] dark:text-[#a89a6d]">Wallet</span> <span className="font-bold text-[#B23A2E]">{"\u20B9"}{group.walletBalance || 0}</span></p>
                          <p className="flex justify-between"><span className="text-[#6b6350] dark:text-[#a89a6d]">Members</span> <span>{(group.members || []).length}</span></p>
                          <p className="flex justify-between"><span className="text-[#6b6350] dark:text-[#a89a6d]">Transactions</span> <span>{(group.transactions || []).length}</span></p>
                          {getPendingCount(group) > 0 && (
                            <p className="flex justify-between">
                              <span className="text-[#6b6350] dark:text-[#a89a6d]">Pending approvals</span>
                              <span className="rounded-md border border-[#D9A441] px-2 py-0.5 font-['IBM_Plex_Mono'] font-bold text-[#D9A441]">
                                {getPendingCount(group)}
                              </span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/group/${group.id}`)}
                          className="mt-6 w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md font-bold flex justify-center items-center gap-2"
                        >
                          Open group <ArrowRight size={18} />
                        </button>
                      </motion.div>
                    ))}

                    {groups.length > 0 && groups.length % 2 !== 0 && (
                      <button
                        onClick={() => navigate("/create-group")}
                        className="hidden md:flex border-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 flex-col items-center justify-center text-[#6b6350] dark:text-[#a89a6d] hover:border-[#B23A2E] hover:text-[#B23A2E] transition min-h-[200px]"
                      >
                        <Plus size={28} className="mb-2" />
                        <span className="font-['Big_Shoulders_Display'] font-bold uppercase tracking-wide">
                          Add another group
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 shadow-xl">
              <h2 className="text-2xl font-black text-[#24322E] dark:text-[#EFE7D6] mb-5">Manifest / activity</h2>
              <div className="space-y-3">
                {totals.activities.length === 0 ? (
                  <p className="text-[#6b6350] dark:text-[#a89a6d]">No activity yet.</p>
                ) : (
                  totals.activities.map((a, i) => (
                    <div key={i} className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] p-4 rounded-md">
                      <div className="flex gap-3 items-start">
                        <Clock3 size={16} className="mt-1 text-[#B23A2E] shrink-0" />
                        <div>
                          <p className="font-medium text-sm">
                            {a.message ||
                              a.description ||
                              a.text ||
                              (a.type === "deposit"
                                ? `${a.userName || "Someone"} added \u20B9${a.amount} to wallet`
                                : a.type === "expense"
                                ? `${a.userName || "Someone"} spent \u20B9${a.amount} on ${a.title || "expense"}`
                                : "Activity update")}
                          </p>
                          <p className="text-xs text-[#6b6350] dark:text-[#a89a6d] mt-1">
                            {a.createdAt?.toDate
                              ? a.createdAt.toDate().toLocaleString()
                              : a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 shadow-xl">
              <h2 className="text-2xl font-black text-[#24322E] dark:text-[#EFE7D6] mb-5">Notices</h2>
              <div className="space-y-3">
                <Insight text="Your shared wallets are actively being used." />
                <Insight text="Expense tracking looks healthy." />
                <Insight text="Top up low wallets before approvals fail." />
              </div>
            </div>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="mt-8">
            <AnalyticsChart group={groups[0]} />
          </div>
        )}
      </div>

      <button
        onClick={() => setShowExpenseModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] shadow-2xl flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] w-full max-w-md rounded-md p-8 relative shadow-2xl">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-[#24322E] dark:text-[#EFE7D6]">
              <X />
            </button>

            <h2 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6] mb-6">Quick add expense</h2>

            <select
              value={selectedGroup?.id || ""}
              onChange={(e) => setSelectedGroup(groups.find((g) => g.id === e.target.value))}
              className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] mb-4 text-[#24322E] dark:text-[#EFE7D6]"
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Expense name" className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] mb-4 text-[#24322E] dark:text-[#EFE7D6]" />
            <input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Amount" type="number" className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] mb-4 text-[#24322E] dark:text-[#EFE7D6]" />

            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] mb-6 text-[#24322E] dark:text-[#EFE7D6]">
              <option>Food</option>
              <option>Travel</option>
              <option>Fuel</option>
              <option>Shopping</option>
              <option>Hotel</option>
            </select>

            <button onClick={addQuickExpense} className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md font-bold">
              Add expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 shadow-xl">
      <div className="text-[#B23A2E] mb-4">{icon}</div>
      <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">{title}</p>
      <h3 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6] mt-2">{value}</h3>
    </motion.div>
  );
}

function Insight({ text }) {
  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-4 flex gap-3 items-start">
      <TrendingUp className="text-[#B23A2E] mt-1" size={18} />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function getPendingCount(group) {
  return (group.expenseRequests || []).filter(
    (request) => request.status === "pending"
  ).length;
}


