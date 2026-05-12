import {
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Wallet,
} from "lucide-react";

export default function DepositApproval({
  group,
}) {
  const isAdmin =
    auth.currentUser?.uid ===
    group.adminUid;

  if (!isAdmin) return null;

  const pendingDeposits = (
    group.depositRequests || []
  ).filter(
    (d) => d.status === "pending"
  );

  const approveDeposit = async (
    deposit
  ) => {
    const updatedRequests = (
      group.depositRequests || []
    ).map((d) =>
      d.createdAt === deposit.createdAt
        ? {
            ...d,
            status: "approved",
          }
        : d
    );

    await updateDoc(doc(db, "groups", group.id), {
      depositRequests:
        updatedRequests,

      walletBalance:
        (group.walletBalance || 0) +
        deposit.amount,

      totalIncome:
        (group.totalIncome || 0) +
        deposit.amount,

      transactions: [
        ...(group.transactions || []),
        {
          type: "deposit",
          amount: deposit.amount,
          user: deposit.user,
          userName: deposit.userName,
          source: "Admin Approved UPI",
          createdAt: new Date().toISOString(),
        },
      ],

      activityTimeline: [
        ...(group.activityTimeline || []),
        {
          type: "deposit_approved",
          text: `${
            auth.currentUser.displayName ||
            auth.currentUser.email
          } approved ₹${deposit.amount} deposit from ${
            deposit.userName
          }`,
          createdAt:
            new Date().toISOString(),
        },
      ],
    });
    toast.success("Deposit approved");
  };

  const rejectDeposit = async (
    deposit
  ) => {
    const updatedRequests = (
      group.depositRequests || []
    ).map((d) =>
      d.createdAt === deposit.createdAt
        ? {
            ...d,
            status: "rejected",
          }
        : d
    );

    await updateDoc(doc(db, "groups", group.id), {
      depositRequests:
        updatedRequests,

      activityTimeline: [
        ...(group.activityTimeline || []),
        {
          type: "deposit_rejected",
          text: `${
            auth.currentUser.displayName ||
            auth.currentUser.email
          } rejected ₹${deposit.amount} deposit from ${
            deposit.userName
          }`,
          createdAt:
            new Date().toISOString(),
        },
      ],
    });
    toast.error("Deposit rejected");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-red-500 text-white p-4 rounded-2xl">
          <Wallet size={22} />
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Deposit Approvals
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Verify payments before wallet update
          </p>
        </div>
      </div>

      {pendingDeposits.length === 0 ? (
        <p className="text-slate-500">
          No pending deposits
        </p>
      ) : (
        <div className="space-y-4">
          {pendingDeposits.map(
            (deposit, index) => (
              <div
                key={index}
                className="bg-[#fff8f2] dark:bg-slate-800 border border-red-100 dark:border-slate-700 rounded-2xl p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {deposit.userName}
                  </h3>

                  <p className="text-red-500 font-black text-xl">
                    ₹{deposit.amount}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    UTR:
                    <span className="font-bold ml-2 text-slate-800">
                      {deposit.utr || "No UTR"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      approveDeposit(
                        deposit
                      )
                    }
                    className="bg-green-600 text-white px-4 py-3 rounded-2xl"
                  >
                    <CheckCircle />
                  </button>

                  <button
                    onClick={() =>
                      rejectDeposit(
                        deposit
                      )
                    }
                    className="bg-red-600 text-white px-4 py-3 rounded-2xl"
                  >
                    <XCircle />
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
