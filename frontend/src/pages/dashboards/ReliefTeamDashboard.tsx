import React from 'react';
import {
  Activity,
  CheckSquare,
  Truck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { getTeamStatusColor } from '../../utils/formatters';

export const ReliefTeamDashboard: React.FC = () => {
  const { user } = useAuth();
  const team = user?.teams && user.teams.length > 0 ? user.teams[0] : null;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-amber-800 via-slate-900 to-amber-950 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                FIELD RELIEF TEAM CONSOLE
              </span>
              {team?.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getTeamStatusColor(team.status)}`}>
                  {team.status}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {team?.teamName || 'Assigned Relief Team'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Field Responder: <strong>{user?.name}</strong> • Direct Hotline: <strong>{team?.contactNumber || user?.phone || 'N/A'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="md" className="bg-amber-600 hover:bg-amber-700 text-white">
              Toggle Ready Status
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Tasks"
          value="Field Queue"
          icon={CheckSquare}
          colorScheme="amber"
          description="Rescue, evacuation, medical tasks"
        />
        <StatCard
          title="Pending Deliveries"
          value="Logistics Active"
          icon={Truck}
          colorScheme="blue"
          description="Resource drop-offs in transit"
        />
        <StatCard
          title="Team Readiness"
          value={team?.status || 'AVAILABLE'}
          icon={Users}
          colorScheme="emerald"
          description="Current dispatch availability"
        />
        <StatCard
          title="Emergency Grid"
          value="Connected"
          icon={Activity}
          colorScheme="purple"
          description="Direct sync with Control Centre"
        />
      </div>

      {/* Field Operations Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Assigned Tasks */}
        <Card
          title="Field Tasks Execution"
          subtitle="Tactical rescue, medical aid, and relief distribution assignments"
          action={
            <Button size="sm" variant="outline">
              Refresh Tasks
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Teams advance task status through the official lifecycle:{' '}
              <span className="font-semibold text-slate-800">
                ASSIGNED ➔ ACCEPTED ➔ IN_PROGRESS ➔ COMPLETED / FAILED
              </span>.
            </p>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-bold block">Backend Integrations:</span>
              <p>• Fetch team tasks: <code className="font-mono text-[11px]">GET /api/tasks/my-team</code></p>
              <p>• Progress task status: <code className="font-mono text-[11px]">PUT /api/tasks/:id/status</code></p>
            </div>
          </div>
        </Card>

        {/* Module 2: Deliveries */}
        <Card
          title="Resource Delivery Shipments"
          subtitle="Acknowledge receipt and confirm delivery at relief camps"
          action={
            <Button size="sm" variant="outline">
              View Deliveries
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              When supply shipments reach the designated camp, confirming delivery updates the camp inventory automatically on the server.
            </p>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
              <span className="font-bold block">Backend Integrations:</span>
              <p>• Delivery details: <code className="font-mono text-[11px]">GET /api/deliveries/:id</code></p>
              <p>• Update delivery status: <code className="font-mono text-[11px]">PUT /api/deliveries/:id/status</code></p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
