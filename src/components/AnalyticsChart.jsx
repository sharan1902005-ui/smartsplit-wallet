import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";

export default function AnalyticsChart({ groups }) {
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

  groups.forEach((group) => {
    (group.transactions || []).forEach((tx) => {
      if (tx.type !== "expense") return;

      const date = tx.createdAt
        ? new Date(tx.createdAt)
        : new Date();

      const month =
        monthNames[date.getMonth()];

      monthlyMap[month] =
        (monthlyMap[month] || 0) +
        (tx.amount || 0);
    });
  });

  const chartData = monthNames.map((m) => ({
    month: m,
    amount: monthlyMap[m] || 0,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-black">
          Monthly Shared Spending
        </h2>
        <p className="text-slate-500 mt-2">
          Expense trends across all groups
        </p>
      </div>

      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="walletGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#ef4444"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="#f97316"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              opacity={0.15}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [
                `₹${value}`,
                "Expenses",
              ]}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#ef4444"
              strokeWidth={4}
              fill="url(#walletGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
