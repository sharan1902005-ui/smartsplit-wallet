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
          } approved \u20B9${deposit.amount} deposit from ${
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
          } rejected \u20B9${deposit.amount} deposit from ${
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
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl border border-[#C7B98F] dark:border-[#3a352b] p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#B23A2E] text-[#F8F4EA] p-4 rounded-md">
          <Wallet size={22} />
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6]">
            Deposit Approvals
          </h2>
          <p className="text-[#6b6350] dark:text-[#a89a6d]">
            Verify payments before wallet update
          </p>
        </div>
      </div>

      {pendingDeposits.length === 0 ? (
        <p className="text-[#6b6350]">
          No pending deposits
        </p>
      ) : (
        <div className="space-y-4">
          {pendingDeposits.map(
            (deposit, index) => (
              <div
                key={index}
                className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {deposit.userName}
                  </h3>

                  <p className="text-[#B23A2E] font-black text-xl">
                    {"\u20B9"}{deposit.amount}
                  </p>

                  <p className="text-sm text-[#6b6350] mt-2">
                    UTR:
                    <span className="font-bold ml-2 text-[#24322E]">
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
                    className="bg-[#3F6B4F] text-[#F8F4EA] px-4 py-3 rounded-md"
                  >
                    <CheckCircle />
                  </button>

                  <button
                    onClick={() =>
                      rejectDeposit(
                        deposit
                      )
                    }
                    className="bg-[#B23A2E] text-[#F8F4EA] px-4 py-3 rounded-md"
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


