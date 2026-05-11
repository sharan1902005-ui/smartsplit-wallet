import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold text-center"
      >
        SmartSplit Wallet
      </motion.h1>

      <p className="text-slate-400 mt-4 text-xl text-center max-w-xl">
        Split smart. Spend smarter.
      </p>

      <Link
        to="/login"
        className="mt-8 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition"
      >
        Get Started
      </Link>
    </div>
  );
}