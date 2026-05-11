export default function ExpenseInsights({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter((t) => t.type === "deposit");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalAdded = deposits.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const biggestExpense =
    expenses.length > 0
      ? expenses.reduce((max, t) =>
          t.amount > max.amount ? t : max
        )
      : null;

  const spendPercent =
    totalAdded > 0 ? ((totalSpent / totalAdded) * 100).toFixed(1) : 0;

  let insight = "Wallet is healthy ✅";

  if (spendPercent > 70) {
    insight = "⚠️ Wallet running low";
  }

  if (spendPercent > 90) {
    insight = "🚨 Critical spending level";
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        Smart Expense Insights
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400">Total Added</p>
          <h3 className="text-2xl font-bold">₹{totalAdded}</h3>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400">Total Spent</p>
          <h3 className="text-2xl font-bold">₹{totalSpent}</h3>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400">Wallet Health</p>
          <h3 className="text-2xl font-bold">{spendPercent}% used</h3>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400">Biggest Expense</p>
          <h3 className="text-2xl font-bold">
            {biggestExpense
              ? `${biggestExpense.title} ₹${biggestExpense.amount}`
              : "None"}
          </h3>
        </div>
      </div>

      <div className="mt-6 bg-indigo-600 p-5 rounded-2xl">
        <h3 className="text-xl font-bold">{insight}</h3>
      </div>
    </div>
  );
}