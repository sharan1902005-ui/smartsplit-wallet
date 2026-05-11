import { motion } from "framer-motion";
import {
  FaWallet,
  FaUsers,
  FaMoneyBillWave,
  FaPlus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

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

      <button className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 p-5 rounded-full shadow-2xl transition">
        <FaPlus size={22} />
      </button>
    </div>
  );
}