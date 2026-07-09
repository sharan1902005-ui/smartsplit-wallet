import { Bell } from "lucide-react";
import { auth } from "../firebase/config";

export default function Notifications({
  group,
}) {
  const isAdmin =
    auth.currentUser?.uid ===
    group.adminUid;

  if (!isAdmin) return null;

  const pendingExpenses = (
    group.expenseRequests || []
  ).filter(
    (r) => r.status === "pending"
  ).length;

  const pendingDeposits = (
    group.depositRequests || []
  ).filter(
    (r) => r.status === "pending"
  ).length;

  const totalPending =
    pendingExpenses + pendingDeposits;

  return (
    <div className="bg-[#F8F4EA] rounded-md shadow-xl border border-[#C7B98F] p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#B23A2E] text-[#F8F4EA] p-4 rounded-md relative">
            <Bell size={22} />

            {totalPending > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D9A441] text-black font-bold text-xs w-7 h-7 rounded-full flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Notifications
            </h2>

            <p className="text-[#6b6350]">
              Approval queue
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <NotificationRow
          title="Pending Expense Requests"
          count={pendingExpenses}
        />

        <NotificationRow
          title="Pending Deposit Requests"
          count={pendingDeposits}
        />
      </div>
    </div>
  );
}

function NotificationRow({
  title,
  count,
}) {
  return (
    <div className="bg-[#F8F4EA] border border-[#C7B98F] rounded-md p-4 flex justify-between items-center">
      <p className="font-semibold">
        {title}
      </p>

      <span className="bg-[#B23A2E] text-[#F8F4EA] px-4 py-2 rounded-full font-bold">
        {count}
      </span>
    </div>
  );
}


