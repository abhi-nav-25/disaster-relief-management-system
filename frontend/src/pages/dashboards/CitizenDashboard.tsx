import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  PhoneCall,
  Package,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Alert } from '../../components/common/Alert';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Public Relief Assistance Grid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Welcome, {user?.name || 'Citizen'}
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Access real-time information on nearest safe shelters, emergency helplines, and government relief supplies in your area.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/camps/nearest"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 shadow-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Find Nearest Shelter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Advisory Alert */}
      <Alert
        type="info"
        title="Disaster Emergency Protocol Advisory"
        message="Follow official instructions from disaster response teams. In life-threatening emergencies, dial 112 or 1077 immediately."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Nearest Safe Shelters"
          value="GPS Enabled"
          icon={MapPin}
          colorScheme="blue"
          description="Locate operational relief camps"
        />
        <StatCard
          title="Emergency Helplines"
          value="24/7 Available"
          icon={PhoneCall}
          colorScheme="rose"
          description="Medical, rescue, police"
        />
        <StatCard
          title="Relief Catalog"
          value="Active Grid"
          icon={Package}
          colorScheme="emerald"
          description="Government supply commodities"
        />
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-blue-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Relief Camps Directory</h4>
          <p className="text-xs text-slate-500 mb-4">
            View shelter addresses, occupancy capacity, and operational status in your district.
          </p>
          <Link
            to="/camps"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Camps List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="hover:border-emerald-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Nearest Camp Locator</h4>
          <p className="text-xs text-slate-500 mb-4">
            Calculate distances to the 3 closest operational shelters using live GPS navigation.
          </p>
          <Link
            to="/camps/nearest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Calculate Proximity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="hover:border-rose-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Emergency Services</h4>
          <p className="text-xs text-slate-500 mb-4">
            Quick-dial disaster management, emergency ambulance, fire services, and police hotlines.
          </p>
          <Link
            to="/emergency-contacts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <span>Emergency Contacts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
};
