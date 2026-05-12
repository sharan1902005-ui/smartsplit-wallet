import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Wallet, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email || "",
        photo: user.photoURL || "",
      }, { merge: true });
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      setLoading(true);
      let result;
      if (isSignup) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || email.split("@")[0],
        email: user.email || "",
        photo: user.photoURL || "",
      }, { merge: true });
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8e7] via-[#fff3d4] to-[#ffe7dc] dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex">
      
      {/* LEFT PREMIUM SIDE */}
      <div className="hidden md:flex w-1/2 relative px-16 py-14 flex-col justify-between overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-red-500 text-white p-4 rounded-3xl shadow-xl">
              <Wallet size={34} />
            </div>

            <div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                SmartSplit
              </h1>
              <p className="text-slate-600 mt-2">
                Premium shared wallet experience
              </p>
            </div>
          </div>

          <h2 className="text-6xl font-black text-slate-900 dark:text-white leading-tight">
            Split expenses.
            <br />
            Travel smarter.
          </h2>

          <p className="text-xl text-slate-600 mt-6 leading-relaxed max-w-xl">
            Manage group trips, roommates, team wallets, and shared spending
            with real-time tracking, payments, analytics, and AI insights.
          </p>
        </div>

        <div className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-red-100 dark:border-slate-700 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-red-500" />
            <span className="font-semibold text-slate-800">
              Live wallet insights
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between bg-red-50 rounded-2xl p-4">
              <span className="text-slate-600">Trip Wallet</span>
              <span className="font-bold text-red-600">₹12,450</span>
            </div>

            <div className="flex justify-between bg-yellow-50 rounded-2xl p-4">
              <span className="text-slate-600">Food Split</span>
              <span className="font-bold text-orange-500">₹2,150</span>
            </div>

            <div className="flex justify-between bg-orange-50 rounded-2xl p-4">
              <span className="text-slate-600">Fuel</span>
              <span className="font-bold text-red-500">₹950</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-red-100 dark:border-slate-700 rounded-3xl shadow-2xl p-10">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-red-500" />
              <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">
                Secure Login
              </span>
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white">
              {isSignup ? "Create account" : "Welcome back"}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
              {isSignup
                ? "Start your SmartSplit journey."
                : "Sign in to continue managing expenses."}
            </p>
          </div>

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-[#fffdf8] dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-[#fffdf8] dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
            />

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-xl hover:scale-[1.02] transition"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-red-100"></div>
              <span className="text-slate-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-red-100"></div>
            </div>

            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-red-50 dark:hover:bg-slate-700 transition shadow-sm"
            >
              Continue with Google
            </button>

            <p className="text-center text-slate-500 pt-4">
              {isSignup
                ? "Already have an account?"
                : "New to SmartSplit?"}

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 text-red-500 font-semibold hover:underline"
              >
                {isSignup ? "Login" : "Create account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}