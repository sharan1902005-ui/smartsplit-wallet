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
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 text-white p-4 rounded-2xl relative">
            <Bell size={22} />

            {totalPending > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-xs w-7 h-7 rounded-full flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Notifications
            </h2>

            <p className="text-slate-500">
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
    <div className="bg-[#fff8f2] border border-red-100 rounded-2xl p-4 flex justify-between items-center">
      <p className="font-semibold">
        {title}
      </p>

      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
        {count}
      </span>
    </div>
  );
}
