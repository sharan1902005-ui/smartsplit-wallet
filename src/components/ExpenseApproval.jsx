import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { CheckCircle, XCircle } from "lucide-react";

export default function ExpenseApproval({ group }) {
  const requests = group.expenseRequests || [];
  const currentUser = auth.currentUser;
  const isAdmin = group.adminUid === currentUser?.uid;

  const approveExpense = async (expense) => {
    try {
      if ((group.walletBalance || 0) < expense.amount) {
        alert("Not enough wallet balance");
        return;
      }

      const updatedRequests = group.expenseRequests.map((req) =>
        req.createdAt === expense.createdAt
          ? { ...req, status: "approved" }
          : req
      );

      await updateDoc(doc(db, "groups", group.id), {
        walletBalance: (group.walletBalance || 0) - Number(expense.amount),
        expenseRequests: updatedRequests,
        transactions: arrayUnion({
          type: "expense",
          amount: Number(expense.amount),
          category: expense.category || "Other",
          title: expense.title || "Expense",
          userName: expense.requestedByName || expense.userName || "User",
          createdAt: new Date().toISOString(),
        }),
      });

      alert("Expense approved");
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  const rejectExpense = async (expense) => {
    const updatedRequests = group.expenseRequests.map((req) =>
      req.createdAt === expense.createdAt
        ? { ...req, status: "rejected" }
        : req
    );

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: updatedRequests,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Expense Approval Center
      </h2>

      {requests.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((expense, index) => (
            <div
              key={index}
              className="bg-[#fff8f2] dark:bg-slate-900 border border-red-100 dark:border-slate-700 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {expense.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    {expense.category}
                  </p>

                  <p className="text-red-500 font-black text-xl mt-2">
                    ₹{expense.amount}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Requested by {expense.requestedByName}
                  </p>
                </div>

                {expense.status === "approved" ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    Approved
                  </span>
                ) : expense.status === "rejected" ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    Rejected
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                    Pending
                  </span>
                )}
              </div>

              {isAdmin && expense.status === "pending" && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => approveExpense(expense)}
                    className="flex-1 bg-green-500 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    onClick={() => rejectExpense(expense)}
                    className="flex-1 bg-red-500 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2"
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
