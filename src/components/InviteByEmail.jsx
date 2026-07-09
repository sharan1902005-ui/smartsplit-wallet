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
import { cleanDisplayName } from "../utils/memberDisplay";

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
      const userName = cleanDisplayName(userData.name || userData.displayName || userData.email);

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
          name: userName,
          email: userData.email,
          photo: userData.photo,
        }),

        activityTimeline: arrayUnion({
          type: "invite",
          text: `${userName} added to group`,
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
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl border border-[#C7B98F] dark:border-[#3a352b] p-8">
      <h2 className="text-3xl font-bold text-[#B23A2E] mb-6">
        Invite Member
      </h2>

      <div className="flex gap-3">
        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Enter email address"
          className="flex-1 p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A]"
        />

        <button
          onClick={inviteUser}
          disabled={loading}
          className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] px-6 rounded-md font-bold flex items-center gap-2"
        >
          <MailPlus size={18} />
          {loading ? "Adding..." : "Invite"}
        </button>
      </div>
    </div>
  );
}

