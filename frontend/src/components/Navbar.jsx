import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-gray-900/85 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 text-lg font-extrabold text-slate-100 hover:text-white transition-colors"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-base">
            📡
          </div>
          <span>Kalibrasi</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-100">{user?.name || 'User'}</div>
            <div className="text-[0.7rem] text-slate-500 uppercase tracking-wide">
              {isAdmin ? '🛡 Admin' : '👤 User'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-sm font-bold text-white">
            {getInitials(user?.name)}
          </div>
          <button
            onClick={handleLogout}
            id="logout-btn"
            className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
