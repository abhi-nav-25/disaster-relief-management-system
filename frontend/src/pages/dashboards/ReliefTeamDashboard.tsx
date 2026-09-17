import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckSquare,
  Truck,
  Users,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  getTeamStatusColor,
  getTaskStatusColor,
  getDeliveryStatusColor,
  formatDate,
} from '../../utils/formatters';
import { authService } from '../../services/auth.service';
import { taskService } from '../../services/task.service';
import { deliveryService } from '../../services/delivery.service';
import { teamService } from '../../services/team.service';
import type {
  Task,
  TaskStatus,
  ResourceDelivery,
  DeliveryStatus,
  TeamStatus,
} from '../../types/models.types';

type ReliefTeamTab = 'overview' | 'tasks' | 'deliveries';

const getTeamTabFromHash = (hash: string): ReliefTeamTab => {
  const clean = hash.replace('#', '').toLowerCase();
  if (clean === 'tasks') return 'tasks';
  if (clean === 'deliveries') return 'deliveries';
  return 'overview';
};

export const ReliefTeamDashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Primary team associated with this user
  const primaryTeam = user?.teams && user.teams.length > 0 ? user.teams[0] : null;

  // Active Tab: 'overview' | 'tasks' | 'deliveries'
  const [activeTab, setActiveTab] = useState<ReliefTeamTab>(() => getTeamTabFromHash(location.hash));

  useEffect(() => {
    setActiveTab(getTeamTabFromHash(location.hash));
  }, [location.hash]);

  const switchTab = (tab: ReliefTeamTab) => {
    setActiveTab(tab);
    const targetHash = tab === 'overview' ? '' : `#${tab}`;
    navigate(`/dashboard/relief-team${targetHash}`, { replace: true });
  };

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliveries, setDeliveries] = useState<ResourceDelivery[]>([]);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');

  const [deliverySearch, setDeliverySearch] = useState<string>('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>('ALL');

  // Modals
  // 1. Team Status Modal
  const [isTeamStatusModalOpen, setIsTeamStatusModalOpen] = useState<boolean>(false);
  const [selectedTeamStatus, setSelectedTeamStatus] = useState<TeamStatus>(
    (primaryTeam?.status as TeamStatus) || 'AVAILABLE'
  );
  const [isSubmittingTeamStatus, setIsSubmittingTeamStatus] = useState<boolean>(false);
  const [teamStatusError, setTeamStatusError] = useState<string | null>(null);

  // 2. Task Details & Update Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoadingTaskDetails, setIsLoadingTaskDetails] = useState<boolean>(false);
  const [taskNextStatus, setTaskNextStatus] = useState<TaskStatus | ''>('');
  const [taskOutcomeNotes, setTaskOutcomeNotes] = useState<string>('');
  const [isSubmittingTaskStatus, setIsSubmittingTaskStatus] = useState<boolean>(false);
  const [taskUpdateError, setTaskUpdateError] = useState<string | null>(null);

  // 3. Delivery Details & Update Modal
  const [selectedDelivery, setSelectedDelivery] = useState<ResourceDelivery | null>(null);
  const [isLoadingDeliveryDetails, setIsLoadingDeliveryDetails] = useState<boolean>(false);
  const [deliveryNextStatus, setDeliveryNextStatus] = useState<DeliveryStatus | ''>('');
  const [isSubmittingDeliveryStatus, setIsSubmittingDeliveryStatus] = useState<boolean>(false);
  const [deliveryUpdateError, setDeliveryUpdateError] = useState<string | null>(null);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Sync selectedTeamStatus when primaryTeam updates
  useEffect(() => {
    if (primaryTeam?.status) {
      setSelectedTeamStatus(primaryTeam.status as TeamStatus);
    }
  }, [primaryTeam]);

  // Fetch all tasks and associated deliveries from real backend endpoints
  const loadDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      // 1. Fetch latest profile directly to avoid stale closures and race conditions
      let activeUser = user;
      try {
        const profileData = await authService.getProfile();
        if (profileData?.user) {
          activeUser = profileData.user;
        }
      } catch {
        // Fallback to currently available user from context if profile fetch fails
      }

      // 2. Check if user has an active relief team membership
      const hasTeam = Boolean(activeUser?.teams && activeUser.teams.length > 0);

      if (!hasTeam) {
        setTasks([]);
        setDeliveries([]);
      } else {
        const tasksData = await taskService.getMyTeamTasks();
        setTasks(tasksData);

        // Collect unique resourceRequestIds from tasks to load associated deliveries
        const requestIds = Array.from(
          new Set(
            tasksData
              .map((t) => t.resourceRequestId)
              .filter((id): id is number => typeof id === 'number' && id > 0)
          )
        );

        if (requestIds.length > 0) {
          const deliveryArrays = await Promise.all(
            requestIds.map((rId) =>
              deliveryService.getDeliveriesForRequest(rId).catch(() => [] as ResourceDelivery[])
            )
          );
          // Flatten and deduplicate deliveries
          const allDeliveries = deliveryArrays.flat();
          const uniqueDeliveries = Array.from(
            new Map(allDeliveries.map((d) => [d.id, d])).values()
          );
          setDeliveries(uniqueDeliveries);
        } else {
          setDeliveries([]);
        }
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const backendMsg = responseData?.message;
      const msg = backendMsg || (err instanceof Error ? err.message : 'Failed to fetch team operations data');
      if (
        msg.includes('not a member of a relief team') ||
        msg.includes('User is not a member') ||
        backendMsg?.includes('not a member')
      ) {
        setTasks([]);
        setDeliveries([]);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ==========================================
  // TEAM STATUS UPDATE HANDLERS
  // ==========================================
  const handleOpenTeamStatusModal = () => {
    if (primaryTeam?.status) {
      setSelectedTeamStatus(primaryTeam.status as TeamStatus);
    }
    setTeamStatusError(null);
    setIsTeamStatusModalOpen(true);
  };

  const handleUpdateTeamStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teamId = primaryTeam?.id || user?.teams?.[0]?.id;
    if (!teamId) {
      setTeamStatusError('No relief team assigned to this user profile.');
      return;
    }

    setTeamStatusError(null);
    setIsSubmittingTeamStatus(true);
    try {
      await teamService.updateTeamStatus(teamId, selectedTeamStatus);
      await refreshProfile();
      setSuccessMessage(`Team readiness status updated to ${selectedTeamStatus}.`);
      setIsTeamStatusModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update team readiness status.';
      setTeamStatusError(msg);
    } finally {
      setIsSubmittingTeamStatus(false);
    }
  };

  // ==========================================
  // TASK DETAILS & STATUS UPDATE HANDLERS
  // ==========================================
  const handleOpenTaskDetails = async (task: Task) => {
    setSelectedTask(task);
    setTaskNextStatus('');
    setTaskOutcomeNotes('');
    setTaskUpdateError(null);
    setIsLoadingTaskDetails(true);

    try {
      const fullTask = await taskService.getTaskById(task.id);
      setSelectedTask(fullTask);
    } catch {
      // Fallback to currently selected task
    } finally {
      setIsLoadingTaskDetails(false);
    }
  };

  const getAllowedTaskTransitions = (status: TaskStatus): TaskStatus[] => {
    switch (status) {
      case 'ASSIGNED':
        return ['ACCEPTED', 'CANCELLED'];
      case 'ACCEPTED':
        return ['IN_PROGRESS', 'CANCELLED'];
      case 'IN_PROGRESS':
        return ['COMPLETED', 'FAILED'];
      case 'COMPLETED':
      case 'FAILED':
      case 'CANCELLED':
      default:
        return [];
    }
  };

  const handleUpdateTaskStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskNextStatus) return;

    setTaskUpdateError(null);
    setIsSubmittingTaskStatus(true);
    try {
      await taskService.updateTaskStatus(
        selectedTask.id,
        taskNextStatus,
        taskOutcomeNotes.trim() || undefined
      );

      setSuccessMessage(`Task #${selectedTask.id} advanced to ${taskNextStatus}.`);
      setSelectedTask(null);
      await loadDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update task status.';
      setTaskUpdateError(msg);
    } finally {
      setIsSubmittingTaskStatus(false);
    }
  };

  // ==========================================
  // DELIVERY DETAILS & STATUS UPDATE HANDLERS
  // ==========================================
  const handleOpenDeliveryDetails = async (delivery: ResourceDelivery) => {
    setSelectedDelivery(delivery);
    setDeliveryNextStatus('');
    setDeliveryUpdateError(null);
    setIsLoadingDeliveryDetails(true);

    try {
      const fullDelivery = await deliveryService.getDeliveryById(delivery.id);
      setSelectedDelivery(fullDelivery);
    } catch {
      // Fallback
    } finally {
      setIsLoadingDeliveryDetails(false);
    }
  };

  const getAllowedDeliveryTransitions = (status: DeliveryStatus): DeliveryStatus[] => {
    switch (status) {
      case 'PLANNED':
        return ['IN_TRANSIT', 'CANCELLED'];
      case 'IN_TRANSIT':
        return ['DELIVERED', 'PARTIALLY_DELIVERED', 'FAILED'];
      case 'DELIVERED':
      case 'PARTIALLY_DELIVERED':
      case 'FAILED':
      case 'CANCELLED':
      default:
        return [];
    }
  };

  const handleUpdateDeliveryStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !deliveryNextStatus) return;

    setDeliveryUpdateError(null);
    setIsSubmittingDeliveryStatus(true);
    try {
      await deliveryService.updateDeliveryStatus(selectedDelivery.id, deliveryNextStatus);
      setSuccessMessage(`Delivery #${selectedDelivery.id} status updated to ${deliveryNextStatus}.`);
      setSelectedDelivery(null);
      await loadDashboardData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update delivery status.';
      setDeliveryUpdateError(msg);
    } finally {
      setIsSubmittingDeliveryStatus(false);
    }
  };

  // ==========================================
  // REAL CALCULATED KPI METRICS
  // ==========================================
  const totalTasksCount = tasks.length;
  const activeTasksCount = tasks.filter(
    (t) => t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS'
  ).length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'ASSIGNED').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const totalDeliveriesCount = deliveries.length;
  const inTransitDeliveriesCount = deliveries.filter((d) => d.status === 'IN_TRANSIT').length;

  // ==========================================
  // FILTERED DATASETS
  // ==========================================
  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
    if (taskSearch.trim()) {
      const term = taskSearch.toLowerCase();
      const matchId = String(t.id).includes(term);
      const matchTitle = t.title.toLowerCase().includes(term);
      const matchDesc = t.description?.toLowerCase().includes(term) || false;
      const matchAddr = t.locationAddress?.toLowerCase().includes(term) || false;
      if (!matchId && !matchTitle && !matchDesc && !matchAddr) return false;
    }
    return true;
  });

  const filteredDeliveries = deliveries.filter((d) => {
    if (deliveryStatusFilter !== 'ALL' && d.status !== deliveryStatusFilter) return false;
    if (deliverySearch.trim()) {
      const term = deliverySearch.toLowerCase();
      const matchId = String(d.id).includes(term);
      const matchReqId = String(d.requestId).includes(term);
      const matchNotes = d.notes?.toLowerCase().includes(term) || false;
      const matchItem = d.items?.some((i) => i.resource?.name.toLowerCase().includes(term)) || false;
      if (!matchId && !matchReqId && !matchNotes && !matchItem) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading Relief Team Operations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {successMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadDashboardData(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* Team Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-2xl text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-500/30 text-amber-200 border border-amber-400/30">
                FIELD RELIEF TEAM OPERATIONAL CONSOLE
              </span>
              {primaryTeam?.status && (
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getTeamStatusColor(
                    primaryTeam.status
                  )}`}
                >
                  {primaryTeam.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {primaryTeam?.teamName || 'Assigned Relief Team'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Responder: <strong className="text-white">{user?.name}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{primaryTeam?.contactNumber || user?.phone || 'Official Field Unit'}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="dark-outline"
              size="md"
              leftIcon={<Activity className="w-4 h-4" />}
              onClick={handleOpenTeamStatusModal}
            >
              Update Team Status
            </Button>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              title="Refresh Team Operations"
              className="p-2.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Operational KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Tasks"
          value={totalTasksCount}
          icon={CheckSquare}
          colorScheme="amber"
          description={`${pendingTasksCount} awaiting acceptance • ${activeTasksCount} in progress`}
        />
        <StatCard
          title="Completed Missions"
          value={completedTasksCount}
          icon={CheckCircle2}
          colorScheme="emerald"
          description="Successfully resolved field tasks"
        />
        <StatCard
          title="Deliveries Tracked"
          value={totalDeliveriesCount}
          icon={Truck}
          colorScheme="blue"
          description={`${inTransitDeliveriesCount} shipments in transit`}
        />
        <StatCard
          title="Readiness Status"
          value={primaryTeam?.status || 'AVAILABLE'}
          icon={Users}
          colorScheme="purple"
          description="Live dispatch availability signal"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm overflow-x-auto">
        <button
          onClick={() => switchTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Team Overview
        </button>
        <button
          onClick={() => switchTab('tasks')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          My Assigned Tasks ({tasks.length})
        </button>
        <button
          onClick={() => switchTab('deliveries')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'deliveries'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Resource Deliveries ({deliveries.length})
        </button>
      </div>

      {/* TAB 1: TEAM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Team Status Card */}
            <Card
              title="Team Readiness & Dispatch Info"
              subtitle="Live dispatch readiness and team contact data"
              action={
                <Button size="sm" variant="outline" onClick={handleOpenTeamStatusModal}>
                  Change Status
                </Button>
              }
            >
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Unit Name:</span>
                    <span className="font-bold text-slate-900">{primaryTeam?.teamName || 'Relief Team'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Official Contact:</span>
                    <span className="font-semibold text-slate-900">{primaryTeam?.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Active Responder:</span>
                    <span className="font-semibold text-slate-900">{user?.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Dispatch Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold border ${getTeamStatusColor(
                        primaryTeam?.status || 'AVAILABLE'
                      )}`}
                    >
                      {primaryTeam?.status || 'AVAILABLE'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-950 space-y-1">
                  <span className="font-bold block">Status Guidance:</span>
                  <p className="leading-relaxed">
                    Set your status to <strong>BUSY</strong> when engaged in field tasks. Set to{' '}
                    <strong>AVAILABLE</strong> when ready for new dispatches from the Control Centre.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-slate-700"
                  onClick={handleOpenTeamStatusModal}
                >
                  Update Readiness Status
                </Button>
              </div>
            </Card>

            {/* Right: Quick Previews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Tasks Preview */}
              <Card
                title="Active Assigned Field Tasks"
                subtitle="High-priority tasks currently assigned to this unit"
                action={
                  <Button size="sm" variant="outline" onClick={() => switchTab('tasks')}>
                    View All ({tasks.length})
                  </Button>
                }
              >
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Tasks Assigned</p>
                    <p className="text-xs text-slate-400">
                      No field tasks are currently assigned to your team.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {tasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTaskDetails(task)}
                        className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              TASK #{task.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getTaskStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900">{task.title}</h4>
                          {task.locationAddress && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {task.locationAddress}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400">
                            {formatDate(task.createdAt)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Quick Deliveries Preview */}
              <Card
                title="Assigned Resource Deliveries"
                subtitle="Logistics dispatches and relief supply drops"
                action={
                  <Button size="sm" variant="outline" onClick={() => switchTab('deliveries')}>
                    View All ({deliveries.length})
                  </Button>
                }
              >
                {deliveries.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Deliveries Tracked</p>
                    <p className="text-xs text-slate-400">
                      No active deliveries found for your assigned resource requests.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {deliveries.slice(0, 4).map((delivery) => (
                      <div
                        key={delivery.id}
                        onClick={() => handleOpenDeliveryDetails(delivery)}
                        className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800">
                              DELIVERY #{delivery.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDeliveryStatusColor(
                                delivery.status
                              )}`}
                            >
                              {delivery.status}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Req #{delivery.requestId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {delivery.items?.length || 0} commodity items included
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400">
                            {formatDate(delivery.createdAt)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ASSIGNED TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks by ID, title, description, or location..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Task Statuses</option>
                <option value="ASSIGNED">ASSIGNED (Awaiting Action)</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <Card
            title="Field Task Queue"
            subtitle="Missions and emergency orders dispatched to your relief unit"
          >
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-700">No Tasks Match Filter</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {tasks.length === 0
                    ? 'No tasks are currently assigned to your team.'
                    : 'No assigned tasks matched your search or status filter.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-4 px-3 hover:bg-slate-50/80 transition-colors rounded-xl border border-transparent hover:border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          TASK #{task.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTaskStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {task.type}
                        </span>
                        {task.resourceRequestId && (
                          <span className="text-xs text-slate-500">
                            Linked Req: <strong>#{task.resourceRequestId}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDate(task.createdAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenTaskDetails(task)}
                          className="text-xs"
                        >
                          View & Update Status
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                      {task.locationAddress && (
                        <span className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {task.locationAddress}
                        </span>
                      )}
                      {typeof task.latitude === 'number' && typeof task.longitude === 'number' && (
                        <span className="font-mono text-[11px] text-slate-400">
                          GPS: {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deliveries by ID, request ID, notes, or items..."
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={deliveryStatusFilter}
                onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="PLANNED">PLANNED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="PARTIALLY_DELIVERED">PARTIALLY_DELIVERED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <Card
            title="Assigned Resource Deliveries"
            subtitle="Supply consignments assigned to this relief team for dispatch"
          >
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-700">No Deliveries Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {deliveries.length === 0
                    ? 'No delivery consignments are currently linked to your team.'
                    : 'No deliveries matched your search or status filter.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="py-4 px-3 hover:bg-slate-50/80 transition-colors rounded-xl border border-transparent hover:border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          DELIVERY #{delivery.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDeliveryStatusColor(
                            delivery.status
                          )}`}
                        >
                          {delivery.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Request ID: <strong>#{delivery.requestId}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDate(delivery.createdAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDeliveryDetails(delivery)}
                          className="text-xs"
                        >
                          Inspect & Update Status
                        </Button>
                      </div>
                    </div>

                    {delivery.notes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-150">
                        {delivery.notes}
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Consignment Items:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {delivery.items?.map((item) => (
                          <span
                            key={item.id}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-xs"
                          >
                            <strong>{Number(item.quantity)}</strong> {item.resource?.unit || ''}{' '}
                            {item.resource?.name || `Res #${item.resourceId}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPDATE TEAM STATUS (PUT /api/teams/:id/status)                    */}
      {/* ========================================================================= */}
      {isTeamStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Readiness</h3>
                  <p className="text-xs text-slate-500">{primaryTeam?.teamName || 'Relief Team'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsTeamStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {teamStatusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{teamStatusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateTeamStatusSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Readiness Status *
                </label>
                <select
                  value={selectedTeamStatus}
                  onChange={(e) => setSelectedTeamStatus(e.target.value as TeamStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs"
                >
                  <option value="AVAILABLE">AVAILABLE (Ready for new dispatch)</option>
                  <option value="BUSY">BUSY (Active in field mission)</option>
                  <option value="OFFLINE">OFFLINE (Off-duty / Standby)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTeamStatusModalOpen(false)}
                  disabled={isSubmittingTeamStatus}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingTeamStatus}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Save Status
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TASK DETAILS & STATUS UPDATE                                      */}
      {/* ========================================================================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Field Task #{selectedTask.id} — {selectedTask.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Type: <strong>{selectedTask.type}</strong> • Created {formatDate(selectedTask.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingTaskDetails ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Status Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Current Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold border ${getTaskStatusColor(
                        selectedTask.status
                      )}`}
                    >
                      {selectedTask.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Task Type</span>
                    <span className="font-bold text-slate-800">{selectedTask.type}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Linked Request</span>
                    <span className="font-mono font-bold text-purple-900">
                      {selectedTask.resourceRequestId ? `#${selectedTask.resourceRequestId}` : 'Direct Task'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Instructions:</span>
                    <p className="text-slate-800 leading-relaxed">{selectedTask.description}</p>
                  </div>
                )}

                {/* Location Details */}
                {selectedTask.locationAddress && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-blue-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        Target Location
                      </span>
                      {typeof selectedTask.latitude === 'number' && typeof selectedTask.longitude === 'number' && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedTask.latitude},${selectedTask.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Open in Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs">{selectedTask.locationAddress}</p>
                  </div>
                )}

                {/* Linked Request Items if available */}
                {selectedTask.resourceRequest?.items && selectedTask.resourceRequest.items.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Associated Resource Request Demands
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Resource Item</th>
                            <th className="py-2 px-3 text-right">Quantity</th>
                            <th className="py-2 px-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedTask.resourceRequest.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                {item.resource?.name || `Res #${item.resourceId}`}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-blue-700">
                                {Number(item.quantity)} {item.resource?.unit || ''}
                              </td>
                              <td className="py-2 px-3 text-slate-500 italic">{item.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Status Update Controls */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 pt-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Advance Task Lifecycle
                  </h4>

                  {taskUpdateError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{taskUpdateError}</span>
                    </div>
                  )}

                  {getAllowedTaskTransitions(selectedTask.status).length === 0 ? (
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-500 italic text-xs">
                      This task is in terminal state ({selectedTask.status}). No further transitions allowed.
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateTaskStatusSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Select Next Status *
                        </label>
                        <select
                          required
                          value={taskNextStatus}
                          onChange={(e) => setTaskNextStatus(e.target.value as TaskStatus)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                        >
                          <option value="" disabled>
                            -- Choose Status Transition --
                          </option>
                          {getAllowedTaskTransitions(selectedTask.status).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Outcome / Field Progress Notes
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Arrived on site, supplies unloaded at shelter gate..."
                          value={taskOutcomeNotes}
                          onChange={(e) => setTaskOutcomeNotes(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSubmittingTaskStatus}
                          disabled={!taskNextStatus}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Update Task Status
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELIVERY DETAILS & STATUS UPDATE                                  */}
      {/* ========================================================================= */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delivery Consignment #{selectedDelivery.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dispatched for Resource Request #{selectedDelivery.requestId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDeliveryDetails ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold border ${getDeliveryStatusColor(
                        selectedDelivery.status
                      )}`}
                    >
                      {selectedDelivery.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Request ID</span>
                    <span className="font-bold text-slate-900">#{selectedDelivery.requestId}</span>
                  </div>
                </div>

                {selectedDelivery.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Dispatch Notes:</span>
                    <p className="text-slate-800">{selectedDelivery.notes}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Consignment Manifest Items
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Resource Item</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDelivery.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {item.resource?.name || `Resource #${item.resourceId}`}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-blue-700">
                              {Number(item.quantity)} {item.resource?.unit || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery Status Update Controls */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 pt-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Update Delivery Transit Status
                  </h4>

                  {deliveryUpdateError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{deliveryUpdateError}</span>
                    </div>
                  )}

                  {getAllowedDeliveryTransitions(selectedDelivery.status).length === 0 ? (
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-500 italic text-xs">
                      This delivery is in terminal state ({selectedDelivery.status}). No further transitions allowed.
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateDeliveryStatusSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Select Next Status *
                        </label>
                        <select
                          required
                          value={deliveryNextStatus}
                          onChange={(e) => setDeliveryNextStatus(e.target.value as DeliveryStatus)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="" disabled>
                            -- Choose Delivery Status --
                          </option>
                          {getAllowedDeliveryTransitions(selectedDelivery.status).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSubmittingDeliveryStatus}
                          disabled={!deliveryNextStatus}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Update Delivery Status
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedDelivery(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
