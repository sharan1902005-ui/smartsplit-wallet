export default function SettlementCalculator({ group }) {
  const members = group.members || [];
  const transactions = group.transactions || [];

  const deposits = transactions.filter(
    (t) => t.type === "deposit"
  );

  const contributions = {};

  members.forEach((member) => {
    const uid =
      typeof member === "string"
        ? member
        : member.uid;

    const name =
      typeof member === "string"
        ? "Member"
        : member.name ||
          member.email ||
          "Member";

    contributions[uid] = {
      name,
      paid: 0,
    };
  });

  deposits.forEach((txn) => {
    if (!contributions[txn.user]) {
      contributions[txn.user] = {
        name:
          txn.userName || "Member",
        paid: 0,
      };
    }

    contributions[txn.user].paid += txn.amount;
  });

  const totalPaid = deposits.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const memberCount = Object.keys(
    contributions
  ).length;

  if (memberCount === 0) {
    return null;
  }

  const fairShare = totalPaid / memberCount;

  const creditors = [];
  const debtors = [];

  Object.entries(contributions).forEach(
    ([uid, member]) => {
      const diff =
        member.paid - fairShare;

      if (diff > 0) {
        creditors.push({
          name: member.name,
          amount: diff,
        });
      } else if (diff < 0) {
        debtors.push({
          name: member.name,
          amount: Math.abs(diff),
        });
      }
    }
  );

  const settlements = [];

  let i = 0;
  let j = 0;

  while (
    i < debtors.length &&
    j < creditors.length
  ) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(
      debtor.amount,
      creditor.amount
    );

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: settleAmount,
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0) i++;
    if (creditor.amount <= 0) j++;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Settlement Calculator
      </h2>

      <div className="bg-[#fff8f2] dark:bg-slate-700 border border-orange-100 dark:border-slate-600 rounded-2xl p-5 mb-6">
        <p className="text-slate-600">
          Total contributed:
          <span className="font-bold text-red-600 ml-2">
            ₹{totalPaid}
          </span>
        </p>

        <p className="text-slate-600 mt-2">
          Fair share per member:
          <span className="font-bold text-orange-600 ml-2">
            ₹{fairShare.toFixed(0)}
          </span>
        </p>
      </div>

      {settlements.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          Everyone is settled ✅
        </p>
      ) : (
        <div className="space-y-4">
          {settlements.map(
            (settlement, index) => (
              <div
                key={index}
                className="bg-[#fff8f2] dark:bg-slate-700 border border-red-100 dark:border-slate-600 rounded-2xl p-5"
              >
                <p className="font-bold text-slate-900 dark:text-white">
                  {settlement.from}
                  <span className="text-slate-500 mx-2">
                    owes
                  </span>
                  {settlement.to}
                </p>

                <p className="text-red-600 font-black text-xl mt-2">
                  ₹
                  {settlement.amount.toFixed(
                    0
                  )}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
