export default function SettlementCalculator({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter(
    (tx) => tx.type === "deposit"
  );

  const expenses = transactions.filter(
    (tx) => tx.type === "expense"
  );

  const membersMap = {};

  deposits.forEach((tx) => {
    const name = tx.userName || "User";

    if (!membersMap[tx.user]) {
      membersMap[tx.user] = {
        name,
        paid: 0,
      };
    }

    membersMap[tx.user].paid += tx.amount;
  });

  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const members = Object.values(membersMap);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Settlement Calculator
        </h2>
        <p className="text-slate-500">
          No contribution data yet.
        </p>
      </div>
    );
  }

  const sharePerPerson = totalExpenses / members.length;

  const balances = members.map((member) => ({
    ...member,
    balance: member.paid - sharePerPerson,
  }));

  const creditors = balances.filter((m) => m.balance > 0);
  const debtors = balances.filter((m) => m.balance < 0);

  const settlements = [];

  debtors.forEach((debtor) => {
    let debt = Math.abs(debtor.balance);

    creditors.forEach((creditor) => {
      if (debt <= 0 || creditor.balance <= 0) return;

      const payAmount = Math.min(debt, creditor.balance);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: payAmount,
      });

      debt -= payAmount;
      creditor.balance -= payAmount;
    });
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Settlement Calculator
      </h2>

      <div className="bg-[#fff8f2] rounded-2xl border border-orange-100 p-5 mb-6">
        <p className="text-slate-500">
          Total Expenses
        </p>
        <p className="text-3xl font-black text-red-600">
          ₹{totalExpenses}
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Equal share: ₹{sharePerPerson.toFixed(0)} per person
        </p>
      </div>

      {settlements.length === 0 ? (
        <p className="text-slate-500">
          Everyone is settled 🎉
        </p>
      ) : (
        <div className="space-y-4">
          {settlements.map((settlement, index) => (
            <div
              key={index}
              className="bg-green-50 border border-green-100 rounded-2xl p-5 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {settlement.from}
                </p>
                <p className="text-slate-500 text-sm">
                  owes
                </p>
              </div>

              <div className="text-center">
                <p className="text-xl font-black text-green-600">
                  ₹{settlement.amount.toFixed(0)}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  {settlement.to}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
