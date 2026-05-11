export default function MemberCard({ member, balance }) {
  const isPositive = balance > 0
  const isNeutral = Math.abs(balance) < 0.01

  return (
    <div className="member-card">
      <img
        src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&background=6366f1&color=fff`}
        alt={member.displayName}
        className="member-avatar"
      />
      <div className="member-info">
        <span className="member-name">{member.displayName}</span>
        <span className={`member-balance ${isNeutral ? 'neutral' : isPositive ? 'positive' : 'negative'}`}>
          {isNeutral ? 'Settled up' : isPositive ? `gets back $${balance.toFixed(2)}` : `owes $${Math.abs(balance).toFixed(2)}`}
        </span>
      </div>
    </div>
  )
}
