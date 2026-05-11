import { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Trip");
  const [approvalMode, setApprovalMode] = useState("free");

  const navigate = useNavigate();

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = async () => {
    if (!groupName) return;

    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        type: groupType,
        approvalMode,
        inviteCode: generateInviteCode(),
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        walletBalance: 0,
        transactions: [],
        expenseRequests: [],
        createdAt: serverTimestamp(),
      });

      navigate(`/group/${docRef.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-xl shadow-2xl">
        <h1 className="text-4xl text-white font-bold mb-8">
          Create Smart Group
        </h1>

        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-800 text-white mb-5"
        />

        <select
          value={groupType}
          onChange={(e) => setGroupType(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-800 text-white mb-5"
        >
          <option>Trip</option>
          <option>Roommates</option>
          <option>Event</option>
          <option>Friends</option>
        </select>

        <select
          value={approvalMode}
          onChange={(e) => setApprovalMode(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-800 text-white mb-8"
        >
          <option value="free">No Permission (Instant Spend)</option>
          <option value="majority">Majority Approval</option>
          <option value="everyone">Everyone Approval</option>
          <option value="admin">Admin Approval</option>
          <option value="threshold">Threshold Approval</option>
        </select>

        <button
          onClick={handleCreateGroup}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}