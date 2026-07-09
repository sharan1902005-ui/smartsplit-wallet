import { useState } from "react";
import {
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import {
  approveExpenseRequest,
  rejectExpenseRequest,
  submitExpense,
  voteExpenseRequest,
} from "../utils/expenseWorkflow";

export default function ExpenseRequests({ group }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState("Food");

  const addExpense = async () => {
    if (!title || !amount) {
      alert("Fill all fields");
      return;
    }

    const expenseAmount =
      Number(amount);

    try {
      const groupRef = doc(
        db,
        "groups",
        group.id
      );

      const result = await submitExpense(
        groupRef,
        group,
        {
          title,
          amount: expenseAmount,
          category,
          source: "expense-form",
        },
        auth.currentUser
      );

      setTitle("");
      setAmount("");
      setCategory("Food");

      alert(
        result.status === "pending"
          ? "Expense submitted for approval"
          : "Expense added successfully"
      );
    } catch (err) {
      console.error(err);
      alert(
        err.message || "Failed to add expense"
      );
    }
  };

  const pendingRequests = (group.expenseRequests || []).filter(
    (request) => request.status === "pending"
  );
  const decidedRequests = (group.expenseRequests || [])
    .filter((request) => request.status !== "pending")
    .slice(-3)
    .reverse();
  const currentUser = auth.currentUser;
  const isAdmin = group.adminUid === currentUser?.uid;
  const currentUid = currentUser?.uid;
  const groupRef = doc(db, "groups", group.id);

  const handleApprove = async (request) => {
    try {
      await approveExpenseRequest(groupRef, request.id, currentUser);
      alert("Expense approved");
    } catch (error) {
      alert(error.message || "Approval failed");
    }
  };

  const handleReject = async (request) => {
    try {
      await rejectExpenseRequest(groupRef, request.id, currentUser);
      alert("Expense rejected");
    } catch (error) {
      alert(error.message || "Rejection failed");
    }
  };

  const handleVote = async (request, vote) => {
    try {
      const result = await voteExpenseRequest(groupRef, request.id, currentUser, vote);
      alert(
        result.status === "pending"
          ? "Vote saved"
          : `Request ${result.status}`
      );
    } catch (error) {
      alert(error.message || "Vote failed");
    }
  };

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Add Expense
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Record a shared wallet spend
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#171512]"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          className="p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#171512]"
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          className="p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#171512]"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Fuel</option>
          <option>Shopping</option>
          <option>Hotel</option>
        </select>

        <button
          onClick={addExpense}
          className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] rounded-md font-bold w-full md:w-auto p-4 shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
        >
          Add Expense
        </button>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-['Big_Shoulders_Display'] text-2xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
              Pending Approvals
            </h3>
            <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
              Approval mode: {group.approvalMode || "free"}
            </p>
          </div>

          {pendingRequests.length > 0 && (
            <span className="rounded-md border border-[#D9A441] px-3 py-1 font-['IBM_Plex_Mono'] text-sm font-bold text-[#D9A441]">
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#C7B98F] bg-[#EAE1CC] p-5 text-sm text-[#6b6350] dark:border-[#3a352b] dark:bg-[#171512] dark:text-[#a89a6d]">
            No expense approvals are waiting.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                group={group}
                currentUid={currentUid}
                isAdmin={isAdmin}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
                onVote={(vote) => handleVote(request, vote)}
              />
            ))}
          </div>
        )}

        {decidedRequests.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-['Big_Shoulders_Display'] text-xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
              Recent Decisions
            </h3>
            <div className="space-y-2">
              {decidedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-3 text-sm dark:border-[#3a352b] dark:bg-[#171512]"
                >
                  <span>
                    {request.title} - Rs. {request.amount}
                  </span>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RequestCard({
  request,
  group,
  currentUid,
  isAdmin,
  onApprove,
  onReject,
  onVote,
}) {
  const mode = request.approvalMode || group.approvalMode || "free";
  const votes = request.votes || [];
  const approveVotes = votes.filter((entry) => entry.vote === "approve").length;
  const rejectVotes = votes.filter((entry) => entry.vote === "reject").length;
  const currentVote = votes.find((entry) => entry.uid === currentUid)?.vote;
  const isVoteMode = ["majority", "everyone"].includes(mode);
  const canAdminAct = ["admin", "threshold"].includes(mode) && isAdmin;

  return (
    <div className="rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-4 dark:border-[#3a352b] dark:bg-[#171512]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
              {request.title}
            </h4>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 text-sm text-[#6b6350] dark:text-[#a89a6d]">
            {request.category || "Other"} by {request.requestedByName || request.userName || "Member"}
          </p>
          <p className="mt-2 font-['IBM_Plex_Mono'] text-xl font-black text-[#B23A2E]">
            Rs. {Number(request.amount || 0).toLocaleString()}
          </p>
        </div>

        {canAdminAct && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="rounded-md bg-[#3F6B4F] px-4 py-2 font-bold text-[#F8F4EA]"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="rounded-md bg-[#B23A2E] px-4 py-2 font-bold text-[#F8F4EA]"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {isVoteMode && (
        <div className="mt-4 rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-3 dark:border-[#3a352b] dark:bg-[#221F1A]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-['IBM_Plex_Mono'] text-sm text-[#6b6350] dark:text-[#a89a6d]">
              {approveVotes} of {(group.members || []).length} approved · {rejectVotes} rejected
            </p>
            {currentVote && (
              <span className="rounded-md border border-[#D9A441] px-3 py-1 text-xs font-bold uppercase text-[#D9A441]">
                You voted: {currentVote}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onVote("approve")}
              className="flex-1 rounded-md bg-[#3F6B4F] px-4 py-2 font-bold text-[#F8F4EA]"
            >
              Vote Approve
            </button>
            <button
              onClick={() => onVote("reject")}
              className="flex-1 rounded-md bg-[#B23A2E] px-4 py-2 font-bold text-[#F8F4EA]"
            >
              Vote Reject
            </button>
          </div>
        </div>
      )}

      {!canAdminAct && !isVoteMode && (
        <p className="mt-3 text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Waiting for the group admin.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    pending: "border-[#D9A441] text-[#D9A441]",
    approved: "border-[#3F6B4F] text-[#3F6B4F]",
    rejected: "border-[#B23A2E] text-[#B23A2E]",
  }[status] || "border-[#C7B98F] text-[#6b6350]";

  return (
    <span className={`-rotate-6 rounded-md border px-3 py-1 text-xs font-bold uppercase ${classes}`}>
      {status || "pending"}
    </span>
  );
}

