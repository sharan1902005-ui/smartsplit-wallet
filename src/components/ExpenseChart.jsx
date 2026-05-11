import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ExpenseChart({ group }) {
  const transactions = group.transactions || [];

  const expenses = transactions.filter(
    (tx) => tx.type === "expense"
  );

  const categoryTotals = {};

  expenses.forEach((expense) => {
    const category = expense.category || "Misc";

    categoryTotals[category] =
      (categoryTotals[category] || 0) + expense.amount;
  });

  const data = Object.entries(categoryTotals).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-slate-500">
        No expense analytics yet.
      </div>
    );
  }

  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            outerRadius={120}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
