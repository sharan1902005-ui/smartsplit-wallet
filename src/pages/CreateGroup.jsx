import { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Luggage, ShieldCheck, Plane } from "lucide-react";
import { cleanDisplayName } from "../utils/memberDisplay";
import ThemeToggle from "../components/ThemeToggle";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Trip");
  const [approvalMode, setApprovalMode] = useState("free");
  const [approvalThreshold, setApprovalThreshold] = useState(500);
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
        approvalThreshold:
          approvalMode === "threshold" ? Number(approvalThreshold || 500) : 500,
        inviteCode: generateInviteCode(),

        createdBy: auth.currentUser.uid,
        adminUid: auth.currentUser.uid,
        adminUpi: adminUpi,

        members: [
          {
            uid: auth.currentUser.uid,
            name:
              cleanDisplayName(auth.currentUser.displayName, "User"),
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
        depositRequests: [],
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
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] flex justify-center items-center px-4 py-12">
      <div className="bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] p-10 rounded-md w-full max-w-2xl shadow-2xl">

        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md shadow-xl">
              <Luggage size={26} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#B23A2E] uppercase tracking-widest">
                Issue new ticket
              </p>
              <h1 className="text-4xl font-black text-[#24322E] dark:text-[#EFE7D6]">
                Create group
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="h-px bg-[#C7B98F] dark:bg-[#3a352b] my-6" />

        <label className="block text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d] mb-2">
          Destination / group name
        </label>
        <input
          type="text"
          placeholder="Goa Trip / Room Rent"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] mb-5"
        />

        <label className="block text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d] mb-2">
          Ticket class
        </label>
        <select
          value={groupType}
          onChange={(e) => setGroupType(e.target.value)}
          className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] mb-5"
        >
          <option>Trip</option>
          <option>Roommates</option>
          <option>Event</option>
          <option>Friends</option>
        </select>

        <label className="block text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d] mb-2">
          Boarding rules (approval)
        </label>
        <select
          value={approvalMode}
          onChange={(e) => setApprovalMode(e.target.value)}
          className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] mb-5"
        >
          <option value="free">No permission (instant spend)</option>
          <option value="majority">Majority approval</option>
          <option value="everyone">Everyone approval</option>
          <option value="admin">Admin approval</option>
          <option value="threshold">Threshold approval</option>
        </select>

        {approvalMode === "threshold" && (
          <>
            <label className="block text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d] mb-2">
              Approval threshold
            </label>
            <input
              type="number"
              min="0"
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(e.target.value)}
              className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] mb-5 font-['IBM_Plex_Mono']"
            />
            <p className="-mt-3 mb-5 text-sm text-[#6b6350] dark:text-[#a89a6d]">
              Expenses at or below this amount auto-approve. Higher expenses need admin approval.
            </p>
          </>
        )}

        {/* Admin UPI panel */}
        <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-[#B23A2E]" size={18} />
            <h3 className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
              Common wallet UPI
            </h3>
          </div>

          <input
            type="text"
            placeholder="example: sharan@okaxis"
            value={adminUpi}
            onChange={(e) => setAdminUpi(e.target.value)}
            className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6]"
          />

          <p className="text-sm text-[#6b6350] dark:text-[#a89a6d] mt-3">
            All members send money to this UPI ID for the shared wallet.
          </p>
        </div>

        <button
          onClick={handleCreateGroup}
          className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition"
        >
          <Plane size={18} /> Issue ticket &amp; create wallet
        </button>
      </div>
    </div>
  );
}

