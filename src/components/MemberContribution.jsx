import { auth } from "../firebase/config";
import { Wallet } from "lucide-react";

export default function MemberContribution({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter(
    (tx) => tx.type === "deposit"
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500 text-white p-3 rounded-2xl">
          <Wallet size={20} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-red-600">
            Deposit History
          </h2>
          <p className="text-slate-500">
            Shared wallet contribution activity
          </p>
        </div>
      </div>

      {deposits.length === 0 ? (
        <div className="bg-[#fff8f2] rounded-2xl p-6 border border-red-100 text-slate-500">
          No wallet contributions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {deposits
            .slice()
            .reverse()
            .map((tx, index) => (
              <div
                key={index}
                className="bg-[#fff8f2] border border-red-100 rounded-2xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      tx.userPhoto ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt="avatar"
                    className="w-14 h-14 rounded-full border"
                  />

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {tx.userName || "SmartSplit User"}
                    </h3>

                    <p className="text-slate-500 text-sm">
                      Added money via {tx.source || "Wallet"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">
                    +₹{tx.amount}
                  </p>

                  <p className="text-xs text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
