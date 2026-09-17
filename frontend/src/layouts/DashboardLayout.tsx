import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Building2,
  Package,
  Layers,
  PhoneCall,
  MapPin,
  ClipboardList,
  Truck,
  Users,
  CheckSquare,
  FileSearch,
  Activity,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatRoleName, getRoleBadgeColor, getRoleDepartmentName } from '../utils/formatters';
import type { UserRole } from '../types/auth.types';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = (role?: UserRole) => {
    switch (role) {
      case 'CITIZEN':
        return [
          { label: 'Citizen Dashboard', path: '/dashboard/citizen', icon: Activity },
          { label: 'Relief Camps', path: '/camps', icon: Building2 },
          { label: 'Find Nearest Camp', path: '/camps/nearest', icon: MapPin },
          { label: 'Emergency Helplines', path: '/emergency-contacts', icon: PhoneCall },
        ];
      case 'RELIEF_CAMP_MANAGER':
        return [
          { label: 'Camp Overview', path: '/dashboard/camp-manager', icon: Building2 },
          { label: 'Camp Inventory', path: '/dashboard/camp-manager#inventory', icon: Layers },
          { label: 'Resource Requests', path: '/dashboard/camp-manager#requests', icon: ClipboardList },
          { label: 'Public Camps View', path: '/camps', icon: MapPin },
          { label: 'Emergency Contacts', path: '/emergency-contacts', icon: PhoneCall },
        ];
      case 'CONTROL_CENTRE_OPERATOR':
        return [
          { label: 'Command Center', path: '/dashboard/control-centre', icon: Activity },
          { label: 'Resource Requests', path: '/dashboard/control-centre#requests', icon: ClipboardList },
          { label: 'Team Assignments', path: '/dashboard/control-centre#assignments', icon: Users },
          { label: 'Field Tasks', path: '/dashboard/control-centre#tasks', icon: CheckSquare },
          { label: 'Delivery Dispatches', path: '/dashboard/control-centre#deliveries', icon: Truck },
          { label: 'Duplicate Reviews', path: '/dashboard/control-centre#duplicates', icon: AlertTriangle },
          { label: 'Audit Logs', path: '/dashboard/control-centre#audit', icon: FileSearch },
        ];
      case 'DMA_SUPERVISOR':
        return [
          { label: 'DMA Executive Dashboard', path: '/dashboard/dma-supervisor', icon: ShieldCheck },
          { label: 'Relief Camps Master', path: '/dashboard/dma-supervisor#camps', icon: Building2 },
          { label: 'Relief Teams', path: '/dashboard/dma-supervisor#teams', icon: Users },
          { label: 'Resource Catalog', path: '/dashboard/dma-supervisor#resources', icon: Package },
          { label: 'System Audit Logs', path: '/dashboard/dma-supervisor#audit', icon: FileSearch },
        ];
      case 'RELIEF_TEAM':
        return [
          { label: 'Team Operations', path: '/dashboard/relief-team', icon: Activity },
          { label: 'Assigned Field Tasks', path: '/dashboard/relief-team#tasks', icon: CheckSquare },
          { label: 'Resource Deliveries', path: '/dashboard/relief-team#deliveries', icon: Truck },
          { label: 'Emergency Helplines', path: '/emergency-contacts', icon: PhoneCall },
        ];
      default:
        return [{ label: 'Overview', path: '/dashboard', icon: Activity }];
    }
  };

  const navItems = getNavItems(user?.role);

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight">CrisisRelief</span>
                <span className="text-[10px] font-bold px-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  DRMS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Disaster Response Grid</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              OPERATIONAL ROLE
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="font-bold text-sm text-slate-100 uppercase tracking-wide">
            {formatRoleName(user?.role)}
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {getRoleDepartmentName(user?.role)}
          </p>
          {user?.managedCamp && (
            <p className="text-xs text-blue-300 mt-1 truncate">
              Camp: <strong>{user.managedCamp.name}</strong>
            </p>
          )}
          {user?.teams && user.teams.length > 0 && (
            <p className="text-xs text-amber-300 mt-1 truncate">
              Team: <strong>{user.teams[0].teamName}</strong>
            </p>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            PORTAL SECTIONS
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentFullPath = location.pathname + (location.hash || '');
            const isActive = item.path.includes('#')
              ? currentFullPath === item.path
              : location.pathname === item.path &&
                (!location.hash || location.hash === '' || location.hash === '#overview');
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0 font-bold text-xs">
                {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-rose-900/40 hover:text-rose-300 hover:border-rose-700/50 border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Disaster Relief Management System
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Secure Operational Incident Control & Disaster Recovery Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                user?.role
              )}`}
            >
              {formatRoleName(user?.role)}
            </span>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Directory</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
