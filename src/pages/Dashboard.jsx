import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function Dashboard() {
  const navigate = useNavigate();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenseCategory, setExpenseCategory] = useState("Food");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "groups"), where("memberIds", "array-contains", auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addQuickExpense = async () => {
    if (!expenseName || !expenseAmount || !selectedGroup) return;

    const groupRef = doc(db, "groups", selectedGroup.id);

    await updateDoc(groupRef, {
      walletBalance: selectedGroup.walletBalance - Number(expenseAmount),
      transactions: arrayUnion({
        type: "expense",
        title: expenseName,
      category: expenseCategory,
        amount: Number(expenseAmount),
        user: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      }),
    });

    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("Food");
    setShowExpenseModal(false);
  };

  const members = [
    { name: "Arun", amount: "₹3000" },
    { name: "Ravi", amount: "₹1500" },
    { name: "Kumar", amount: "₹2200" },
  ];

  const expenses = [
    { title: "Hotel Booking", amount: "₹1800" },
    { title: "Food", amount: "₹650" },
    { title: "Fuel", amount: "₹900" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">SmartSplit Wallet</h1>
          <p className="text-slate-400">Split smart. Spend smarter.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/join-group")}
            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-2xl font-semibold transition"
          >
            Join Group
          </button>

          <button
            onClick={() => navigate("/create-group")}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl font-semibold transition"
          >
            Create Group
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-slate-900 p-6 rounded-3xl shadow-xl"
        >
          <FaWallet className="text-3xl text-indigo-400 mb-4" />
          <h2 className="text-slate-400">Wallet Balance</h2>
          <p className="text-3xl font-bold mt-2">₹12,450</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-slate-900 p-6 rounded-3xl shadow-xl"
        >
          <FaMoneyBillWave className="text-3xl text-green-400 mb-4" />
          <h2 className="text-slate-400">Total Expenses</h2>
          <p className="text-3xl font-bold mt-2">₹3,350</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-slate-900 p-6 rounded-3xl shadow-xl"
        >
          <FaUsers className="text-3xl text-cyan-400 mb-4" />
          <h2 className="text-slate-400">Members</h2>
          <p className="text-3xl font-bold mt-2">3</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Group Members</h2>

          <div className="space-y-4">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex justify-between bg-slate-800 p-4 rounded-2xl"
              >
                <span>{member.name}</span>
                <span>{member.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Recent Expenses</h2>

          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div
                key={index}
                className="flex justify-between bg-slate-800 p-4 rounded-2xl"
              >
                <span>{expense.title}</span>
                <span>{expense.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowExpenseModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-4xl shadow-2xl hover:scale-110 transition-all"
      >
        +
      </button>
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">

            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 text-slate-500"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-red-600 mb-6">
              Quick Add Expense
            </h2>

            <select
              value={selectedGroup?.id || ""}
              onChange={(e) => {
                const chosen = groups.find((g) => g.id === e.target.value);
                setSelectedGroup(chosen);
              }}
              className="w-full p-4 border rounded-2xl mb-4 bg-white"
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Expense name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="w-full p-4 border rounded-2xl mb-4"
            />

            <input
              type="number"
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full p-4 border rounded-2xl mb-4"
            />

            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full p-4 border rounded-2xl mb-6"
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Fuel</option>
              <option>Shopping</option>
              <option>Hotel</option>
              <option>Misc</option>
            </select>

            <button
              onClick={addQuickExpense}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold p-4 rounded-2xl"
            >
              Add Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}