import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Building2,
  Package,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardPath, formatRoleName } from '../utils/formatters';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Relief Camps', path: '/camps', icon: Building2 },
    { label: 'Find Nearest Camp', path: '/camps/nearest', icon: MapPin },
    { label: 'Emergency Helplines', path: '/emergency-contacts', icon: PhoneCall },
    { label: 'Relief Catalog', path: '/resources', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Emergency Hotline Top Ribbon */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-semibold text-rose-300">EMERGENCY OPERATIONS ACTIVE</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">National Disaster Response Grid</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpline: <strong>1077 / 112</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">CrisisRelief</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DRMS</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">Disaster Response Management</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <Link
                  to={getRoleDashboardPath(user.role)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard ({formatRoleName(user.role)})</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <Link
                  to={getRoleDashboardPath(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <span>Disaster Relief Management System (DRMS)</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Coordinated disaster response, relief camp management, supply dispatch, and emergency victim assistance platform.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm mb-3">Quick Navigation</h5>
              <ul className="space-y-2">
                <li><Link to="/camps" className="hover:text-white transition-colors">Relief Camps Directory</Link></li>
                <li><Link to="/camps/nearest" className="hover:text-white transition-colors">Find Nearest Camp</Link></li>
                <li><Link to="/emergency-contacts" className="hover:text-white transition-colors">Emergency Helplines</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Relief Resources Catalog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm mb-3">Emergency Response</h5>
              <p className="text-slate-400 mb-2">Police / Medical / Fire: <strong className="text-white">112</strong></p>
              <p className="text-slate-400 mb-2">Disaster Management: <strong className="text-white">1077</strong></p>
              <p className="text-slate-400">Ambulance: <strong className="text-white">108</strong></p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Disaster Relief Management Grid. Official Relief Operations.</p>
            <p className="text-slate-500">Authorized Personnel & Public Relief Portal</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
