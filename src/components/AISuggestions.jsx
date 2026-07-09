import { CheckCircle, Info, Lightbulb, TriangleAlert } from "lucide-react";

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

  if (group.walletBalance < 1000 && totalDeposits > 0) {
    suggestions.push({
      tone: "warning",
      text: "Wallet balance is running low.",
    });
  }

  if (totalDeposits > 0 && totalExpenses / totalDeposits > 0.7) {
    suggestions.push({
      tone: "warning",
      text: "More than 70% of funds have been spent.",
    });
  }

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
    suggestions.push({
      tone: "info",
      text: "One member contributed more than 60% of the wallet.",
    });
  }

  const foodExpenses = expenses.filter((e) =>
    e.title?.toLowerCase().includes("food")
  );

  if (foodExpenses.length >= 2) {
    suggestions.push({
      tone: "info",
      text: "Food seems to be a frequent expense.",
    });
  }

  if (
    group.approvalMode === "free" &&
    totalExpenses > 3000
  ) {
    suggestions.push({
      tone: "info",
      text: "Consider switching to approval mode for better control.",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      tone: "healthy",
      text: "Spending looks healthy.",
    });
  }

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md border border-[#D9A441] bg-[#EAE1CC] p-3 text-[#D9A441] dark:bg-[#171512]">
          <Lightbulb size={22} />
        </div>
        <div>
          <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
            AI Smart Suggestions
          </h2>
          <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
            Practical prompts based on wallet activity
          </p>
        </div>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {suggestions.map((tip, index) => (
          <SuggestionCard key={index} tip={tip} />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({ tip }) {
  const styles = {
    warning: {
      card: "border-[#D9A441] bg-[#EAE1CC] text-[#24322E] dark:bg-[#171512] dark:text-[#EFE7D6]",
      icon: <TriangleAlert size={18} />,
    },
    info: {
      card: "border-[#C7B98F] bg-[#F8F4EA] text-[#24322E] dark:border-[#3a352b] dark:bg-[#221F1A] dark:text-[#EFE7D6]",
      icon: <Info size={18} />,
    },
    healthy: {
      card: "border-[#3F6B4F] bg-[#EAE1CC] text-[#24322E] dark:bg-[#171512] dark:text-[#EFE7D6]",
      icon: <CheckCircle size={18} />,
    },
  }[tip.tone];

  return (
    <div className={`flex gap-3 rounded-md border p-4 ${styles.card}`}>
      <div className="mt-0.5 shrink-0">{styles.icon}</div>
      <p className="text-sm font-semibold leading-relaxed">{tip.text}</p>
    </div>
  );
}
