import {
  doc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import toast from "react-hot-toast";
import {
  Wallet,
  CheckCircle
} from "lucide-react";

export default function AdminPayoutDashboard({ group }) {
  const currentUser = auth.currentUser;

  const isAdmin =
    group.adminUid === currentUser?.uid;

  const approvedRequests =
    (group.expenseRequests || []).filter(
      (r) => r.status === "approved"
    );

  const payoutVendor = async (requestIndex) => {
    const request =
      approvedRequests[requestIndex];

    if (
      group.walletBalance < request.amount
    ) {
      alert("Insufficient wallet");
      return;
    }

    const updatedRequests = (
      group.expenseRequests || []
    ).map((r) =>
      r.id === request.id
        ? { ...r, status: "paid" }
        : r
    );

    await updateDoc(doc(db, "groups", group.id), {
      walletBalance:
        group.walletBalance - request.amount,

      expenseRequests: updatedRequests,

      transactions: [
        ...(group.transactions || []),
        {
          type: "expense",
          title: request.title,
          amount: request.amount,
          category: request.category,
          user: request.requestedBy,
          userName:
            request.requestedByName,
          source: "Admin Vendor Payment",
          createdAt:
            new Date().toISOString(),
        },
      ],

      activityTimeline: [
        ...(group.activityTimeline || []),
        {
          type: "paid",
          text: `${
            currentUser.displayName ||
            currentUser.email
          } paid vendor ₹${
            request.amount
          } for ${request.title}`,
          createdAt:
            new Date().toISOString(),
        },
      ],
    });

    toast.success("Vendor paid successfully");
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500 text-white p-3 rounded-2xl">
          <Wallet size={22} />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-red-600">
            Admin Payout Dashboard
          </h2>

          <p className="text-slate-500">
            Manage pooled wallet payments
          </p>
        </div>
      </div>

      {approvedRequests.length === 0 ? (
        <p className="text-slate-500">
          No approved payouts pending.
        </p>
      ) : (
        <div className="space-y-4">
          {approvedRequests.map(
            (request, index) => (
              <div
                key={request.id}
                className="bg-[#fff8f2] border border-red-100 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      {request.title}
                    </h3>

                    <p className="text-slate-500">
                      {request.category}
                    </p>

                    <p className="text-red-600 font-black text-xl mt-2">
                      ₹{request.amount}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      Requested by{" "}
                      {
                        request.requestedByName
                      }
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      payoutVendor(index)
                    }
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Pay Vendor
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
