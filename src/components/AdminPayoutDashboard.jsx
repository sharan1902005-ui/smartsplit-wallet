import { doc, runTransaction } from "firebase/firestore";
import toast from "react-hot-toast";
import { CheckCircle, Wallet } from "lucide-react";
import { auth, db } from "../firebase/config";

export default function AdminPayoutDashboard({ group }) {
  const currentUser = auth.currentUser;
  const isAdmin = group.adminUid === currentUser?.uid;

  const approvedRequests = (group.expenseRequests || []).filter(
    (request) => request.status === "approved"
  );

  const payoutVendor = async (requestId) => {
    await runTransaction(db, async (transaction) => {
      const groupRef = doc(db, "groups", group.id);
      const snapshot = await transaction.get(groupRef);
      const latestGroup = { id: snapshot.id, ...snapshot.data() };
      const request = (latestGroup.expenseRequests || []).find(
        (item) => item.id === requestId && item.status === "approved"
      );

      if (!request) {
        throw new Error("Approved request not found");
      }

      transaction.update(groupRef, {
        expenseRequests: (latestGroup.expenseRequests || []).map((item) =>
          item.id === request.id
            ? { ...item, status: "paid", paidAt: new Date().toISOString() }
            : item
        ),
        activityTimeline: [
          ...(latestGroup.activityTimeline || []),
          {
            type: "paid",
            text: `${currentUser.displayName || currentUser.email} marked vendor paid for Rs. ${request.amount} ${request.title}`,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    });

    toast.success("Vendor marked paid");
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-[#F8F4EA] rounded-md shadow-xl border border-[#C7B98F] p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#B23A2E] text-[#F8F4EA] p-3 rounded-md">
          <Wallet size={22} />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-[#B23A2E]">
            Admin Payout Dashboard
          </h2>

          <p className="text-[#6b6350]">
            Mark approved wallet expenses as paid
          </p>
        </div>
      </div>

      {approvedRequests.length === 0 ? (
        <p className="text-[#6b6350]">
          No approved payouts pending.
        </p>
      ) : (
        <div className="space-y-4">
          {approvedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[#F8F4EA] border border-[#C7B98F] rounded-md p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {request.title}
                  </h3>

                  <p className="text-[#6b6350]">
                    {request.category}
                  </p>

                  <p className="text-[#B23A2E] font-black text-xl mt-2">
                    Rs. {request.amount}
                  </p>

                  <p className="text-sm text-[#6b6350] mt-2">
                    Requested by {request.requestedByName}
                  </p>
                </div>

                <button
                  onClick={() => payoutVendor(request.id)}
                  className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] px-5 py-3 rounded-md font-bold flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
