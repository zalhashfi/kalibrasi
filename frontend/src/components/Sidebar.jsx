import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();

  const linkClass = (tab) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer ${
      activeTab === tab
        ? 'bg-blue-500/10 text-blue-400'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`;

  return (
    <aside className="w-[260px] bg-surface-card border-r border-white/5 p-4 flex-shrink-0 max-md:w-full max-md:border-r-0 max-md:border-b max-md:border-white/5 max-md:p-3">
      {/* Monitoring */}
      <div className="mb-6">
        <div className="text-[0.6875rem] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
          Monitoring
        </div>
        <button
          className={linkClass('sensor-data')}
          onClick={() => setActiveTab('sensor-data')}
          id="nav-sensor-data"
        >
          <span className="text-lg w-5 text-center">📊</span>
          Sensor Data
        </button>
      </div>

      {isAdmin && (
        <>
          {/* Administration */}
          <div className="mb-6">
            <div className="text-[0.6875rem] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
              Administration
            </div>
            <button
              className={linkClass('users')}
              onClick={() => setActiveTab('users')}
              id="nav-users"
            >
              <span className="text-lg w-5 text-center">👥</span>
              User Management
            </button>
            <button
              className={linkClass('devices')}
              onClick={() => setActiveTab('devices')}
              id="nav-devices"
            >
              <span className="text-lg w-5 text-center">📱</span>
              Device Management
            </button>
          </div>

          {/* Tools */}
          <div className="mb-6">
            <div className="text-[0.6875rem] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
              Tools
            </div>
            <button
              className={linkClass('export')}
              onClick={() => setActiveTab('export')}
              id="nav-export"
            >
              <span className="text-lg w-5 text-center">📤</span>
              Export CSV
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
