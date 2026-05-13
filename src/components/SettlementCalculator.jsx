import { Calculator } from "lucide-react";

export default function SettlementCalculator({
  group,
}) {
  const members = group?.members || [];

  const deposits =
    (group?.transactions || []).filter(
      (txn) => txn.type === "deposit"
    );

  if (members.length <= 1) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-red-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <Calculator className="text-red-500" />
          <h2 className="text-3xl font-black text-red-600">
            Settlement Calculator
          </h2>
        </div>

        <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-6 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-lg font-semibold">
            No settlements needed.
          </p>

          <p className="text-slate-400 mt-2">
            Add more members to split balances.
          </p>
        </div>
      </div>
    );
  }

  const contributions = {};

  members.forEach((member) => {
    contributions[member.email] = {
      name:
        member.name ||
        member.email ||
        "Member",
      total: 0,
    };
  });

  deposits.forEach((txn) => {
    const key =
      txn.userName ||
      txn.userId ||
      "Unknown";

    if (!contributions[key]) {
      contributions[key] = {
        name: key,
        total: 0,
      };
    }

    contributions[key].total +=
      txn.amount || 0;
  });

  const totals =
    Object.values(contributions);

  const totalContributed =
    totals.reduce(
      (sum, member) =>
        sum + member.total,
      0
    );

  const fairShare =
    totalContributed / members.length;

  const settlements = [];

  const creditors = totals
    .filter(
      (m) => m.total > fairShare
    )
    .map((m) => ({
      ...m,
      extra:
        m.total - fairShare,
    }));

  const debtors = totals
    .filter(
      (m) => m.total < fairShare
    )
    .map((m) => ({
      ...m,
      owed:
        fairShare - m.total,
    }));

  debtors.forEach((debtor) => {
    creditors.forEach(
      (creditor) => {
        if (
          debtor.owed > 0 &&
          creditor.extra > 0 &&
          debtor.name !==
            creditor.name
        ) {
          const amount = Math.min(
            debtor.owed,
            creditor.extra
          );

          settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount:
              Math.round(amount),
          });

          debtor.owed -= amount;
          creditor.extra -= amount;
        }
      }
    );
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-red-100 dark:border-slate-700">
      <div className="flex items-center gap-4 mb-6">
        <Calculator className="text-red-500" />
        <h2 className="text-3xl font-black text-red-600">
          Settlement Calculator
        </h2>
      </div>

      <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-6 mb-6">
        <p className="text-slate-600">
          Total contributed:
          <span className="font-bold text-red-500 ml-2">
            ₹{totalContributed}
          </span>
        </p>

        <p className="text-slate-600 mt-2">
          Fair share per member:
          <span className="font-bold text-orange-500 ml-2">
            ₹
            {Math.round(
              fairShare
            )}
          </span>
        </p>
      </div>

      {settlements.length === 0 ? (
        <div className="bg-green-50 rounded-2xl p-6 text-center">
          <p className="font-semibold text-green-700">
            Everyone is settled.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map(
            (
              settlement,
              index
            ) => (
              <div
                key={index}
                className="bg-[#fff8f2] rounded-2xl p-5 border border-red-100"
              >
                <p className="font-semibold">
                  {
                    settlement.from
                  }{" "}
                  owes{" "}
                  {
                    settlement.to
                  }
                </p>

                <p className="text-red-500 font-black text-xl mt-2">
                  ₹
                  {
                    settlement.amount
                  }
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
