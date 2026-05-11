import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function ExpenseRequests({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const currentUser = auth.currentUser;

  const createRequest = async () => {
    if (!title || !amount) {
      alert("Fill all fields");
      return;
    }

    const request = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      category,
      requestedBy: currentUser.uid,
      requestedByName:
        currentUser.displayName || currentUser.email || "Unknown",
      approvals: [],
      rejections: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: arrayUnion(request),
    });

    setTitle("");
    setAmount("");
    setCategory("Food");
  };

  const approveRequest = async (request) => {
    let updatedRequest = {
      ...request,
      approvals: [...request.approvals, currentUser.uid],
    };

    const requiredVotes =
      group.approvalMode === "majority"
        ? Math.ceil(group.members.length / 2)
        : 1;

    const isApproved =
      updatedRequest.approvals.length >= requiredVotes;

    let updatedRequests = group.expenseRequests.map((r) =>
      r.id === request.id
        ? {
            ...updatedRequest,
            status: isApproved ? "approved" : "pending",
          }
        : r
    );

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: updatedRequests,
      walletBalance: isApproved
        ? group.walletBalance - request.amount
        : group.walletBalance,
      transactions: isApproved
        ? arrayUnion({
            type: "expense",
            title: request.title,
            amount: request.amount,
            category: request.category,
            user: currentUser.uid,
            createdAt: new Date().toISOString(),
          })
        : group.transactions || [],
    });
  };

  const rejectRequest = async (request) => {
    const updatedRequests = group.expenseRequests.map((r) =>
      r.id === request.id
        ? {
            ...r,
            status: "rejected",
            rejections: [...r.rejections, currentUser.uid],
          }
        : r
    );

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: updatedRequests,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-8 border border-red-100">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Expense Requests
      </h2>

      {/* CREATE REQUEST */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Expense title"
          className="p-4 rounded-2xl border border-red-100 bg-white"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="p-4 rounded-2xl border border-red-100 bg-white"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-4 rounded-2xl border border-red-100 bg-white"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Fuel</option>
          <option>Hotel</option>
          <option>Shopping</option>
        </select>

        <button
          onClick={createRequest}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold"
        >
          Request Expense
        </button>
      </div>

      {/* REQUEST LIST */}
      <div className="space-y-4">
        {(group.expenseRequests || []).length === 0 ? (
          <p className="text-slate-500">No expense requests yet.</p>
        ) : (
          group.expenseRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[#fff8f2] rounded-2xl p-5 border border-red-100"
            >
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {request.category} • {request.title}
                  </h3>

                  <p className="text-slate-500">
                    Requested by {request.requestedByName}
                  </p>

                  <p className="text-red-600 font-bold text-lg mt-2">
                    ₹{request.amount}
                  </p>

                  <p className="mt-2 text-sm">
                    Status:
                    <span className="font-bold ml-2 capitalize">
                      {request.status}
                    </span>
                  </p>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => approveRequest(request)}
                      className="px-5 py-3 bg-green-500 text-white rounded-xl font-bold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectRequest(request)}
                      className="px-5 py-3 bg-red-500 text-white rounded-xl font-bold"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
