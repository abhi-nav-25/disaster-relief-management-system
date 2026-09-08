import React from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Users,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const ControlCentreDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                CENTRAL COMMAND OPERATIONS
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Incident Response Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Operator: <strong>{user?.name}</strong> • Request verification, team dispatching, duplicate resolution, and emergency task orchestration.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-700">
              Live Operations Feed
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value="Verification Queue"
          icon={ClipboardList}
          colorScheme="amber"
          description="Camp relief supply requests"
        />
        <StatCard
          title="Available Teams"
          value="Ready for Dispatch"
          icon={Users}
          colorScheme="emerald"
          description="Relief teams in standby"
        />
        <StatCard
          title="Active Deliveries"
          value="In Transit"
          icon={Truck}
          colorScheme="blue"
          description="Supply fulfillment dispatches"
        />
        <StatCard
          title="Duplicate Alerts"
          value="AI Detection Active"
          icon={AlertTriangle}
          colorScheme="purple"
          description="50%+ overlap heuristics"
        />
      </div>

      {/* Operator Workflow Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Request Verification */}
        <Card
          title="1. Request Verification"
          subtitle="Review and verify incoming camp demands"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify legitimacy, inspect required quantities, approve status, or set priority levels (Low, Med, High, Critical).
            </p>
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-950">
              Endpoints: <code className="text-[11px] font-mono">PUT /api/resource-requests/:id/verify</code>, <code className="text-[11px] font-mono">PUT /api/resource-requests/:id/priority</code>
            </div>
          </div>
        </Card>

        {/* Module 2: Duplicate Detection */}
        <Card
          title="2. Duplicate Detection"
          subtitle="Prevent redundant resource requests"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Run automated similarity checks to identify overlapping requests within the same camp and record review decisions.
            </p>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-950">
              Endpoints: <code className="text-[11px] font-mono">POST /api/duplicate-checks/request/:id/detect</code>, <code className="text-[11px] font-mono">PUT /api/duplicate-checks/:id/review</code>
            </div>
          </div>
        </Card>

        {/* Module 3: Team Assignment */}
        <Card
          title="3. Relief Team Assignment"
          subtitle="Deploy available relief units"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Match verified requests with available relief teams. Automatically transitions request to <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">ASSIGNED</code> and team to <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">BUSY</code>.
            </p>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-950">
              Endpoints: <code className="text-[11px] font-mono">POST /api/request-assignments/request/:reqId/team/:teamId</code>
            </div>
          </div>
        </Card>

        {/* Module 4: Field Tasks */}
        <Card
          title="4. Field Task Dispatch"
          subtitle="Generate tactical rescue & delivery tasks"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Assign task instructions, target GPS coordinates, and execution milestones to deployed teams.
            </p>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-950">
              Endpoint: <code className="text-[11px] font-mono">POST /api/tasks</code>
            </div>
          </div>
        </Card>

        {/* Module 5: Deliveries & Logistics */}
        <Card
          title="5. Supply Delivery Fulfillment"
          subtitle="Logistics dispatch and fulfillment tracker"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Create delivery batches against assigned requests. Marking deliveries as delivered auto-increments camp inventory!
            </p>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-950">
              Endpoints: <code className="text-[11px] font-mono">POST /api/deliveries</code>, <code className="text-[11px] font-mono">PUT /api/deliveries/:id/status</code>
            </div>
          </div>
        </Card>

        {/* Module 6: System Audit */}
        <Card
          title="6. Central Audit Trail"
          subtitle="Immutable operational event logging"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect before/after states, verification decisions, status overrides, and user timestamps.
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
