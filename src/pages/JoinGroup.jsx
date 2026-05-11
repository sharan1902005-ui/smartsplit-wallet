import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function JoinGroup() {
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  const handleJoinGroup = async () => {
    if (!inviteCode) return;

    try {
      const q = query(
        collection(db, "groups"),
        where("inviteCode", "==", inviteCode.toUpperCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Invalid invite code");
        return;
      }

      const groupDoc = snapshot.docs[0];

      await updateDoc(doc(db, "groups", groupDoc.id), {
        members: arrayUnion({
          uid: auth.currentUser.uid,
          name:
            auth.currentUser.displayName ||
            "User",
          email:
            auth.currentUser.email || "",
          photo:
            auth.currentUser.photoURL || "",
          role: "member",
        }),
      });

      alert("Joined group successfully 🚀");
      navigate(`/group/${groupDoc.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-white text-4xl font-bold mb-8">
          Join Group
        </h1>

        <input
          type="text"
          placeholder="Enter Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-800 text-white mb-6"
        />

        <button
          onClick={handleJoinGroup}
          className="w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl text-white"
        >
          Join Wallet
        </button>
      </div>
    </div>
  );
}