import { useState } from 'react'
import { db } from '../firebase/config'
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { FiX } from 'react-icons/fi'

export default function ExpenseModal({ group, currentUser, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: currentUser.uid,
    splitAmong: group.members.map((m) => m.uid),
  })
  const [loading, setLoading] = useState(false)

  const toggleMember = (uid) => {
    setForm((f) => ({
      ...f,
      splitAmong: f.splitAmong.includes(uid)
        ? f.splitAmong.filter((id) => id !== uid)
        : [...f.splitAmong, uid],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount || form.splitAmong.length === 0) return
    setLoading(true)
    const expense = {
      id: Date.now().toString(),
      description: form.description,
      amount: parseFloat(form.amount),
      paidBy: form.paidBy,
      splitAmong: form.splitAmong,
      createdAt: Timestamp.now(),
    }
    await updateDoc(doc(db, 'groups', group.id), {
      expenses: arrayUnion(expense),
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Expense</h3>
          <button className="icon-btn" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <label>Paid by</label>
          <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}>
            {group.members.map((m) => (
              <option key={m.uid} value={m.uid}>{m.displayName}</option>
            ))}
          </select>
          <label>Split among</label>
          <div className="checkbox-group">
            {group.members.map((m) => (
              <label key={m.uid} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.splitAmong.includes(m.uid)}
                  onChange={() => toggleMember(m.uid)}
                />
                {m.displayName}
              </label>
            ))}
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
