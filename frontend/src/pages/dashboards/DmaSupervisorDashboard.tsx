import React from 'react';
import {
  Building2,
  Users,
  Package,
  FileSearch,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const DmaSupervisorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Supervisor Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                DISASTER MANAGEMENT AUTHORITY • SUPERVISOR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              DMA Executive Management Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Supervisor: <strong>{user?.name}</strong> • Official relief camp registry, relief teams deployment, master resource catalog, and compliance audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Relief Team
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Relief Camps Master"
          value="Official Grid"
          icon={Building2}
          colorScheme="purple"
          description="Capacities & geographic bounds"
        />
        <StatCard
          title="Relief Teams"
          value="Field Units"
          icon={Users}
          colorScheme="blue"
          description="Registered emergency teams"
        />
        <StatCard
          title="Resource Catalog"
          value="Master Commodities"
          icon={Package}
          colorScheme="emerald"
          description="Standardized relief supplies"
        />
        <StatCard
          title="Audit System"
          value="Compliance Active"
          icon={FileSearch}
          colorScheme="slate"
          description="State changes & action log"
        />
      </div>

      {/* Supervisor Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Official Camp Management */}
        <Card
          title="Relief Camps Master Data"
          subtitle="Administer official camp codes, names, coordinates, and capacities"
          action={
            <Button size="sm" variant="outline">
              Manage Camps
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Supervisors can update official camp metadata including code, name, address, latitude, longitude, and maximum shelter capacity.
            </p>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-950">
              Endpoint: <code className="text-[11px] font-mono">PUT /api/dma/camps/:id</code>
            </div>
          </div>
        </Card>

        {/* Section 2: Relief Teams Administration */}
        <Card
          title="Relief Teams Registry"
          subtitle="Create new teams, oversee members, and manage availability"
          action={
            <Button size="sm" variant="outline">
              Create Team
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Create emergency relief teams, set contact details, monitor member rosters, and manage operational readiness status (<code className="text-[10px] bg-slate-100 px-1 rounded">AVAILABLE</code>, <code className="text-[10px] bg-slate-100 px-1 rounded">BUSY</code>, <code className="text-[10px] bg-slate-100 px-1 rounded">OFFLINE</code>).
            </p>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-950">
              Endpoints: <code className="text-[11px] font-mono">POST /api/teams</code>, <code className="text-[11px] font-mono">GET /api/teams</code>, <code className="text-[11px] font-mono">PUT /api/teams/:id/status</code>
            </div>
          </div>
        </Card>

        {/* Section 3: Master Resource Catalog */}
        <Card
          title="Master Resource Catalog"
          subtitle="Add relief items, food supplies, and medical kits"
          action={
            <Button size="sm" variant="outline">
              Add New Resource
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Define standard relief resources, measurement units (e.g. Cartons, Bags, Liters, Kits), and active supply status across the network.
            </p>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-950">
              Endpoints: <code className="text-[11px] font-mono">POST /api/resources</code>, <code className="text-[11px] font-mono">PUT /api/resources/:id</code>
            </div>
          </div>
        </Card>

        {/* Section 4: Audit Logs & Governance */}
        <Card
          title="System Audit & Governance"
          subtitle="Immutable operational record of all critical state changes"
          action={
            <Button size="sm" variant="outline">
              Export Audit Logs
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Track entity modifications, request approvals, priority adjustments, duplicate decisions, and team dispatch records with precise user timestamps.
            </p>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-900">
              Endpoint: <code className="text-[11px] font-mono">GET /api/audit-logs</code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
