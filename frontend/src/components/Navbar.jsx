import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const {logout,user} =useAuth()
  const navigate=useNavigate()

  function handleLogout(){
    logout()
    navigate("/login")
  }

  console.log("Navbar user:",user)

  return (
    <nav className="bg-[#0F1424] border-b border-[#242B45] px-6 py-3 flex items-center justify-between">

      <Link to="/" className="font-display text-lg font-semibold text-[#E4E7F2]">
        Devhub
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-[#8B90A8]">@{user.username}</span>
        )}
      </div>

      {user && (
        <button onClick={handleLogout} className='text-sm text-[#8B90A8] hover:text-[#E4E7F2] transition-colors'>Logout</button>
      )}

    </nav>
  )
}

export default Navbar