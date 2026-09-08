import React from 'react';
import {
  Building2,
  Users,
  Layers,
  ClipboardList,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { getCampStatusColor } from '../../utils/formatters';

export const CampManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const camp = user?.managedCamp;

  const occupancyPct =
    camp && camp.capacity > 0
      ? Math.min(Math.round((camp.currentOccupancy / camp.capacity) * 100), 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Camp Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                CAMP MANAGER CONTROL
              </span>
              {camp?.operationalStatus && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCampStatusColor(camp.operationalStatus)}`}>
                  {camp.operationalStatus}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {camp?.name || 'Assigned Relief Camp'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Official Code: <strong>{camp?.officialCode || 'CAMP-001'}</strong> • {camp?.address || 'Operational Zone'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="bg-blue-500 hover:bg-blue-600"
            >
              New Resource Request
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Occupancy"
          value={`${camp?.currentOccupancy || 0} / ${camp?.capacity || 0}`}
          icon={Users}
          colorScheme={occupancyPct > 85 ? 'rose' : 'blue'}
          description={`${occupancyPct}% of total capacity used`}
        />
        <StatCard
          title="Camp Status"
          value={camp?.operationalStatus || 'OPERATIONAL'}
          icon={Building2}
          colorScheme="emerald"
          description="Live operational classification"
        />
        <StatCard
          title="Inventory Items"
          value="Tracked"
          icon={Layers}
          colorScheme="purple"
          description="Local stock & ration supplies"
        />
        <StatCard
          title="Supply Requests"
          value="Active Queue"
          icon={ClipboardList}
          colorScheme="amber"
          description="Submitted to Control Centre"
        />
      </div>

      {/* Main Operational Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Occupancy & Status Quick Manager */}
        <Card title="Camp Operational Info" subtitle="Live occupancy & status reports">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Shelter Capacity Utilization</span>
                <span className="text-slate-900">{occupancyPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Capacity:</span>
                <span className="font-bold text-slate-800">{camp?.capacity || '—'} persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Occupants:</span>
                <span className="font-bold text-slate-800">{camp?.currentOccupancy || '0'} persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Beds:</span>
                <span className="font-bold text-emerald-700">
                  {Math.max((camp?.capacity || 0) - (camp?.currentOccupancy || 0), 0)} beds
                </span>
              </div>
            </div>

            {camp?.operationalNotes && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                <span className="font-bold block mb-1">Operational Notes:</span>
                <p className="italic">"{camp.operationalNotes}"</p>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Quick Action Cards for Stage 2 Implementation */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Local Camp Inventory"
            subtitle="Supplies, rations, medicines and equipment on-site"
            action={
              <Button size="sm" variant="outline">
                Record Stock Adjustment
              </Button>
            }
          >
            <div className="text-center py-8 text-slate-500 space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Camp Inventory Manager Ready</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Connected to backend endpoints: <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">GET /api/inventory/my-camp</code> and <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">PUT /api/inventory/my-camp/:id</code>
              </p>
            </div>
          </Card>

          <Card
            title="Camp Resource Requests"
            subtitle="Demands submitted to the Control Centre for verification & dispatch"
            action={
              <Button size="sm" variant="primary">
                + Create Online Request
              </Button>
            }
          >
            <div className="text-center py-8 text-slate-500 space-y-2">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Resource Requests Queue Ready</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Connected to backend endpoints: <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">POST /api/resource-requests</code> and <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">GET /api/resource-requests/my-camp</code>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
