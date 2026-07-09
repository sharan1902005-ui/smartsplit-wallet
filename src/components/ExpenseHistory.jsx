import { Receipt } from "lucide-react";
import { cleanDisplayName, getMemberName } from "../utils/memberDisplay";

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
  const membersById = Object.fromEntries(
    (group?.members || []).map((member) => [member.uid, member])
  );

  const getSplitLabel = (expense) => {
    if (!expense.splitMembers?.length) return null;

    const names = expense.splitMembers
      .map((uid) => getMemberName(membersById[uid] || { name: uid }))
      .join(", ");

    return `Split with ${names} - Rs. ${expense.sharePerPerson} each`;
  };

  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl p-8 border border-[#C7B98F] dark:border-[#3a352b] mt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md">
          <Receipt size={24} />
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#24322E] dark:text-[#EFE7D6]">
            Expense History
          </h2>

          <p className="text-[#6b6350] dark:text-[#a89a6d]">
            All recorded group expenses
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md p-8 text-center">
          <p className="text-[#6b6350] dark:text-[#a89a6d] text-lg">
            No expenses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map(
            (expense, index) => (
              <div
                key={index}
                className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md p-5 border border-[#C7B98F] dark:border-[#3a352b] flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-xl text-[#24322E] dark:text-[#EFE7D6]">
                    {expense.title ||
                      "Expense"}
                  </h3>

                  <p className="text-[#6b6350] dark:text-[#a89a6d]">
                    {
                      expense.category
                    }{" "}
                    • by{" "}
                    {cleanDisplayName(expense.userName, "Member")}
                  </p>

                  {getSplitLabel(expense) && (
                    <p className="text-[#6b6350] dark:text-[#a89a6d] text-sm mt-1">
                      {getSplitLabel(expense)}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[#B23A2E] font-black text-2xl">
                    ₹
                    {
                      expense.amount
                    }
                  </p>

                  <p className="text-xs text-[#a89a6d]">
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

