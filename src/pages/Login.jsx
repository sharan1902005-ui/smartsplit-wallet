import { auth, db } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        },
        { merge: true }
      );

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center">
      <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl text-white font-bold mb-8">
          SmartSplit Login
        </h1>

        <button
          onClick={loginWithGoogle}
          className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl text-white font-semibold"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}