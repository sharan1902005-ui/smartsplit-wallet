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
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Smart Budget Alerts
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Budget health and spending warnings
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-md p-5 flex gap-4 items-start border ${
              alert.type === "warning"
                ? "bg-[#EAE1CC] dark:bg-[#171512] border-[#D9A441]"
                : "bg-[#EAE1CC] dark:bg-[#171512] border-[#3F6B4F]"
            }`}
          >
            <div>
              {alert.type === "warning" ? (
                <AlertTriangle className="text-[#D9A441]" />
              ) : (
                <CheckCircle className="text-[#3F6B4F]" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
                {alert.title}
              </h3>

              <p className="text-[#6b6350] dark:text-[#a89a6d] text-sm mt-1">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
