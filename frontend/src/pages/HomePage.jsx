import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { publicDevicesApi, sensorDataApi } from '../services/api';

export default function HomePage() {
  const { isDark, toggleTheme } = useTheme();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0 });
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch public device list
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      try {
        const result = await publicDevicesApi.getAll();
        setDevices(result.data || []);
      } catch (err) {
        setError('Failed to load device list');
      } finally {
        setDevicesLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // Fetch sensor data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (selectedDevice) {
        const result = await sensorDataApi.getByDevice(selectedDevice, { limit });
        setSensorData(result.data || []);
        setMeta(result.meta || { total: 0 });
        setDeviceInfo(result.device || null);
      } else {
        const result = await sensorDataApi.getAll({ limit });
        setSensorData(result.data || []);
        setMeta(result.meta || { total: 0 });
        setDeviceInfo(null);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load sensor data');
      setSensorData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDevice, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const renderPayload = (payload) => {
    if (typeof payload === 'object') {
      return Object.entries(payload).map(([key, val]) => (
        <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-default mr-2 mb-1">
          <span className="text-text-muted text-xs">{key}</span>
          <span className="text-accent-cyan font-semibold text-sm">{String(val)}</span>
        </span>
      ));
    }
    return JSON.stringify(payload);
  };

  const selectClass =
    'px-4 py-2.5 bg-surface-input border border-border-default rounded-lg text-text-primary text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%2394a3b8%27%20d=%27M6%208L1%203h10z%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] pr-10 cursor-pointer';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-blue-500 -top-[200px] -right-[200px] animate-float" />
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-cyan-400 -bottom-[200px] -left-[200px] animate-float-delayed" />
      </div>

      {/* Navbar */}
      <nav className="bg-nav-bg backdrop-blur-xl border-b border-nav-border sticky top-0 z-50 shadow-sm" id="public-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-text-primary hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-base">
              📡
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Kalibrasi</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle"
            className="w-10 h-10 rounded-xl bg-surface-card border border-border-default flex items-center justify-center text-lg hover:bg-surface-card-hover hover:border-border-hover transition-all duration-200 active:scale-90 cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-[1.75rem] font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
            📊 Monitoring Sensor Data
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Real-time sensor data monitoring dashboard
          </p>
        </header>

        {/* Device Cards - Mobile-first horizontal scroll */}
        {!devicesLoading && devices.length > 0 && (
          <div className="mb-6" id="device-selector-section">
            <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">
              Pilih Device
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
              {/* All Devices card */}
              <button
                onClick={() => setSelectedDevice('')}
                className={`flex-shrink-0 snap-start px-4 sm:px-5 py-3 sm:py-4 rounded-xl border text-left transition-all duration-200 min-w-[160px] sm:min-w-[200px] cursor-pointer ${
                  !selectedDevice
                    ? 'bg-badge-blue-bg border-blue-500/40 shadow-[0_0_15px_var(--color-card-glow)]'
                    : 'bg-surface-card border-border-default hover:border-border-hover hover:bg-surface-card-hover'
                }`}
                id="device-card-all"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-lg">🌐</span>
                  <span className={`text-sm font-bold ${!selectedDevice ? 'text-badge-blue-text' : 'text-text-primary'}`}>Semua Device</span>
                </div>
                <span className="text-xs text-text-muted">{devices.length} device terdaftar</span>
              </button>

              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDevice(String(d.id))}
                  className={`flex-shrink-0 snap-start px-4 sm:px-5 py-3 sm:py-4 rounded-xl border text-left transition-all duration-200 min-w-[160px] sm:min-w-[200px] cursor-pointer ${
                    selectedDevice === String(d.id)
                      ? 'bg-badge-blue-bg border-blue-500/40 shadow-[0_0_15px_var(--color-card-glow)]'
                      : 'bg-surface-card border-border-default hover:border-border-hover hover:bg-surface-card-hover'
                  }`}
                  id={`device-card-${d.id}`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-lg">📱</span>
                    <span className={`text-sm font-bold truncate ${selectedDevice === String(d.id) ? 'text-badge-blue-text' : 'text-text-primary'}`}>
                      {d.name}
                    </span>
                  </div>
                  {d.description && (
                    <span className="text-xs text-text-muted line-clamp-1 block">{d.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls Row */}
        <div className="flex items-end gap-3 sm:gap-4 mb-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Data Limit</label>
            <select
              className={selectClass}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              id="limit-select"
            >
              <option value={10}>10 data</option>
              <option value={25}>25 data</option>
              <option value={50}>50 data</option>
              <option value={100}>100 data</option>
              <option value={250}>250 data</option>
              <option value={500}>500 data</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            id="refresh-btn"
            className="px-4 py-2.5 bg-surface-elevated border border-border-default rounded-lg text-text-primary text-sm font-semibold hover:bg-surface-card-hover hover:border-border-hover transition-all duration-200 active:scale-95"
          >
            🔄 Refresh
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            id="auto-refresh-btn"
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
              autoRefresh
                ? 'bg-badge-green-bg border border-badge-green-border text-badge-green-text'
                : 'bg-surface-elevated border border-border-default text-text-secondary hover:bg-surface-card-hover'
            }`}
          >
            {autoRefresh ? '⏸ Auto: ON' : '▶ Auto: OFF'}
          </button>

          {lastUpdated && (
            <span className="text-xs text-text-dim ml-auto hidden sm:block">
              Terakhir update: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
        </div>

        {/* Active Device Info */}
        {deviceInfo && selectedDevice && (
          <div className="bg-surface-card border border-border-default border-l-[3px] border-l-blue-500 rounded-xl p-4 mb-6 animate-slide-down">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span className="text-2xl">📱</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-text-primary truncate">{deviceInfo.name}</h3>
                {deviceInfo.description && (
                  <p className="text-text-muted text-sm truncate">{deviceInfo.description}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-badge-cyan-bg text-badge-cyan-text border border-badge-cyan-border whitespace-nowrap">
                Total: {meta.total} records
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 mb-4 animate-slide-down bg-badge-red-bg text-badge-red-text border border-badge-red-border">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Records', value: meta.total || 0, icon: '📈' },
            { label: 'Showing', value: sensorData.length, icon: '📋' },
            { label: 'Devices', value: devices.length, icon: '📡' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden bg-surface-card border border-border-default rounded-xl p-4 sm:p-5 transition-all duration-200 hover:border-border-hover hover:shadow-[0_0_20px_var(--color-card-glow)] group"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide text-text-muted mb-1 sm:mb-2">{stat.label}</div>
              <div className="text-xl sm:text-3xl font-extrabold text-text-primary">{stat.value}</div>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xl sm:text-2xl opacity-30">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Data Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-text-muted text-sm gap-3">
            <div className="w-5 h-5 border-2 border-border-default border-t-blue-500 rounded-full animate-spin" />
            Loading sensor data...
          </div>
        ) : sensorData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <div className="text-lg font-semibold text-text-secondary mb-2">No Data Found</div>
            <div className="text-text-muted text-sm max-w-[360px]">
              {selectedDevice ? 'Belum ada data sensor untuk device ini.' : 'Belum ada data sensor yang tercatat.'}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-border-default">
              <table className="w-full border-collapse text-sm" id="sensor-data-table">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-default whitespace-nowrap">ID</th>
                    {!selectedDevice && (
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-default whitespace-nowrap">Device</th>
                    )}
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-default whitespace-nowrap">Payload</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-default whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.map((item) => {
                    const deviceName = devices.find(d => d.id === item.deviceId)?.name;
                    return (
                      <tr key={item.id} className="transition-colors duration-150 hover:bg-badge-blue-bg border-b border-border-subtle last:border-b-0">
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-badge-blue-bg text-badge-blue-text border border-badge-blue-border">
                            #{item.id}
                          </span>
                        </td>
                        {!selectedDevice && (
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-medium text-text-secondary">{deviceName || `Device #${item.deviceId}`}</span>
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">{renderPayload(item.payload)}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-text-muted">{formatDate(item.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {sensorData.map((item) => {
                const deviceName = devices.find(d => d.id === item.deviceId)?.name;
                return (
                  <div key={item.id} className="bg-surface-card border border-border-default rounded-xl p-4 transition-all duration-200 hover:border-border-hover">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-badge-blue-bg text-badge-blue-text border border-badge-blue-border">
                        #{item.id}
                      </span>
                      <span className="text-xs text-text-muted">{formatDate(item.createdAt)}</span>
                    </div>
                    {!selectedDevice && deviceName && (
                      <div className="text-xs text-text-muted mb-2">
                        📱 <span className="text-text-secondary font-medium">{deviceName}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {renderPayload(item.payload)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-default py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
          <span>© {new Date().getFullYear()} Kalibrasi — Sensor Data Monitoring</span>
          <span className="flex items-center gap-1.5">
            Made with <span className="text-red-400">❤</span> by Biru Langit
          </span>
        </div>
      </footer>
    </div>
  );
}
