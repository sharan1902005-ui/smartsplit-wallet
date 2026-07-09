export default function ExpenseInsights({ group }) {
  const transactions = group.transactions || [];

  const deposits = transactions.filter((t) => t.type === "deposit");
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalAdded = deposits.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const biggestExpense =
    expenses.length > 0
      ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max))
      : null;

  const spendPercent =
    totalAdded > 0 ? ((totalSpent / totalAdded) * 100).toFixed(1) : 0;

  let insight = "Wallet is healthy";

  if (spendPercent > 70) {
    insight = "Wallet running low";
  }

  if (spendPercent > 90) {
    insight = "Critical spending level";
  }

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Smart Expense Insights
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Snapshot of wallet inflow, spending, and health
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightStat label="Total Added" value={`Rs. ${totalAdded}`} tone="green" />
        <InsightStat label="Total Spent" value={`Rs. ${totalSpent}`} tone="red" />
        <InsightStat label="Wallet Health" value={`${spendPercent}% used`} tone="gold" />
        <InsightStat
          label="Biggest Expense"
          value={biggestExpense ? `${biggestExpense.title} Rs. ${biggestExpense.amount}` : "None"}
          tone="ink"
        />
      </div>

      <div className="mt-5 rounded-md border border-[#D9A441] bg-[#EAE1CC] p-5 dark:bg-[#171512]">
        <h3 className="font-['Big_Shoulders_Display'] text-2xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          {insight}
        </h3>
      </div>
    </section>
  );
}

function InsightStat({ label, value, tone }) {
  const color = {
    green: "text-[#3F6B4F]",
    red: "text-[#B23A2E]",
    gold: "text-[#D9A441]",
    ink: "text-[#24322E] dark:text-[#EFE7D6]",
  }[tone];

  return (
    <div className="rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-5 dark:border-[#3a352b] dark:bg-[#171512]">
      <p className="text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d]">
        {label}
      </p>
      <h3 className={`mt-2 font-['IBM_Plex_Mono'] text-2xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}
