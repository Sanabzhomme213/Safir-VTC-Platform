import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, FileText, Search, Bot, Mail, Globe,
  Settings, Star, Plane, Gift, ShoppingBag, ChevronLeft, ChevronRight,
  Menu, X, Shield, ExternalLink, LogOut
} from 'lucide-react';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/Dashboard';
import ReservationsPage from './pages/Reservations';
import ClientsPage from './pages/Clients';
import InvoicesPage from './pages/Invoices';
import SeoPage from './pages/Seo';
import GoogleBusinessPage from './pages/GoogleBusiness';
import AiPage from './pages/AiAssistant';
import FlightsPage from './pages/Flights';
import EmailsPage from './pages/Emails';
import LoyaltyPage from './pages/Loyalty';
import PromoPage from './pages/Promo';
import ConciergePage from './pages/Concierge';
import ClientPortalPage from './pages/ClientPortal';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import ClientLoginPage from './pages/ClientLogin';
import ClientSpacePage from './pages/ClientSpace';
import SeoLandingPage from './pages/SeoLandingPage';
import SeoIndexPage from './pages/SeoIndexPage';

import { isAuthenticated, logout } from './lib/auth';
import { DataProvider } from './lib/DataContext';

type NavItem = { icon: React.ElementType; label: string; path: string };

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Car, label: 'Réservations', path: '/admin/reservations' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: FileText, label: 'Devis & Factures', path: '/admin/invoices' },
  { icon: Search, label: 'SEO Auto', path: '/admin/seo' },
  { icon: Globe, label: 'Google Business', path: '/admin/google-business' },
  { icon: Bot, label: 'IA Ambassadeur', path: '/admin/ai' },
  { icon: Plane, label: 'Suivi Vols', path: '/admin/flights' },
  { icon: Mail, label: 'Emails', path: '/admin/emails' },
  { icon: Star, label: 'Fidélité', path: '/admin/loyalty' },
  { icon: Gift, label: 'Codes Promo', path: '/admin/promo' },
  { icon: ShoppingBag, label: 'Concierge', path: '/admin/concierge' },
  { icon: Shield, label: 'Espace Client', path: '/admin/client-portal' },
  { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
];

type SidebarCtx = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false, mobileOpen: false,
  toggle: () => {}, toggleMobile: () => {}, closeMobile: () => {},
});

const useSidebar = () => useContext(SidebarContext);

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeMobile} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-noir-950 border-r border-white/5 transition-all duration-300 flex flex-col
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/5 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">L'Ambassadeur des VTC</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
          )}
          <button onClick={closeMobile} className="lg:hidden text-noir-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-sapphire-600/15 text-sapphire-400 border border-sapphire-500/20'
                  : 'text-noir-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Site vitrine link */}
        <div className={`border-t border-white/5 p-2`}>
          <NavLink
            to="/"
            onClick={closeMobile}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-noir-400 hover:text-sapphire-400 hover:bg-white/5 border border-transparent
              ${collapsed ? 'justify-center' : ''}`}
          >
            <ExternalLink className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Site vitrine</span>}
          </NavLink>
        </div>

        {/* User + logout */}
        <div className={`border-t border-white/5 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sapphire-500 to-sapphire-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                S
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Ambassadeur Admin</p>
                <p className="text-[10px] text-noir-500 mt-0.5">Administration</p>
              </div>
            </div>
          )}
          <button
            onClick={async () => { await logout(); onLogout(); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-noir-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar() {
  const { collapsed, toggle, toggleMobile } = useSidebar();

  return (
    <header className={`h-16 border-b border-white/5 bg-noir-950/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-4 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
      <button onClick={toggleMobile} className="lg:hidden text-noir-400 hover:text-white transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <button onClick={toggle} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-noir-400 hover:text-white transition-colors">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      <div className="flex-1" />
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sapphire-500 to-sapphire-700 flex items-center justify-center text-sm font-bold text-white">
        S
      </div>
    </header>
  );
}

function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ctx: SidebarCtx = {
    collapsed,
    mobileOpen,
    toggle: () => setCollapsed(!collapsed),
    toggleMobile: () => setMobileOpen(!mobileOpen),
    closeMobile: () => setMobileOpen(false),
  };

  return (
    <SidebarContext.Provider value={ctx}>
      <div className="min-h-screen bg-noir-950 text-white">
        <Sidebar onLogout={onLogout} />
        <Topbar />
        <main className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto animate-fade-in">
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="seo" element={<SeoPage />} />
              <Route path="google-business" element={<GoogleBusinessPage />} />
              <Route path="ai" element={<AiPage />} />
              <Route path="flights" element={<FlightsPage />} />
              <Route path="emails" element={<EmailsPage />} />
              <Route path="loyalty" element={<LoyaltyPage />} />
              <Route path="promo" element={<PromoPage />} />
              <Route path="concierge" element={<ConciergePage />} />
              <Route path="client-portal" element={<ClientPortalPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated);

  // Supabase magic link tokens arrive as a URL hash fragment
  // (e.g. /client/dashboard#access_token=...&type=signup). With clean URLs
  // (BrowserRouter), the pathname already matches the right route directly,
  // and supabase-js's detectSessionInUrl (default on) parses the fragment
  // and establishes the session automatically — no manual redirect needed.

  // Client routes are always accessible (independent auth)
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/vtc" element={<SeoIndexPage />} />
        <Route path="/vtc/:slug" element={<SeoLandingPage />} />

        {/* Client space */}
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/client/dashboard" element={<ClientSpacePage />} />
        <Route path="/client/*" element={<Navigate to="/client/login" replace />} />

        {/* Admin (requires admin auth) */}
        {authed ? (
          <Route
            path="/admin/*"
            element={
              <DataProvider>
                <AdminLayout onLogout={() => setAuthed(false)} />
              </DataProvider>
            }
          />
        ) : (
          <Route path="/admin/*" element={<LoginPage onLogin={() => setAuthed(true)} />} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}