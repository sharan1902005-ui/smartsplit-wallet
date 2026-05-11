import { AlertTriangle, CheckCircle } from "lucide-react";

export default function BudgetAlerts({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter(
    (tx) => tx.type === "deposit"
  );

  const expenses = transactions.filter(
    (tx) => tx.type === "expense"
  );

  const totalDeposits = deposits.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const foodExpenses = expenses
    .filter((tx) => tx.category === "Food")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const alerts = [];

  if (group.walletBalance < 500) {
    alerts.push({
      type: "warning",
      title: "Low wallet balance",
      desc: "Shared wallet is below ₹500",
    });
  }

  if (
    totalDeposits > 0 &&
    totalExpenses >= totalDeposits * 0.8
  ) {
    alerts.push({
      type: "warning",
      title: "High spending",
      desc: "80% of wallet contributions have been used",
    });
  }

  if (
    totalExpenses > 0 &&
    foodExpenses >= totalExpenses * 0.4
  ) {
    alerts.push({
      type: "warning",
      title: "Food spending high",
      desc: "Food takes a major share of expenses",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "healthy",
      title: "Budget looks healthy",
      desc: "Spending is under control",
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Budget Alerts
      </h2>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-2xl p-5 border flex gap-4 items-start ${
              alert.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div>
              {alert.type === "warning" ? (
                <AlertTriangle className="text-yellow-500" />
              ) : (
                <CheckCircle className="text-green-500" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {alert.title}
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                {alert.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
