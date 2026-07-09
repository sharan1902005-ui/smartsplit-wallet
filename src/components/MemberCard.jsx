import MemberAvatar from "./MemberAvatar"
import { getMemberName } from "../utils/memberDisplay"

export default function MemberCard({ member, balance }) {
  const isPositive = balance > 0
  const isNeutral = Math.abs(balance) < 0.01
  const memberName = getMemberName(member)

  return (
    <div className="member-card">
      <MemberAvatar
        member={member}
        name={memberName}
        className="member-avatar"
      />
      <div className="member-info">
        <span className="member-name">{memberName}</span>
        <span className={`member-balance ${isNeutral ? 'neutral' : isPositive ? 'positive' : 'negative'}`}>
          {isNeutral ? 'Settled up' : isPositive ? `gets back $${balance.toFixed(2)}` : `owes $${Math.abs(balance).toFixed(2)}`}
        </span>
      </div>
    </div>
  )
}
