import { AlertTriangle, CheckCircle } from "lucide-react";

export default function BudgetAlerts({ group }) {
  const transactions = group.transactions || [];
  const requests = group.expenseRequests || [];

  const expenses = transactions.filter(
    (t) => t.type === "expense"
  );

  const deposits = transactions.filter(
    (t) => t.type === "deposit"
  );

  const totalDeposits = deposits.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const foodExpenses = expenses
    .filter((e) => e.category === "Food")
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingRequests = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const alerts = [];

  if (group.walletBalance < 1000) {
    alerts.push({
      type: "warning",
      title: "Low Wallet Balance",
      message:
        "Shared wallet balance is below ₹1000",
    });
  }

  if (
    totalDeposits > 0 &&
    totalExpenses > totalDeposits * 0.8
  ) {
    alerts.push({
      type: "warning",
      title: "High Spending",
      message:
        "More than 80% of contributions have been spent",
    });
  }

  if (
    totalExpenses > 0 &&
    foodExpenses > totalExpenses * 0.4
  ) {
    alerts.push({
      type: "warning",
      title: "Food Spending High",
      message:
        "Food expenses exceed 40% of total spend",
    });
  }

  if (pendingRequests >= 3) {
    alerts.push({
      type: "warning",
      title: "Pending Requests",
      message:
        "Several requests are waiting for approval",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "healthy",
      title: "Budget Healthy",
      message:
        "Spending patterns look under control",
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Smart Budget Alerts
      </h2>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-2xl p-5 flex gap-4 items-start border ${
              alert.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div>
              {alert.type === "warning" ? (
                <AlertTriangle className="text-yellow-600" />
              ) : (
                <CheckCircle className="text-green-600" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {alert.title}
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
