import React, { useState, useEffect } from 'react';
import AdminLayout from './layouts/AdminLayout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import ParkingSpacesPage from './pages/ParkingSpacesPage.jsx';
import VehiclesPage from './pages/VehiclesPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import ParkingEntryPage from './pages/ParkingEntryPage.jsx';
import ParkingExitPage from './pages/ParkingExitPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import CustomerPortalPage from './pages/CustomerPortalPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import AccessDenied from './components/AccessDenied.jsx';

function MainApp() {
  const { role, isPageAllowed } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [navParams, setNavParams] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Default redirect for Customer role
  useEffect(() => {
    if (role === 'customer' && activePage !== 'portal' && activePage !== 'spaces' && activePage !== 'pricing' && activePage !== 'history') {
      setActivePage('portal');
    }
  }, [role]);

  const handleNavigate = (pageId, params = {}) => {
    setNavParams(params);
    setActivePage(pageId);
  };

  const renderContent = () => {
    // Check permission
    if (!isPageAllowed(activePage)) {
      return (
        <AccessDenied
          pageName={activePage.toUpperCase()}
          onNavigate={handleNavigate}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'portal':
        return <CustomerPortalPage onNavigate={handleNavigate} />;
      case 'spaces':
        return <ParkingSpacesPage onNavigate={handleNavigate} />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'entry':
        return <ParkingEntryPage preselectedSpaceId={navParams.spaceId} onNavigate={handleNavigate} />;
      case 'exit':
        return <ParkingExitPage preselectedSpaceId={navParams.spaceId} onNavigate={handleNavigate} />;
      case 'payments':
        return <PaymentsPage />;
      case 'history':
        return <HistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'pricing':
        return <PricingPage />;
      case 'users':
        return <UserManagementPage />;
      default:
        return role === 'customer' ? (
          <CustomerPortalPage onNavigate={handleNavigate} />
        ) : (
          <DashboardPage onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
