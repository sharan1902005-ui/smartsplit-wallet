import { doc } from "firebase/firestore";
import { CheckCircle, XCircle } from "lucide-react";
import { auth, db } from "../firebase/config";
import {
  approveExpenseRequest,
  rejectExpenseRequest,
} from "../utils/expenseWorkflow";

export default function ExpenseApproval({ group }) {
  const requests = group.expenseRequests || [];
  const currentUser = auth.currentUser;
  const isAdmin = group.adminUid === currentUser?.uid;

  const approveExpense = async (expense) => {
    try {
      await approveExpenseRequest(doc(db, "groups", group.id), expense.id, currentUser);
      alert("Expense approved");
    } catch (error) {
      console.error(error);
      alert(error.message || "Approval failed");
    }
  };

  const rejectExpense = async (expense) => {
    try {
      await rejectExpenseRequest(doc(db, "groups", group.id), expense.id, currentUser);
      alert("Expense rejected");
    } catch (error) {
      console.error(error);
      alert(error.message || "Rejection failed");
    }
  };

  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl border border-[#C7B98F] dark:border-[#3a352b] p-8">
      <h2 className="text-3xl font-bold text-[#B23A2E] mb-6">
        Expense Approval Center
      </h2>

      {requests.length === 0 ? (
        <p className="text-[#6b6350] dark:text-[#a89a6d]">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((expense, index) => (
            <div
              key={expense.id || index}
              className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
                    {expense.title}
                  </h3>

                  <p className="text-[#6b6350] dark:text-[#a89a6d]">
                    {expense.category}
                  </p>

                  <p className="text-[#B23A2E] font-black text-xl mt-2">
                    Rs. {expense.amount}
                  </p>

                  <p className="text-sm text-[#a89a6d] mt-2">
                    Requested by {expense.requestedByName}
                  </p>
                </div>

                <span className="-rotate-6 rounded-md border border-[#D9A441] px-3 py-1 text-xs font-bold uppercase text-[#D9A441]">
                  {expense.status || "pending"}
                </span>
              </div>

              {isAdmin && expense.status === "pending" && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => approveExpense(expense)}
                    className="flex-1 bg-[#3F6B4F] text-[#F8F4EA] p-3 rounded-md font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    onClick={() => rejectExpense(expense)}
                    className="flex-1 bg-[#B23A2E] text-[#F8F4EA] p-3 rounded-md font-bold flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
