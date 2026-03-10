import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SensorDataPanel from '../panels/SensorDataPanel';
import UserManagementPanel from '../panels/UserManagementPanel';
import DeviceManagementPanel from '../panels/DeviceManagementPanel';
import ExportCSVPanel from '../panels/ExportCSVPanel';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('sensor-data');

  const renderPanel = () => {
    switch (activeTab) {
      case 'sensor-data':
        return <SensorDataPanel />;
      case 'users':
        return isAdmin ? <UserManagementPanel /> : null;
      case 'devices':
        return isAdmin ? <DeviceManagementPanel /> : null;
      case 'export':
        return isAdmin ? <ExportCSVPanel /> : null;
      default:
        return <SensorDataPanel />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-md:flex-col">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-64px)] max-md:max-h-none max-md:p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}
