import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db } from "../firebase/config";
import { MailPlus } from "lucide-react";

export default function InviteByEmail({ group }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const inviteUser = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, "users"),
        where("email", "==", email.trim())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("User not found");
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();

      const alreadyMember = (group.members || []).some(
        (m) => m.uid === userData.uid
      );

      if (alreadyMember) {
        alert("Already in group");
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, "groups", group.id), {
        members: arrayUnion({
          uid: userData.uid,
          name: userData.name,
          email: userData.email,
          photo: userData.photo,
        }),

        activityTimeline: arrayUnion({
          type: "invite",
          text: `${userData.name} added to group`,
          createdAt: new Date().toISOString(),
        }),
      });

      alert("Member added");
      setEmail("");
      setLoading(false);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Invite Member
      </h2>

      <div className="flex gap-3">
        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Enter email address"
          className="flex-1 p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-800"
        />

        <button
          onClick={inviteUser}
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 rounded-2xl font-bold flex items-center gap-2"
        >
          <MailPlus size={18} />
          {loading ? "Adding..." : "Invite"}
        </button>
      </div>
    </div>
  );
}
