import { Receipt } from "lucide-react";

export default function ExpenseHistory({ group }) {
  const expenses =
    (group?.transactions || [])
      .filter(
        (txn) => txn.type === "expense"
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-red-100 dark:border-slate-700 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl">
          <Receipt size={24} />
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Expense History
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            All recorded group expenses
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No expenses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map(
            (expense, index) => (
              <div
                key={index}
                className="bg-[#fff8f2] dark:bg-slate-900 rounded-2xl p-5 border border-red-100 dark:border-slate-700 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                    {expense.title ||
                      "Expense"}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    {
                      expense.category
                    }{" "}
                    • by{" "}
                    {expense.userName ||
                      "Member"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-red-500 font-black text-2xl">
                    ₹
                    {
                      expense.amount
                    }
                  </p>

                  <p className="text-xs text-slate-400">
                    {new Date(
                      expense.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
