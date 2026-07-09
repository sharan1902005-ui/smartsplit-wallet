import { runTransaction } from "firebase/firestore";
import { cleanDisplayName } from "./memberDisplay";

const uuid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const now = () => new Date().toISOString();

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

const memberName = (user) =>
  cleanDisplayName(user?.displayName || user?.email, "Member");

const requestName = (request) =>
  cleanDisplayName(request.requestedByName || request.userName, "Member");

const isMember = (group, uid) =>
  (group.members || []).some((member) => member.uid === uid);

const toTransaction = (request, extra = {}) => ({
  ...request.expenseData,
  ...extra,
  type: "expense",
  title: request.title,
  amount: Number(request.amount),
  category: request.category || "Other",
  user: request.requestedBy,
  userId: request.requestedBy,
  userName: requestName(request),
  approvedFromRequestId: request.id,
  createdAt: now(),
});

const getPendingRequest = (requests, requestId) =>
  requests.find((request) => request.id === requestId && request.status === "pending");

const appendTransaction = (group, request, activityText, requestUpdates = {}) => {
  const walletBalance = Number(group.walletBalance || 0);
  const amount = Number(request.amount || 0);

  if (walletBalance < amount) {
    throw new Error("Not enough wallet balance");
  }

  return {
    walletBalance: walletBalance - amount,
    transactions: [...(group.transactions || []), toTransaction(request)],
    expenseRequests: (group.expenseRequests || []).map((item) =>
      item.id === request.id
        ? {
            ...item,
            ...requestUpdates,
            status: "approved",
            resolvedAt: now(),
          }
        : item
    ),
    activityTimeline: [
      ...(group.activityTimeline || []),
      {
        type: "expense_approved",
        text: activityText,
        createdAt: now(),
      },
    ],
  };
};

const rejectRequest = (group, request, activityText, requestUpdates = {}) => ({
  expenseRequests: (group.expenseRequests || []).map((item) =>
    item.id === request.id
      ? {
          ...item,
          ...requestUpdates,
          status: "rejected",
          resolvedAt: now(),
        }
      : item
  ),
  activityTimeline: [
    ...(group.activityTimeline || []),
    {
      type: "expense_rejected",
      text: activityText,
      createdAt: now(),
    },
  ],
});

export async function submitExpense(groupRef, group, expenseData, currentUser) {
  if (!currentUser) {
    throw new Error("Please log in again");
  }

  const amount = Number(expenseData.amount);
  const title = String(expenseData.title || "").trim();

  if (!title || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid expense title and amount");
  }

  const createdAt = now();
  const requesterName = memberName(currentUser);

  return runTransaction(groupRef.firestore, async (transaction) => {
    const snapshot = await transaction.get(groupRef);

    if (!snapshot.exists()) {
      throw new Error("Group not found");
    }

    const latestGroup = { id: snapshot.id, ...snapshot.data() };
    const approvalMode = latestGroup.approvalMode || group?.approvalMode || "free";
    const threshold = Number(latestGroup.approvalThreshold ?? group?.approvalThreshold ?? 500);
    const shouldAutoApprove =
      approvalMode === "free" ||
      (approvalMode === "threshold" && amount <= threshold);

    if (shouldAutoApprove) {
      const walletBalance = Number(latestGroup.walletBalance || 0);

      if (walletBalance < amount) {
        throw new Error("Not enough wallet balance");
      }

      transaction.update(groupRef, {
        walletBalance: walletBalance - amount,
        transactions: [
          ...(latestGroup.transactions || []),
          {
            ...expenseData,
            type: "expense",
            title,
            amount,
            category: expenseData.category || "Other",
            user: currentUser.uid,
            userId: currentUser.uid,
            userName: requesterName,
            createdAt,
          },
        ],
        activityTimeline: [
          ...(latestGroup.activityTimeline || []),
          {
            type: "expense",
            text: `${requesterName} added ${money(amount)} for ${title}`,
            createdAt,
          },
        ],
      });

      return { status: "approved" };
    }

    const request = {
      id: uuid(),
      title,
      amount,
      category: expenseData.category || "Other",
      requestedBy: currentUser.uid,
      requestedByName: requesterName,
      status: "pending",
      approvalMode,
      votes: ["majority", "everyone"].includes(approvalMode) ? [] : undefined,
      expenseData: {
        ...expenseData,
        title,
        amount,
        category: expenseData.category || "Other",
      },
      createdAt,
    };

    const reason =
      approvalMode === "threshold"
        ? "pending admin approval"
        : approvalMode === "admin"
        ? "pending admin approval"
        : approvalMode === "majority"
        ? "pending majority approval"
        : "pending everyone approval";

    transaction.update(groupRef, {
      expenseRequests: [...(latestGroup.expenseRequests || []), request],
      activityTimeline: [
        ...(latestGroup.activityTimeline || []),
        {
          type: "request",
          text: `${requesterName} requested ${money(amount)} for ${title} (${reason})`,
          createdAt,
        },
      ],
    });

    return { status: "pending", requestId: request.id };
  });
}

