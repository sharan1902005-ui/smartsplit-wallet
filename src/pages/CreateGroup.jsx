import { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Wallet, ShieldCheck } from "lucide-react";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Trip");
  const [approvalMode, setApprovalMode] = useState("free");
  const [adminUpi, setAdminUpi] = useState("");

  const navigate = useNavigate();

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = async () => {
    if (!groupName || !adminUpi) {
      alert("Enter group name and admin UPI ID");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        type: groupType,
        approvalMode,
        inviteCode: generateInviteCode(),

        createdBy: auth.currentUser.uid,
        adminUid: auth.currentUser.uid,
        adminUpi: adminUpi,

        members: [
          {
            uid: auth.currentUser.uid,
            name:
              auth.currentUser.displayName ||
              "User",
            email:
              auth.currentUser.email || "",
            photo:
              auth.currentUser.photoURL || "",
            role: "admin",
          },
        ],
        walletBalance: 0,
        transactions: [],
        expenseRequests: [],
        activityTimeline: [],
        chatMessages: [],
        createdAt: serverTimestamp(),
      });

      navigate(`/group/${docRef.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8e7] via-[#fff3d4] to-[#ffe7dc] flex justify-center items-center px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-red-100 p-10 rounded-3xl w-full max-w-2xl shadow-2xl">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-red-500 text-white p-4 rounded-3xl shadow-xl">
            <Wallet size={30} />
          </div>

          <div>
            <h1 className="text-4xl text-slate-900 font-black">
              Create Smart Group
            </h1>
            <p className="text-slate-500 mt-2">
              Build your shared wallet with real UPI payments
            </p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Group Name (Goa Trip / Room Rent)"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-4 rounded-2xl border border-red-100 bg-white text-slate-900 mb-5"
        />

        <select
          value={groupType}
          onChange={(e) => setGroupType(e.target.value)}
          className="w-full p-4 rounded-2xl border border-red-100 bg-white text-slate-900 mb-5"
        >
          <option>Trip</option>
          <option>Roommates</option>
          <option>Event</option>
          <option>Friends</option>
        </select>

        <select
          value={approvalMode}
          onChange={(e) => setApprovalMode(e.target.value)}
          className="w-full p-4 rounded-2xl border border-red-100 bg-white text-slate-900 mb-5"
        >
          <option value="free">No Permission (Instant Spend)</option>
          <option value="majority">Majority Approval</option>
          <option value="everyone">Everyone Approval</option>
          <option value="admin">Admin Approval</option>
          <option value="threshold">Threshold Approval</option>
        </select>

        {/* NEW ADMIN UPI */}
        <div className="bg-[#fff8f2] border border-orange-100 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-red-500" size={20} />
            <h3 className="font-bold text-slate-900">
              Common Wallet UPI
            </h3>
          </div>

          <input
            type="text"
            placeholder="example: sharan@okaxis"
            value={adminUpi}
            onChange={(e) => setAdminUpi(e.target.value)}
            className="w-full p-4 rounded-2xl border border-red-100 bg-white text-slate-900"
          />

          <p className="text-sm text-slate-500 mt-3">
            All members will send money to this UPI ID for the shared wallet.
          </p>
        </div>

        <button
          onClick={handleCreateGroup}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:scale-[1.01] transition text-white p-4 rounded-2xl font-bold shadow-xl"
        >
          Create Shared Wallet Group
        </button>
      </div>
    </div>
  );
}