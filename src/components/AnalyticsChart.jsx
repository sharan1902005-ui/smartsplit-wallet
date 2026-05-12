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
} from "recharts";
import {
  TrendingUp,
  Trophy,
  Brain,
} from "lucide-react";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
];

export default function AnalyticsChart({
  group,
}) {
  const transactions =
    group?.transactions || [];

  const expenseTransactions =
    transactions.filter(
      (tx) => tx.type === "expense"
    );

  const depositTransactions =
    transactions.filter(
      (tx) => tx.type === "deposit"
    );

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyMap = {};
  const categoryMap = {};
  const contributorMap = {};

  expenseTransactions.forEach((tx) => {
    const date = tx.createdAt
      ? new Date(tx.createdAt)
      : new Date();

    const month =
      monthNames[date.getMonth()];

    monthlyMap[month] =
      (monthlyMap[month] || 0) +
      (tx.amount || 0);

    const category =
      tx.category || "Other";

    categoryMap[category] =
      (categoryMap[category] || 0) +
      (tx.amount || 0);
  });

  depositTransactions.forEach((tx) => {
    const user =
      tx.userName || "Unknown";

    contributorMap[user] =
      (contributorMap[user] || 0) +
      (tx.amount || 0);
  });

  const monthlyData = monthNames.map(
    (month) => ({
      month,
      amount: monthlyMap[month] || 0,
    })
  );

  const categoryData =
    Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

  const contributorData =
    Object.entries(
      contributorMap
    ).sort((a, b) => b[1] - a[1]);

  const totalExpenses =
    expenseTransactions.reduce(
      (sum, tx) =>
        sum + (tx.amount || 0),
      0
    );

  const topCategory =
    categoryData.sort(
      (a, b) => b.value - a.value
    )[0];

  const aiInsight = topCategory
    ? `${topCategory.name} spending is ${Math.round(
        (topCategory.value /
          totalExpenses) *
          100
      )}% of total expenses.`
    : "No expense insights yet.";

  return (
    <div className="space-y-8">
      {/* Top Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          icon={<TrendingUp />}
          title="Total Expenses"
          value={`₹${totalExpenses}`}
        />

        <StatCard
          icon={<Trophy />}
          title="Top Category"
          value={
            topCategory?.name || "None"
          }
        />

        <StatCard
          icon={<Brain />}
          title="AI Insight"
          value="Smart Analysis"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Monthly Spending
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Expense trend over time
          </p>

          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={monthlyData}
              >
                <XAxis
                  dataKey="month"
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="amount"
                  radius={[10, 10, 0, 0]}
                  fill="#ef4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Spending by Category
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Expense distribution
          </p>

          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    categoryData
                  }
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {categoryData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
          Contributor Leaderboard
        </h2>

        <div className="space-y-4">
          {contributorData.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No deposits yet
            </p>
          ) : (
            contributorData.map(
              (
                [name, amount],
                index
              ) => (
                <div
                  key={index}
                  className="bg-[#fff8f2] dark:bg-slate-900 border border-red-100 dark:border-slate-700 rounded-2xl p-5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      #{index + 1}{" "}
                      {name}
                    </p>
                  </div>

                  <p className="text-red-500 font-black text-xl">
                    ₹{amount}
                  </p>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-black mb-4">
          Smart AI Insight
        </h2>

        <p className="text-lg leading-relaxed">
          {aiInsight}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-6">
      <div className="text-red-500 mb-4">
        {icon}
      </div>

      <p className="text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
        {value}
      </h3>
    </div>
  );
}
