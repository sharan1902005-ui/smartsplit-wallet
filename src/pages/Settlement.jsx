import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'
import { calculateSettlements } from '../utils/settlement'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'

export default function Settlement() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'groups', id), (snap) => {
      if (snap.exists()) setGroup({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [id])

  if (!group) return <div className="page"><div className="spinner" /></div>

  const membersMap = Object.fromEntries(group.members.map((m) => [m.uid, m]))
  const transactions = calculateSettlements(
    group.expenses || [],
    Object.fromEntries(group.members.map((m) => [m.uid, m.displayName]))
  )

  return (
    <div className="page page-narrow">
      <Link to={`/group/${id}`} className="back-link"><FiArrowLeft /> Back to {group.name}</Link>
      <h2>Settlement Plan</h2>
      <p className="muted">Minimum transactions to settle all debts</p>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <span>🎉</span>
          <p>Everyone is settled up!</p>
        </div>
      ) : (
        <div className="settlement-list">
          {transactions.map((t, i) => (
            <div key={i} className="settlement-item">
              <div className="settlement-person">
                <img
                  src={membersMap[t.from]?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.fromName)}&background=ef4444&color=fff`}
                  alt={t.fromName}
                />
                <span>{t.fromName}</span>
              </div>
              <div className="settlement-arrow">
                <FiArrowRight />
                <span className="settlement-amount">${t.amount.toFixed(2)}</span>
              </div>
              <div className="settlement-person">
                <img
                  src={membersMap[t.to]?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.toName)}&background=22c55e&color=fff`}
                  alt={t.toName}
                />
                <span>{t.toName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
