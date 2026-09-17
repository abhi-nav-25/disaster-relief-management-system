import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  MapPin,
  PhoneCall,
  Download,
  ArrowRight,
  Truck,
  Users,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Real-time Disaster Response & Recovery Grid
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Integrated Disaster Relief <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300">
              Management System
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Connecting citizens, relief camp coordinators, response command centers, and field rescue teams in a centralized operational network to deliver life-saving aid efficiently.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/camps/nearest"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Find Nearest Relief Camp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="/city-relief-map.svg"
              download="city-relief-map.svg"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              title="Download Vector City Relief Map (Offline Use)"
            >
              <Download className="w-4 h-4" />
              <span>Download City Map</span>
            </a>

            <Link
              to="/emergency-contacts"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Emergency Helplines</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Operational Metrics Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Relief Camps Network"
            value="Active & Mapped"
            icon={Building2}
            colorScheme="blue"
            description="Operational shelters & safe havens"
          />
          <StatCard
            title="Emergency Services"
            value="24/7 Response"
            icon={PhoneCall}
            colorScheme="amber"
            description="Direct helpline connections"
          />
          <StatCard
            title="Supply Logistics"
            value="Tracked in Real-Time"
            icon={Truck}
            colorScheme="emerald"
            description="Inventory & delivery fulfillment"
          />
          <StatCard
            title="Field Operations"
            value="Coordinated Teams"
            icon={Users}
            colorScheme="purple"
            description="Direct rescue & medical tasks"
          />
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Disaster Response Services
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Access citizen assistance tools or sign in to your departmental portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Camps */}
          <Card className="hover:border-blue-300 transition-all hover:shadow-md">
            <div className="p-3 w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Relief Camp Directory</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Explore operational relief camps, occupancy rates, shelter capacity, and address details.
            </p>
            <Link
              to="/camps"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All Relief Camps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Card 2: Nearest Camp Finder */}
          <Card className="hover:border-emerald-300 transition-all hover:shadow-md">
            <div className="p-3 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nearest Shelter Locator</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Use GPS geolocation to find the closest 3 operational camps with calculated distances in kilometers.
            </p>
            <Link
              to="/camps/nearest"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Locate Nearest Camps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Card 3: Emergency Helplines */}
          <Card className="hover:border-amber-300 transition-all hover:shadow-md">
            <div className="p-3 w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Emergency Contacts</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Quickly contact Disaster Management, Ambulance, Fire, Police, and local search & rescue authorities.
            </p>
            <Link
              to="/emergency-contacts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>View Contact Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Role Access Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white p-8 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Authorized Agency Portals</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Operational Portals by Responsibility
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our role-based workflow ensures dedicated command capabilities for Control Centre Operators, Relief Camp Managers, DMA Supervisors, Field Teams, and Citizens.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 shadow-md transition-all"
                >
                  <span>Sign In to Your Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <h4 className="font-bold text-blue-300 mb-1">Control Centre Operator</h4>
                <p className="text-slate-300">Verify requests, run duplicate checks, assign relief teams & dispatches.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <h4 className="font-bold text-amber-300 mb-1">Relief Camp Manager</h4>
                <p className="text-slate-300">Manage camp occupancy, monitor inventory stocks & request supplies.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <h4 className="font-bold text-purple-300 mb-1">DMA Supervisor</h4>
                <p className="text-slate-300">Manage official camps, create relief teams, manage catalog & audit logs.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <h4 className="font-bold text-emerald-300 mb-1">Relief Team Member</h4>
                <p className="text-slate-300">View field tasks, update execution status, and confirm aid deliveries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
