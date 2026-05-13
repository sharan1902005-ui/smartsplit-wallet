import {
  Wallet,
  Receipt,
  Users,
} from "lucide-react";

export default function ActivityTimeline({
  group,
}) {
  const activities = [
    ...(group?.transactions || []).map(
      (txn) => ({
        type: txn.type,
        amount: txn.amount,
        title: txn.title,
        category: txn.category,
        userName:
          txn.userName || "Member",
        createdAt:
          txn.createdAt,
      })
    ),
  ]
    .filter(
      (activity) =>
        activity.userName &&
        activity.createdAt
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  const getMessage = (
    activity
  ) => {
    if (
      activity.type === "deposit"
    ) {
      return `${activity.userName} added ₹${activity.amount} to shared wallet`;
    }

    if (
      activity.type === "expense"
    ) {
      return `${activity.userName} spent ₹${activity.amount} on ${activity.title}`;
    }

    if (
      activity.type === "split"
    ) {
      return `${activity.userName} created split expense`;
    }

    return "Activity";
  };

  const getIcon = (type) => {
    if (type === "deposit")
      return <Wallet size={20} />;
    if (type === "expense")
      return <Receipt size={20} />;
    return <Users size={20} />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-red-100 dark:border-slate-700 mt-8">
      <h2 className="text-3xl font-black text-red-600 mb-8">
        Activity Timeline
      </h2>

      {activities.length === 0 ? (
        <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-8 text-center">
          No activity yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {activities.map(
            (
              activity,
              index
            ) => (
              <div
                key={index}
                className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-5 border border-red-100 dark:border-slate-700 flex gap-4 items-start"
              >
                <div className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow">
                  {getIcon(
                    activity.type
                  )}
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getMessage(
                      activity
                    )}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
