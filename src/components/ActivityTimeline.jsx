import {
  Wallet,
  Receipt,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from "lucide-react";

export default function ActivityTimeline({ group }) {
  const activities = group.activityTimeline || [];

  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  const getIcon = (type) => {
    switch (type) {
      case "deposit":
        return <Wallet className="text-green-500" />;

      case "request":
        return <Receipt className="text-orange-500" />;

      case "approved":
        return <CheckCircle className="text-green-500" />;

      case "rejected":
        return <XCircle className="text-red-500" />;

      case "paid":
        return <Wallet className="text-blue-500" />;

      case "proof":
        return <ImageIcon className="text-purple-500" />;

      default:
        return <Receipt className="text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Activity Timeline
      </h2>

      {sortedActivities.length === 0 ? (
        <p className="text-slate-500">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {sortedActivities.map((activity, index) => (
            <div
              key={index}
              className="flex gap-4 items-start bg-[#fff8f2] border border-red-100 rounded-2xl p-5"
            >
              <div className="bg-white p-3 rounded-2xl shadow">
                {getIcon(activity.type)}
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  {activity.text}
                </h3>

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
