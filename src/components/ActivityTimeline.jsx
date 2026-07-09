import {
  CheckCircle,
  CreditCard,
  Receipt,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { cleanDisplayName } from "../utils/memberDisplay";

export default function ActivityTimeline({ group }) {
  const activities = [
    ...(group?.transactions || []).map((txn) => ({
      type: txn.type,
      amount: txn.amount,
      title: txn.title,
      category: txn.category,
      source: txn.source,
      userName: cleanDisplayName(txn.userName, "Member"),
      createdAt: txn.createdAt,
    })),
    ...(group?.activityTimeline || []).map((activity) => ({
      ...activity,
      userName: cleanDisplayName(activity.userName, "Member"),
    })),
  ]
    .filter((activity) => activity.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getMessage = (activity) => {
    if (activity.text || activity.message || activity.description) {
      return activity.text || activity.message || activity.description;
    }

    if (activity.type === "deposit") {
      return `${activity.userName || "Member"} added Rs. ${activity.amount || 0} to shared wallet`;
    }

    if (activity.type === "expense") {
      return `${activity.userName || "Member"} spent Rs. ${activity.amount || 0} on ${activity.title || "expense"}`;
    }

    if (activity.type === "split") {
      return `${activity.userName || "Member"} created a split expense`;
    }

    if (activity.type === "request") {
      return `${activity.userName || "Member"} submitted an expense request`;
    }

    if (activity.type === "invite") {
      return "A member was added to the group";
    }

    if (activity.type === "deposit_approved") {
      return "Deposit request approved";
    }

    if (activity.type === "deposit_rejected") {
      return "Deposit request rejected";
    }

    if (activity.type === "paid") {
      return "Approved payout was paid";
    }

    if (activity.type === "expense_approved") {
      return "Expense request approved";
    }

    if (activity.type === "expense_rejected") {
      return "Expense request rejected";
    }

    if (activity.type === "expense_vote") {
      return "Expense approval vote recorded";
    }

    return `${activity.type || "Activity"} update`;
  };

  const getIcon = (type) => {
    if (type === "deposit") return <Wallet size={20} />;
    if (type === "expense") return <Receipt size={20} />;
    if (type === "deposit_approved") return <CheckCircle size={20} />;
    if (type === "deposit_rejected") return <XCircle size={20} />;
    if (type === "expense_approved") return <CheckCircle size={20} />;
    if (type === "expense_rejected") return <XCircle size={20} />;
    if (type === "paid") return <CreditCard size={20} />;
    return <Users size={20} />;
  };

  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl p-8 border border-[#C7B98F] dark:border-[#3a352b] mt-8">
      <h2 className="font-['Big_Shoulders_Display'] font-extrabold uppercase tracking-tight text-3xl text-[#B23A2E] mb-8">
        Activity Timeline
      </h2>

      {activities.length === 0 ? (
        <div className="bg-[#EAE1CC]/40 dark:bg-[#171512] rounded-md p-8 text-center text-[#6b6350] dark:text-[#a89a6d]">
          No activity yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-[#EAE1CC]/40 dark:bg-[#171512] rounded-md p-5 border border-[#C7B98F] dark:border-[#3a352b] flex gap-4 items-start"
            >
              <div className="bg-[#F8F4EA] dark:bg-[#221F1A] p-3 rounded-md shadow text-[#B23A2E]">
                {getIcon(activity.type)}
              </div>

              <div>
                <p className="font-semibold text-[#24322E] dark:text-[#EFE7D6]">
                  {getMessage(activity)}
                </p>

                <p className="text-xs text-[#6b6350] dark:text-[#a89a6d] mt-1 font-['IBM_Plex_Mono']">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