export async function approveExpenseRequest(groupRef, requestId, currentUser) {
  if (!currentUser) throw new Error("Please log in again");

  return runTransaction(groupRef.firestore, async (transaction) => {
    const snapshot = await transaction.get(groupRef);
    const group = { id: snapshot.id, ...snapshot.data() };

    if (group.adminUid !== currentUser.uid) {
      throw new Error("Only the group admin can approve this request");
    }

    const request = getPendingRequest(group.expenseRequests || [], requestId);
    if (!request) throw new Error("Pending request not found");

    const adminName = memberName(currentUser);
    const text = `${adminName} approved ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} expense`;

    transaction.update(groupRef, appendTransaction(group, request, text, {
      approvedBy: currentUser.uid,
    }));

    return { status: "approved" };
  });
}

export async function rejectExpenseRequest(groupRef, requestId, currentUser) {
  if (!currentUser) throw new Error("Please log in again");

  return runTransaction(groupRef.firestore, async (transaction) => {
    const snapshot = await transaction.get(groupRef);
    const group = { id: snapshot.id, ...snapshot.data() };

    if (group.adminUid !== currentUser.uid) {
      throw new Error("Only the group admin can reject this request");
    }

    const request = getPendingRequest(group.expenseRequests || [], requestId);
    if (!request) throw new Error("Pending request not found");

    const adminName = memberName(currentUser);
    const text = `${adminName} rejected ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} expense`;

    transaction.update(groupRef, rejectRequest(group, request, text, {
      rejectedBy: currentUser.uid,
    }));

    return { status: "rejected" };
  });
}

export async function voteExpenseRequest(groupRef, requestId, currentUser, vote) {
  if (!currentUser) throw new Error("Please log in again");

  return runTransaction(groupRef.firestore, async (transaction) => {
    const snapshot = await transaction.get(groupRef);
    const group = { id: snapshot.id, ...snapshot.data() };

    if (!isMember(group, currentUser.uid)) {
      throw new Error("Only group members can vote");
    }

    const request = getPendingRequest(group.expenseRequests || [], requestId);
    if (!request) throw new Error("Pending request not found");

    if (!["majority", "everyone"].includes(request.approvalMode || group.approvalMode)) {
      throw new Error("This request is not vote-based");
    }

    const votes = [
      ...(request.votes || []).filter((entry) => entry.uid !== currentUser.uid),
      {
        uid: currentUser.uid,
        vote,
        votedAt: now(),
      },
    ];

    const membersCount = (group.members || []).length;
    const approveVotes = votes.filter((entry) => entry.vote === "approve").length;
    const rejectVotes = votes.filter((entry) => entry.vote === "reject").length;
    const mode = request.approvalMode || group.approvalMode;
    const voterName = memberName(currentUser);
    const voteActivity = {
      type: "expense_vote",
      text: `${voterName} voted ${vote} on ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} request`,
      createdAt: now(),
    };

    const requestWithVotes = { ...request, votes };
    const groupWithVote = {
      ...group,
      activityTimeline: [...(group.activityTimeline || []), voteActivity],
      expenseRequests: (group.expenseRequests || []).map((item) =>
        item.id === request.id ? requestWithVotes : item
      ),
    };

    if (mode === "majority" && approveVotes > membersCount / 2) {
      const text = `Majority approved ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} request`;
      transaction.update(groupRef, appendTransaction(groupWithVote, requestWithVotes, text, {
        votes,
        resolvedBy: "majority",
      }));
      return { status: "approved" };
    }

    if (mode === "majority" && rejectVotes >= membersCount / 2) {
      const text = `Majority rejected ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} request`;
      transaction.update(groupRef, rejectRequest(groupWithVote, requestWithVotes, text, {
        votes,
        resolvedBy: "majority",
      }));
      return { status: "rejected" };
    }

    if (mode === "everyone" && rejectVotes > 0) {
      const text = `${voterName} rejected ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} request`;
      transaction.update(groupRef, rejectRequest(groupWithVote, requestWithVotes, text, {
        votes,
        resolvedBy: "everyone",
      }));
      return { status: "rejected" };
    }

    if (mode === "everyone" && approveVotes === membersCount) {
      const text = `Everyone approved ${requestName(request)}'s ${money(request.amount)} ${request.category || request.title} request`;
      transaction.update(groupRef, appendTransaction(groupWithVote, requestWithVotes, text, {
        votes,
        resolvedBy: "everyone",
      }));
      return { status: "approved" };
    }

    transaction.update(groupRef, {
      expenseRequests: groupWithVote.expenseRequests,
      activityTimeline: groupWithVote.activityTimeline,
    });

    return { status: "pending" };
  });
}
