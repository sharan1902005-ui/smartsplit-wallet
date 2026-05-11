import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ExpenseChart({ group }) {
  const transactions = group?.transactions || [];

  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const data = [
    {
      name: "Deposits",
      value: totalDeposits,
    },
    {
      name: "Expenses",
      value: totalExpenses,
    },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6 text-white">
        Wallet Analytics
      </h2>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={140}
              dataKey="value"
              label
            >
              <Cell fill="#6366f1" />
              <Cell fill="#ef4444" />
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}