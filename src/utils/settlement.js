/**
 * Minimizes transactions to settle debts within a group.
 * @param {Array} expenses - [{ paidBy, amount, splitAmong: [uid] }]
 * @param {Object} members - { uid: displayName }
 * @returns {Array} - [{ from, to, amount }]
 */
export function calculateSettlements(expenses, members) {
  const balance = {}
  Object.keys(members).forEach((uid) => (balance[uid] = 0))

  expenses.forEach(({ paidBy, amount, splitAmong }) => {
    const share = amount / splitAmong.length
    balance[paidBy] = (balance[paidBy] || 0) + amount
    splitAmong.forEach((uid) => {
      balance[uid] = (balance[uid] || 0) - share
    })
  })

  const creditors = []
  const debtors = []

  Object.entries(balance).forEach(([uid, bal]) => {
    if (bal > 0.01) creditors.push({ uid, amount: bal })
    else if (bal < -0.01) debtors.push({ uid, amount: -bal })
  })

  const transactions = []

  while (creditors.length && debtors.length) {
    const creditor = creditors[0]
    const debtor = debtors[0]
    const settled = Math.min(creditor.amount, debtor.amount)

    transactions.push({
      from: debtor.uid,
      fromName: members[debtor.uid],
      to: creditor.uid,
      toName: members[creditor.uid],
      amount: parseFloat(settled.toFixed(2)),
    })

    creditor.amount -= settled
    debtor.amount -= settled

    if (creditor.amount < 0.01) creditors.shift()
    if (debtor.amount < 0.01) debtors.shift()
  }

  return transactions
}
