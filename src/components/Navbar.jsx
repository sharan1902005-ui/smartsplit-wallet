import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'
import { FiLogOut, FiHome } from 'react-icons/fi'

export default function Navbar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="nav-brand">
        💸 SmartSplit
      </Link>
      {user && (
        <div className="nav-actions">
          <Link to="/dashboard" className="nav-icon-btn" title="Dashboard">
            <FiHome />
          </Link>
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="avatar" className="nav-avatar" />
          <button onClick={handleLogout} className="nav-icon-btn" title="Logout">
            <FiLogOut />
          </button>
        </div>
      )}
    </nav>
  )
}
