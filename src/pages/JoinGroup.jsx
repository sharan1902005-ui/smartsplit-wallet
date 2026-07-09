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
import { Ticket, Plane } from "lucide-react";
import { cleanDisplayName } from "../utils/memberDisplay";

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
            cleanDisplayName(auth.currentUser.displayName, "User"),
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
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] flex justify-center items-center px-4">
      <div className="bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] p-10 rounded-md w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-2 text-sm font-semibold text-[#B23A2E] uppercase tracking-widest">
          <Ticket size={16} /> Redeem ticket
        </div>

        <h1 className="text-4xl font-black text-[#24322E] dark:text-[#EFE7D6] mb-8">
          Join group
        </h1>

        <label className="block text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d] mb-2">
          Invite code
        </label>
        <input
          type="text"
          placeholder="e.g. 7F3K2L"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] tracking-[0.3em] uppercase text-center text-lg mb-6"
        />

        <button
          onClick={handleJoinGroup}
          className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition"
        >
          <Plane size={18} /> Board this wallet
        </button>
      </div>
    </div>
  );
}

