import {
  Wallet,
  Receipt,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function ActivityTimeline({ group }) {
  const transactions = group.transactions || [];
  const requests = group.expenseRequests || [];

  const activities = [];

  transactions.forEach((tx) => {
    if (tx.type === "deposit") {
      activities.push({
        type: "deposit",
        title: `${tx.userName || "User"} added ₹${tx.amount}`,
        subtitle: `via ${tx.source || "Wallet"}`,
        createdAt: tx.createdAt,
      });
    }

    if (tx.type === "expense") {
      activities.push({
        type: "expense",
        title: `${tx.userName || "User"} spent ₹${tx.amount}`,
        subtitle: tx.category || "Expense",
        createdAt: tx.createdAt,
      });
    }
  });

  requests.forEach((req) => {
    activities.push({
      type: req.status,
      title: `${req.requestedByName || "User"} requested ₹${req.amount}`,
      subtitle: req.title,
      createdAt: req.createdAt,
    });
  });

  activities.sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  const getIcon = (type) => {
    switch (type) {
      case "deposit":
        return <Wallet className="text-green-500" />;
      case "expense":
        return <Receipt className="text-red-500" />;
      case "approved":
        return <CheckCircle className="text-green-500" />;
      case "rejected":
        return <XCircle className="text-red-500" />;
      default:
        return <Receipt className="text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Activity Timeline
      </h2>

      {activities.length === 0 ? (
        <p className="text-slate-500">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex gap-4 items-start bg-[#fff8f2] border border-red-100 rounded-2xl p-5"
            >
              <div className="bg-white p-3 rounded-2xl shadow">
                {getIcon(activity.type)}
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  {activity.title}
                </h3>

                <p className="text-slate-500 text-sm">
                  {activity.subtitle}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {new Date(
                    activity.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
