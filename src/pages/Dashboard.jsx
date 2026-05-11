import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";
import {
  Wallet,
  Users,
  Receipt,
  Plus,
  LogOut,
  ArrowRight,
  Sparkles,
  Clock3,
  TrendingUp,
  X,
} from "lucide-react";
import AnalyticsChart from "../components/AnalyticsChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "groups"), (snap) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((g) =>
          (g.members || []).some((m) => m?.uid === uid)
        );

      setGroups(filtered);
    });

    return () => unsub();
  }, []);

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
      activities.push(...(g.activityTimeline || []));
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

    await updateDoc(groupRef, {
      walletBalance:
        (selectedGroup.walletBalance || 0) - Number(expenseAmount),
      transactions: arrayUnion({
        type: "expense",
        title: expenseName,
        category: expenseCategory,
        amount: Number(expenseAmount),
        user: auth.currentUser.uid,
        userName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "User",
        createdAt: new Date().toISOString(),
      }),
      activityTimeline: arrayUnion({
        type: "expense",
        text: `${auth.currentUser.displayName || "User"} added ₹${expenseAmount} expense`,
        createdAt: new Date().toISOString(),
      }),
    });

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

  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-[#fff8ef] dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <p className="text-slate-500">SmartSplit Dashboard</p>
            <h1 className="text-4xl font-black mt-2">
              Welcome, {user?.displayName?.split(" ")[0] || "User"} 👋
            </h1>
            <p className="text-slate-500 mt-2">
              Manage your shared finances smarter.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
              className="w-14 h-14 rounded-full border-4 border-white shadow"
            />
            <button
              onClick={logout}
              className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <button onClick={() => navigate("/create-group")} className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-5 rounded-3xl font-bold">Create Group</button>
          <button onClick={() => navigate("/join-group")} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow font-bold">Join Group</button>
          <button onClick={() => setShowExpenseModal(true)} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow font-bold">Quick Expense</button>
          <button className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow font-bold">Insights</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Wallet />} title="Total Wallet" value={`₹${totals.wallet}`} />
          <StatCard icon={<Receipt />} title="Total Expenses" value={`₹${totals.expenses}`} />
          <StatCard icon={<Users />} title="Members" value={totals.members} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-black">Your Groups</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {groups.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow col-span-full text-center">
                    <Sparkles className="mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No groups yet</h3>
                    <p className="text-slate-500 mt-2">Create your first shared wallet.</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <motion.div
                      key={group.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow"
                    >
                      <h3 className="text-2xl font-bold">{group.name}</h3>
                      <p className="text-slate-500 mt-2">{group.type || "Shared Group"}</p>

                      <div className="mt-6 space-y-2">
                        <p>Wallet: <span className="font-bold text-red-500">₹{group.walletBalance || 0}</span></p>
                        <p>Members: {(group.members || []).length}</p>
                        <p>Transactions: {(group.transactions || []).length}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/group/${group.id}`)}
                        className="mt-6 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2"
                      >
                        Open Group <ArrowRight size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow">
              <h2 className="text-2xl font-black mb-5">Recent Activity</h2>
              <div className="space-y-4">
                {totals.activities.length === 0 ? (
                  <p className="text-slate-500">No activity yet.</p>
                ) : (
                  totals.activities.map((a, i) => (
                    <div key={i} className="bg-[#fff8f2] dark:bg-slate-800 p-4 rounded-2xl">
                      <div className="flex gap-3 items-start">
                        <Clock3 size={18} className="mt-1 text-red-500" />
                        <div>
                          <p className="font-semibold">{a.text}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(a.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow">
              <h2 className="text-2xl font-black mb-5">Smart Insights</h2>
              <div className="space-y-4">
                <Insight text="Your shared wallets are actively being used." />
                <Insight text="Expense tracking looks healthy." />
                <Insight text="Top up low wallets before approvals fail." />
              </div>
            </div>
          </div>
        </div>

        <AnalyticsChart groups={groups} />
      </div>

      <button
        onClick={() => setShowExpenseModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4">
              <X />
            </button>

            <h2 className="text-3xl font-black mb-6">Quick Add Expense</h2>

            <select
              value={selectedGroup?.id || ""}
              onChange={(e) => setSelectedGroup(groups.find((g) => g.id === e.target.value))}
              className="w-full p-4 rounded-2xl border mb-4 text-black"
            >
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Expense name" className="w-full p-4 rounded-2xl border mb-4 text-black" />
            <input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Amount" type="number" className="w-full p-4 rounded-2xl border mb-4 text-black" />

            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="w-full p-4 rounded-2xl border mb-6 text-black">
              <option>Food</option>
              <option>Travel</option>
              <option>Fuel</option>
              <option>Shopping</option>
              <option>Hotel</option>
            </select>

            <button onClick={addQuickExpense} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold">
              Add Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow">
      <div className="text-red-500 mb-4">{icon}</div>
      <p className="text-slate-500">{title}</p>
      <h3 className="text-3xl font-black mt-2">{value}</h3>
    </motion.div>
  );
}

function Insight({ text }) {
  return (
    <div className="bg-[#fff8f2] dark:bg-slate-800 rounded-2xl p-4 flex gap-3 items-start">
      <TrendingUp className="text-red-500 mt-1" size={18} />
      <p>{text}</p>
    </div>
  );
}
