import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
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
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const saveUser = async (user, fallbackName = "User") => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName || fallbackName,
      email: user.email || "",
      photo: user.photoURL || "",
    }, { merge: true });
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await saveUser(user, user.email?.split("@")[0] || "User");
        navigate("/dashboard", { replace: true });
      }
      setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => result?.user && saveUser(result.user))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        if (!isMobile) throw popupError;
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const user = result.user;
      await saveUser(user);
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
      await setPersistence(auth, browserLocalPersistence);
      let result;
      if (isSignup) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = result.user;
      await saveUser(user, email.split("@")[0]);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] flex">
      
      {/* LEFT PREMIUM SIDE */}
      <div className="hidden md:flex w-1/2 relative px-16 py-14 flex-col justify-between overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#C7B98F] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#D9A441] rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#B23A2E] text-[#F8F4EA] p-4 rounded-md shadow-xl">
              <Wallet size={34} />
            </div>

            <div>
              <h1 className="text-5xl font-black text-[#24322E] dark:text-[#EFE7D6]">
                SmartSplit
              </h1>
              <p className="text-[#6b6350] mt-2">
                Premium shared wallet experience
              </p>
            </div>
          </div>

          <h2 className="text-6xl font-black text-[#24322E] dark:text-[#EFE7D6] leading-tight">
            Split expenses.
            <br />
            Travel smarter.
          </h2>

          <p className="text-xl text-[#6b6350] mt-6 leading-relaxed max-w-xl">
            Manage group trips, roommates, team wallets, and shared spending
            with real-time tracking, payments, analytics, and AI insights.
          </p>
        </div>

        <div className="relative z-10 bg-[#F8F4EA]/80 dark:bg-[#221F1A]/80 backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-[#B23A2E]" />
            <span className="font-semibold text-[#24322E]">
              Live wallet insights
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between bg-[#EAE1CC] rounded-md p-4">
              <span className="text-[#6b6350]">Trip Wallet</span>
              <span className="font-bold text-[#B23A2E]">{"\u20B9"}12,450</span>
            </div>

            <div className="flex justify-between bg-[#EAE1CC] rounded-md p-4">
              <span className="text-[#6b6350]">Food Split</span>
              <span className="font-bold text-[#D9A441]">{"\u20B9"}2,150</span>
            </div>

            <div className="flex justify-between bg-[#EAE1CC] rounded-md p-4">
              <span className="text-[#6b6350]">Fuel</span>
              <span className="font-bold text-[#B23A2E]">{"\u20B9"}950</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-10 md:px-8">
        <div className="w-full max-w-md bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] rounded-md shadow-2xl p-10">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-[#B23A2E]" />
                <span className="text-sm font-semibold text-[#B23A2E] uppercase tracking-widest">
                  Secure Login
                </span>
              </div>

            <h2 className="text-4xl font-black text-[#24322E] dark:text-[#EFE7D6]">
              {isSignup ? "Create account" : "Welcome back"}
            </h2>

            <p className="text-[#6b6350] dark:text-[#a89a6d] mt-3 text-lg">
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
              className="w-full px-5 py-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] focus:outline-none focus:ring-2 focus:ring-[#B23A2E]/20"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] focus:outline-none focus:ring-2 focus:ring-[#B23A2E]/20"
            />

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-4 rounded-md bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] font-bold shadow-xl hover:scale-[1.02] transition"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-[#C7B98F]"></div>
              <span className="text-[#a89a6d] text-sm">OR</span>
              <div className="flex-1 h-px bg-[#C7B98F]"></div>
            </div>

            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] font-semibold hover:bg-[#EAE1CC] dark:hover:bg-[#3a352b] transition shadow-sm"
            >
              Continue with Google
            </button>

            <p className="text-center text-[#6b6350] pt-4">
              {isSignup
                ? "Already have an account?"
                : "New to SmartSplit?"}

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 text-[#B23A2E] font-semibold hover:underline"
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


