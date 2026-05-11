export default function Notifications({ group }) {
  const notifications = [];

  const transactions = group.transactions || [];
  const expenseRequests = group.expenseRequests || [];

  transactions.forEach((t) => {
    if (t.type === "deposit") {
      notifications.push(`💰 Money added: ₹${t.amount}`);
    }

    if (t.type === "expense") {
      notifications.push(`💸 Expense recorded: ${t.title} ₹${t.amount}`);
    }
  });

  expenseRequests.forEach((req) => {
    if (req.status === "pending") {
      notifications.push(`🔔 Pending approval: ${req.title} ₹${req.amount}`);
    }

    if (req.status === "approved") {
      notifications.push(`✅ Approved: ${req.title}`);
    }

    if (req.status === "rejected") {
      notifications.push(`❌ Rejected: ${req.title}`);
    }
  });

  notifications.reverse();

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        Notifications
      </h2>

      {notifications.length === 0 ? (
        <p className="text-slate-400">No notifications yet</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {notifications.map((note, index) => (
            <div
              key={index}
              className="bg-slate-800 p-4 rounded-2xl"
            >
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
