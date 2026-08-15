import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import LoginModal from '../components/LoginModal.jsx';

export default function AdminLayout({ activePage, setActivePage, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        onNavigate={(pageId) => setActivePage(pageId)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>

      <LoginModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
