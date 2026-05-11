export default function AISuggestions({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter((t) => t.type === "deposit");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalDeposits = deposits.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const suggestions = [];

  // Wallet low
  if (group.walletBalance < 1000 && totalDeposits > 0) {
    suggestions.push("⚠️ Wallet balance is running low.");
  }

  // High spending
  if (totalDeposits > 0 && totalExpenses / totalDeposits > 0.7) {
    suggestions.push("💸 More than 70% of funds have been spent.");
  }

  // Top contributor dominance
  const contributionMap = {};

  deposits.forEach((d) => {
    contributionMap[d.user] =
      (contributionMap[d.user] || 0) + d.amount;
  });

  const maxContribution = Math.max(
    ...Object.values(contributionMap),
    0
  );

  if (
    totalDeposits > 0 &&
    maxContribution / totalDeposits > 0.6
  ) {
    suggestions.push(
      "👤 One member contributed more than 60% of the wallet."
    );
  }

  // Expense title analysis
  const foodExpenses = expenses.filter((e) =>
    e.title?.toLowerCase().includes("food")
  );

  if (foodExpenses.length >= 2) {
    suggestions.push("🍔 Food seems to be a frequent expense.");
  }

  // Approval suggestion
  if (
    group.approvalMode === "free" &&
    totalExpenses > 3000
  ) {
    suggestions.push(
      "🔐 Consider switching to approval mode for better control."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("✅ Spending looks healthy.");
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        AI Smart Suggestions
      </h2>

      <div className="space-y-4">
        {suggestions.map((tip, index) => (
          <div
            key={index}
            className="bg-slate-800 p-5 rounded-2xl"
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
