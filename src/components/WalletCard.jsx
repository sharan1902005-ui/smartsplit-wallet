import { useNavigate } from 'react-router-dom'
import { FiUsers, FiDollarSign } from 'react-icons/fi'

export default function WalletCard({ group }) {
  const navigate = useNavigate()
  const total = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0

  return (
    <div className="wallet-card" onClick={() => navigate(`/group/${group.id}`)}>
      <div className="wallet-card-header">
        <span className="wallet-emoji">{group.emoji || '👛'}</span>
        <h3>{group.name}</h3>
      </div>
      <div className="wallet-card-stats">
        <span><FiUsers /> {group.memberCount || 0} members</span>
        <span><FiDollarSign /> ${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
