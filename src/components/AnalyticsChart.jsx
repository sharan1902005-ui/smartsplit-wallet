import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  BarChart3,
  Brain,
  Trophy,
} from "lucide-react";
import { cleanDisplayName } from "../utils/memberDisplay";

const COLORS = [
  "#B23A2E",
  "#3F6B4F",
  "#D9A441",
  "#24322E",
  "#6b6350",
  "#C7B98F",
];

const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function AnalyticsChart({ group }) {
  if (!group) {
    return (
      <div className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-8 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
        <p className="text-[#6b6350] dark:text-[#a89a6d]">
          Loading analytics...
        </p>
      </div>
    );
  }

  const transactions = group?.transactions || [];
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense");
  const depositTransactions = transactions.filter((tx) => tx.type === "deposit");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = {};
  const categoryMap = {};
  const contributorMap = {};

  expenseTransactions.forEach((tx) => {
    const date = tx.createdAt ? new Date(tx.createdAt) : new Date();
    const month = monthNames[date.getMonth()];
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(tx.amount || 0);

    const category = tx.category || "Other";
    categoryMap[category] = (categoryMap[category] || 0) + Number(tx.amount || 0);
  });

  depositTransactions.forEach((tx) => {
    const user = cleanDisplayName(tx.userName, "Unknown");
    contributorMap[user] = (contributorMap[user] || 0) + Number(tx.amount || 0);
  });

  const monthlyData = monthNames.map((month) => ({
    month,
    amount: monthlyMap[month] || 0,
  }));

  const totalExpenses = expenseTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percent: totalExpenses ? Math.round((value / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const contributorData = Object.entries(contributorMap).sort((a, b) => b[1] - a[1]);
  const topCategory = categoryData[0];
  const maxMonthlyAmount = Math.max(...monthlyData.map((item) => item.amount), 0);
  const yAxisMax = maxMonthlyAmount > 0 ? Math.ceil((maxMonthlyAmount * 1.2) / 100) * 100 : 100;

  const aiInsight = topCategory
    ? `${topCategory.name} is ${topCategory.percent}% of total expenses.`
    : "No expense insights yet.";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={<BarChart3 />} title="Total Expenses" value={formatAmount(totalExpenses)} />
        <StatCard icon={<Trophy />} title="Top Category" value={topCategory?.name || "None"} />
        <StatCard icon={<Brain />} title="Insight" value={topCategory ? `${topCategory.percent}% top spend` : "Waiting"} />
      </div>

      <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
          <div className="mb-5">
            <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
              Monthly Spending
            </h2>
            <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
              Expenses by month with a data-fitted scale
            </p>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 24, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C7B98F" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#6b6350", fontSize: 12 }} />
                <YAxis
                  domain={[0, yAxisMax]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b6350", fontSize: 12 }}
                  tickFormatter={(value) => `Rs. ${value}`}
                  width={64}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(199, 185, 143, 0.2)" }} />
                <Bar dataKey="amount" fill="#B23A2E" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="amount" position="top" formatter={(value) => (value ? formatAmount(value) : "")} className="fill-[#6b6350] text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
          <div className="mb-5">
            <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
              Spending by Category
            </h2>
            <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
              Category share, amount, and percentage
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center rounded-md bg-[#EAE1CC] text-[#6b6350] dark:bg-[#171512] dark:text-[#a89a6d]">
              No category spending yet.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48} paddingAngle={3}>
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between gap-4 rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-3 dark:border-[#3a352b] dark:bg-[#171512]">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-bold text-[#24322E] dark:text-[#EFE7D6]">{entry.name}</p>
                        <p className="text-xs text-[#6b6350] dark:text-[#a89a6d]">{entry.percent}% of spend</p>
                      </div>
                    </div>
                    <p className="font-black text-[#24322E] dark:text-[#EFE7D6]">{formatAmount(entry.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="grid xl:grid-cols-[1fr_420px] gap-6">
        <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
          <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6] mb-5">
            Contributor Leaderboard
          </h2>

          <div className="space-y-3">
            {contributorData.length === 0 ? (
              <p className="rounded-md bg-[#EAE1CC] p-5 text-[#6b6350] dark:bg-[#171512] dark:text-[#a89a6d]">
                No deposits yet.
              </p>
            ) : (
              contributorData.map(([name, amount], index) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-4 dark:border-[#3a352b] dark:bg-[#171512]"
                >
                  <p className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
                    #{index + 1} {name}
                  </p>
                  <p className="text-xl font-black text-[#24322E] dark:text-[#EFE7D6]">{formatAmount(amount)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-md border border-[#D9A441] bg-[#EAE1CC] p-6 shadow-sm dark:bg-[#171512]">
          <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
            Smart Insight
          </h2>
          <p className="mt-3 text-[#6b6350] dark:text-[#a89a6d]">
            {aiInsight}
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-5 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-4 text-[#B23A2E]">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#6b6350] dark:text-[#a89a6d]">
        {title}
      </p>
      <h3 className="mt-1 font-['IBM_Plex_Mono'] text-3xl font-black tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
        {value}
      </h3>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;

  return (
    <div className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] px-4 py-3 shadow-xl dark:border-[#3a352b] dark:bg-[#221F1A]">
      <p className="text-sm font-bold text-[#24322E] dark:text-[#EFE7D6]">
        {label || item?.name}
      </p>
      <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
        {formatAmount(payload[0].value)}
        {typeof item?.percent === "number" ? ` (${item.percent}%)` : ""}
      </p>
    </div>
  );
}
