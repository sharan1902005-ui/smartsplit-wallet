import { auth } from "../firebase/config";

export default function MemberContribution({ group }) {
  const transactions = group.transactions || [];
  const members = group.members || [];

  const contributions = {};

  members.forEach((member) => {
    contributions[member] = 0;
  });

  transactions.forEach((tx) => {
    if (tx.type === "deposit") {
      contributions[tx.user] =
        (contributions[tx.user] || 0) + tx.amount;
    }
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Member Contributions
      </h2>

      <div className="space-y-4">
        {Object.entries(contributions).map(([member, amount]) => (
          <div
            key={member}
            className="bg-red-50 border border-red-100 rounded-2xl p-5 flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-slate-800">
                {member === auth.currentUser?.uid
                  ? "You"
                  : member.slice(0, 8)}
              </p>
              <p className="text-slate-500 text-sm">
                Contributor
              </p>
            </div>

            <span className="text-green-600 font-bold text-2xl">
              ₹{amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
