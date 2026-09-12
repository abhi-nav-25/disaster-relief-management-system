import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Truck,
  FileSearch,
  Search,
  RefreshCw,
  MapPin,
  PlusCircle,
  Eye,
  Check,
  X,
  PhoneCall,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Services
import { resourceRequestService } from '../../services/resourceRequest.service';
import { duplicateCheckService } from '../../services/duplicateCheck.service';
import { assignmentService } from '../../services/assignment.service';
import { teamService } from '../../services/team.service';
import { taskService } from '../../services/task.service';
import { deliveryService } from '../../services/delivery.service';
import { auditLogService } from '../../services/auditLog.service';

// Types
import type {
  ResourceRequest,
  ReliefTeam,
  ResourceDelivery,
  AuditLog,
  RequestDuplicateCheck,
  Priority,
  RequestVerificationStatus,
  TeamStatus,
  DeliveryStatus,
  DuplicateDecision,
} from '../../types/models.types';

// Formatters
import {
  formatDate,
  getPriorityColor,
  getVerificationStatusColor,
  getRequestStatusColor,
  getTeamStatusColor,
  getDeliveryStatusColor,
} from '../../utils/formatters';

type TabKey =
  | 'requests'
  | 'assignments'
  | 'teams'
  | 'tasks'
  | 'deliveries'
  | 'duplicates'
  | 'audit';

export const ControlCentreDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab handling from Hash or State
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const hash = location.hash.replace('#', '');
    if (
      [
        'requests',
        'assignments',
        'teams',
        'tasks',
        'deliveries',
        'duplicates',
        'audit',
      ].includes(hash)
    ) {
      return hash as TabKey;
    }
    return 'requests';
  });

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (
      [
        'requests',
        'assignments',
        'teams',
        'tasks',
        'deliveries',
        'duplicates',
        'audit',
      ].includes(hash)
    ) {
      setActiveTab(hash as TabKey);
    }
  }, [location.hash]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    navigate(`/dashboard/control-centre#${tab}`, { replace: true });
  };

  // Global Data States
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [teams, setTeams] = useState<ReliefTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<ReliefTeam[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search and Filter States for Requests
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerification, setFilterVerification] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Modal / Detail States
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);

  // Verification & Priority Modal/Action State
  const [confirmVerifyModal, setConfirmVerifyModal] = useState<{
    request: ResourceRequest;
    status: RequestVerificationStatus;
  } | null>(null);

  // Duplicate Checks State
  const [activeDuplicateRequestId, setActiveDuplicateRequestId] = useState<number | null>(null);
  const [duplicateChecks, setDuplicateChecks] = useState<RequestDuplicateCheck[]>([]);
  const [isDetectingDuplicates, setIsDetectingDuplicates] = useState(false);
  const [reviewModalCheck, setReviewModalCheck] = useState<RequestDuplicateCheck | null>(null);
  const [reviewDecision, setReviewDecision] = useState<DuplicateDecision>('NOT_DUPLICATE');

  // Team Assignment State
  const [assignModalRequest, setAssignModalRequest] = useState<ResourceRequest | null>(null);
  const [selectedTeamIdToAssign, setSelectedTeamIdToAssign] = useState<number | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Task Creation State
  const [taskModalRequest, setTaskModalRequest] = useState<ResourceRequest | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAddress, setTaskAddress] = useState('');
  const [taskLat, setTaskLat] = useState('12.9165');
  const [taskLng, setTaskLng] = useState('79.1325');
  const [taskTeamId, setTaskTeamId] = useState<number | null>(null);

  // Delivery Dispatch State
  const [deliveryModalRequest, setDeliveryModalRequest] = useState<ResourceRequest | null>(null);
  const [deliveryTeamId, setDeliveryTeamId] = useState<number | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryItemQuantities, setDeliveryItemQuantities] = useState<Record<number, number>>({});
  const [requestDeliveries, setRequestDeliveries] = useState<ResourceDelivery[]>([]);
  const [viewDeliveriesRequestId, setViewDeliveriesRequestId] = useState<number | null>(null);

  // Audit Logs Filter State
  const [auditEntityTypeFilter, setAuditEntityTypeFilter] = useState('');
  const [auditEntityIdFilter, setAuditEntityIdFilter] = useState('');

  // Auto hide toast after 4 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Load All Primary Operational Data
  const loadAllOperationalData = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const [reqs, allTeams, availTeams, logs] = await Promise.all([
        resourceRequestService.getAllRequests().catch(() => []),
        teamService.getAllTeams().catch(() => []),
        assignmentService.getAvailableTeams().catch(() => []),
        auditLogService.getAuditLogs().catch(() => []),
      ]);
      setRequests(reqs);
      setTeams(allTeams);
      setAvailableTeams(availTeams);
      setAuditLogs(logs);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to sync central command data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllOperationalData();
  }, []);

  // 1. Verify / Reject Request Handler
  const handleVerifyRequest = async (
    requestId: number,
    verificationStatus: RequestVerificationStatus
  ) => {
    setActionLoading(true);
    try {
      const updated = await resourceRequestService.verifyRequest(requestId, verificationStatus);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedRequest && selectedRequest.id === updated.id) {
        setSelectedRequest(updated);
      }
      setSuccessToast(`Request #${requestId} has been marked as ${verificationStatus}.`);
      setConfirmVerifyModal(null);
      auditLogService.getAuditLogs().then(setAuditLogs).catch(() => {});
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Update Request Priority Handler
  const handleUpdatePriority = async (requestId: number, priority: Priority) => {
    setActionLoading(true);
    try {
      const updated = await resourceRequestService.updatePriority(requestId, priority);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedRequest && selectedRequest.id === updated.id) {
        setSelectedRequest(updated);
      }
      setSuccessToast(`Priority for Request #${requestId} updated to ${priority}.`);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Duplicate Detection & Review
  const handleRunDuplicateDetection = async (requestId: number) => {
    setIsDetectingDuplicates(true);
    setActiveDuplicateRequestId(requestId);
    try {
      const checks = await duplicateCheckService.detectDuplicates(requestId);
      setDuplicateChecks(checks);
      setSuccessToast(`Duplicate detection executed for Request #${requestId} (${checks.length} checks found).`);
      switchTab('duplicates');
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to run duplicate detection.');
    } finally {
      setIsDetectingDuplicates(false);
    }
  };

  const handleFetchDuplicateChecks = async (requestId: number) => {
    setActiveDuplicateRequestId(requestId);
    setIsDetectingDuplicates(true);
    try {
      const checks = await duplicateCheckService.getChecksForRequest(requestId);
      setDuplicateChecks(checks);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to fetch duplicate checks.');
    } finally {
      setIsDetectingDuplicates(false);
    }
  };

  const handleSubmitDuplicateReview = async () => {
    if (!reviewModalCheck) return;
    setActionLoading(true);
    try {
      const updatedCheck = await duplicateCheckService.reviewCheck(
        reviewModalCheck.id,
        reviewDecision
      );
      setDuplicateChecks((prev) =>
        prev.map((c) => (c.id === updatedCheck.id ? updatedCheck : c))
      );
      setSuccessToast(`Duplicate Check #${reviewModalCheck.id} reviewed as ${reviewDecision}.`);
      setReviewModalCheck(null);
      auditLogService.getAuditLogs().then(setAuditLogs).catch(() => {});
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to record duplicate review.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Team Assignment Handler
  const handleOpenAssignModal = (request: ResourceRequest) => {
    setAssignModalRequest(request);
    setAssignmentNotes('');
    if (availableTeams.length > 0) {
      setSelectedTeamIdToAssign(availableTeams[0].id);
    } else {
      setSelectedTeamIdToAssign(null);
    }
  };

  const handleAssignTeam = async () => {
    if (!assignModalRequest || !selectedTeamIdToAssign) return;
    setActionLoading(true);
    try {
      await assignmentService.assignTeam(
        assignModalRequest.id,
        selectedTeamIdToAssign,
        assignmentNotes || undefined
      );
      setSuccessToast(
        `Relief Team #${selectedTeamIdToAssign} assigned to Request #${assignModalRequest.id}.`
      );
      setAssignModalRequest(null);
      await loadAllOperationalData();
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to assign team to request.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Team Status Management
  const handleUpdateTeamStatus = async (teamId: number, status: TeamStatus) => {
    setActionLoading(true);
    try {
      const updated = await teamService.updateTeamStatus(teamId, status);
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setAvailableTeams((prev) => {
        if (status === 'AVAILABLE') {
          return prev.some((t) => t.id === updated.id) ? prev : [...prev, updated];
        } else {
          return prev.filter((t) => t.id !== updated.id);
        }
      });
      setSuccessToast(`Team "${updated.teamName}" status updated to ${status}.`);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to update team status.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Create Task Handler
  const handleOpenTaskModal = (request: ResourceRequest) => {
    setTaskModalRequest(request);
    setTaskTitle(`Delivery Task for Request #${request.id} - ${request.camp?.name || 'Camp'}`);
    setTaskDescription(request.description || 'Dispatch required resource commodities to shelter.');
    setTaskAddress(request.camp?.address || '');
    setTaskLat(String(request.camp?.latitude || 12.9165));
    setTaskLng(String(request.camp?.longitude || 79.1325));
    const assignedTeamId =
      request.assignments && request.assignments.length > 0
        ? request.assignments[0].teamId
        : teams[0]?.id || null;
    setTaskTeamId(assignedTeamId);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskModalRequest || !taskTeamId) {
      setGlobalError('Please select an assigned team and provide task details.');
      return;
    }
    setActionLoading(true);
    try {
      const newTask = await taskService.createTask({
        teamId: taskTeamId,
        resourceRequestId: taskModalRequest.id,
        title: taskTitle,
        description: taskDescription,
        locationAddress: taskAddress,
        latitude: parseFloat(taskLat) || 12.9165,
        longitude: parseFloat(taskLng) || 79.1325,
      });
      setSuccessToast(`Task "${newTask.title}" dispatched successfully.`);
      setTaskModalRequest(null);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to create tactical task.');
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Delivery Management Handler
  const handleOpenDeliveryModal = (request: ResourceRequest) => {
    setDeliveryModalRequest(request);
    setDeliveryNotes('');
    const assignedTeamId =
      request.assignments && request.assignments.length > 0
        ? request.assignments[0].teamId
        : null;
    setDeliveryTeamId(assignedTeamId);
    const initQty: Record<number, number> = {};
    if (request.items) {
      request.items.forEach((item) => {
        initQty[item.resourceId] = Number(item.quantity);
      });
    }
    setDeliveryItemQuantities(initQty);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalRequest || !deliveryTeamId) {
      setGlobalError('Please select a team assigned to this request.');
      return;
    }

    const itemsPayload = Object.entries(deliveryItemQuantities)
      .map(([resId, qty]) => ({
        resourceId: Number(resId),
        quantity: Number(qty),
      }))
      .filter((i) => i.quantity > 0);

    if (itemsPayload.length === 0) {
      setGlobalError('Please provide a quantity greater than zero for at least one commodity.');
      return;
    }

    setActionLoading(true);
    try {
      const newDelivery = await deliveryService.createDelivery({
        requestId: deliveryModalRequest.id,
        teamId: deliveryTeamId,
        notes: deliveryNotes || undefined,
        items: itemsPayload,
      });
      setSuccessToast(`Resource Delivery #${newDelivery.id} logged as PLANNED.`);
      setDeliveryModalRequest(null);
      await loadAllOperationalData();
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to create resource delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDeliveries = async (requestId: number) => {
    setViewDeliveriesRequestId(requestId);
    try {
      const delivs = await deliveryService.getDeliveriesForRequest(requestId);
      setRequestDeliveries(delivs);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to fetch request deliveries.');
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: number, status: DeliveryStatus) => {
    setActionLoading(true);
    try {
      const updated = await deliveryService.updateDeliveryStatus(deliveryId, status);
      setRequestDeliveries((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setSuccessToast(`Delivery #${deliveryId} status updated to ${status}.`);
      await loadAllOperationalData();
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to update delivery status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Requests Computation
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchQuery === '' ||
      String(req.id).includes(searchQuery) ||
      (req.camp?.name && req.camp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.camp?.officialCode && req.camp.officialCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.description && req.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVerification =
      filterVerification === 'ALL' || req.verificationStatus === filterVerification;

    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;

    const matchesPriority = filterPriority === 'ALL' || req.priority === filterPriority;

    return matchesSearch && matchesVerification && matchesStatus && matchesPriority;
  });

  // Filtered Audit Logs Computation
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesType =
      !auditEntityTypeFilter ||
      log.entityType.toLowerCase().includes(auditEntityTypeFilter.toLowerCase());
    const matchesId =
      !auditEntityIdFilter || String(log.entityId) === auditEntityIdFilter;
    return matchesType && matchesId;
  });

  // Live KPI Calculations from REAL backend data
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const unverifiedRequestsCount = requests.filter(
    (r) => r.verificationStatus === 'PENDING'
  ).length;
  const criticalHighPriorityCount = requests.filter(
    (r) => r.priority === 'CRITICAL' || r.priority === 'HIGH'
  ).length;
  const availableTeamsCount = availableTeams.length;

  return (
    <div className="space-y-6">
      {/* Central Command Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 rounded-2xl text-white p-6 sm:p-8 shadow-lg border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                NATIONAL DISASTER GRID COMMAND
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">ONLINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Control Centre Incident Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Operator: <strong className="text-white">{user?.name}</strong> ({user?.email}) • Centralized relief demand verification, heuristic duplicate detection, team dispatching, and logistics fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAllOperationalData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-400/30 shadow-sm transition-all cursor-pointer"
              title="Refresh Central Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Command Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value={isLoading ? '...' : `${pendingRequestsCount} Pending`}
          icon={ClipboardList}
          colorScheme="amber"
          description={`${unverifiedRequestsCount} require verification`}
        />
        <StatCard
          title="High / Critical Demands"
          value={isLoading ? '...' : `${criticalHighPriorityCount} Priority`}
          icon={AlertTriangle}
          colorScheme="rose"
          description="Requires immediate team deployment"
        />
        <StatCard
          title="Available Relief Teams"
          value={isLoading ? '...' : `${availableTeamsCount} / ${teams.length} Standby`}
          icon={Users}
          colorScheme="emerald"
          description="Ready for task assignment"
        />
        <StatCard
          title="Audit Trail Records"
          value={isLoading ? '...' : `${auditLogs.length} Events`}
          icon={FileSearch}
          colorScheme="blue"
          description="Immutable operational audit history"
        />
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => switchTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'requests'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Resource Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => switchTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Assignments ({availableTeams.length} available)</span>
        </button>

        <button
          onClick={() => switchTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'teams'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Teams Master ({teams.length})</span>
        </button>

        <button
          onClick={() => switchTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Field Task Dispatch</span>
        </button>

        <button
          onClick={() => switchTab('deliveries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'deliveries'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery Dispatches</span>
        </button>

        <button
          onClick={() => switchTab('duplicates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'duplicates'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Duplicate Reviews {duplicateChecks.length > 0 && `(${duplicateChecks.length})`}</span>
        </button>

        <button
          onClick={() => switchTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'border-indigo-600 bg-white text-indigo-700 shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESOURCE REQUESTS & VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search request ID, camp name, code..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Verification</option>
                <option value="PENDING">Pending Verification</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Request Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</option>
                <option value="FULFILLED">FULFILLED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Requests Table / Card View */}
          {isLoading ? (
            <LoadingSpinner size="lg" label="Loading resource requests queue..." />
          ) : filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">No Resource Requests Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                There are no resource requests matching your filter criteria.
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Req #</th>
                      <th className="px-4 py-3.5">Camp Location</th>
                      <th className="px-4 py-3.5">Items Requested</th>
                      <th className="px-4 py-3.5">Priority</th>
                      <th className="px-4 py-3.5">Verification</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Created At</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">
                          #{req.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{req.camp?.name || `Camp #${req.campId}`}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {req.camp?.address || req.camp?.officialCode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {req.items && req.items.length > 0 ? (
                              req.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="font-semibold text-slate-800">
                                    {Number(item.quantity)} {item.resource?.unit || 'units'}
                                  </span>
                                  <span className="text-slate-500">
                                    {item.resource?.name || `Resource #${item.resourceId}`}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No items</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={req.priority}
                            onChange={(e) => handleUpdatePriority(req.id, e.target.value as Priority)}
                            disabled={actionLoading}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${getPriorityColor(
                              req.priority
                            )}`}
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getVerificationStatusColor(
                              req.verificationStatus
                            )}`}
                          >
                            {req.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRequestStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setRequestDetailsOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="View Request Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {req.verificationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmVerifyModal({ request: req, status: 'VERIFIED' })
                                  }
                                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                                  title="Approve / Verify Request"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmVerifyModal({ request: req, status: 'REJECTED' })
                                  }
                                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer"
                                  title="Reject Request"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleRunDuplicateDetection(req.id)}
                              className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer"
                              title="Run Duplicate Detection"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            {req.verificationStatus === 'VERIFIED' && req.status === 'PENDING' && (
                              <button
                                onClick={() => handleOpenAssignModal(req)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Assign Team
                              </button>
                            )}

                            {(req.status === 'ASSIGNED' || req.status === 'IN_PROGRESS') && (
                              <button
                                onClick={() => handleOpenDeliveryModal(req)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Dispatch
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEAM ASSIGNMENTS & AVAILABLE TEAMS */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Available Teams Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Standby Relief Teams Available for Deployment ({availableTeams.length})
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadAllOperationalData}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Teams</span>
              </Button>
            </div>

            {availableTeams.length === 0 ? (
              <Card className="text-center py-8 text-xs text-slate-500">
                No relief teams currently in AVAILABLE status. Teams are either BUSY or OFFLINE.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableTeams.map((team) => (
                  <Card key={team.id} className="border-emerald-200 bg-emerald-50/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{team.teamName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {team.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <p className="flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>{team.contactNumber}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Members Assigned: {team.members?.length || 0}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Verified Requests Awaiting Assignment */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Verified Requests Pending Team Assignment
            </h3>

            {requests.filter((r) => r.verificationStatus === 'VERIFIED' && r.status === 'PENDING')
              .length === 0 ? (
              <Card className="text-center py-8 text-xs text-slate-500">
                No unassigned verified requests in the queue.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests
                  .filter((r) => r.verificationStatus === 'VERIFIED' && r.status === 'PENDING')
                  .map((req) => (
                    <Card key={req.id} className="flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600 text-xs">Request #{req.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(
                              req.priority
                            )}`}
                          >
                            {req.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{req.camp?.name}</h4>
                        <p className="text-xs text-slate-500">{req.camp?.address}</p>

                        <div className="pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 font-semibold uppercase text-[10px]">
                            Commodities:
                          </span>
                          <div className="space-y-0.5 mt-1">
                            {req.items?.map((item) => (
                              <div key={item.id} className="text-slate-700">
                                • {Number(item.quantity)} {item.resource?.unit || 'units'}{' '}
                                {item.resource?.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAssignModal(req)}
                          className="w-full text-xs"
                          disabled={availableTeams.length === 0}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Assign Available Relief Team</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RELIEF TEAMS MASTER */}
      {/* ========================================================================= */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              All Relief Teams & Operational Status Control ({teams.length})
            </h3>
            <Button variant="secondary" size="sm" onClick={loadAllOperationalData} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Statuses</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Team #{team.id}</span>
                      <h4 className="font-bold text-slate-900 text-base">{team.teamName}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getTeamStatusColor(
                        team.status
                      )}`}
                    >
                      {team.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact: <strong>{team.contactNumber}</strong></span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Created: {formatDate(team.createdAt)}
                    </p>
                  </div>

                  {/* Members list */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Deployed Personnel ({team.members?.length || 0}):
                    </span>
                    <div className="space-y-1 mt-1">
                      {team.members && team.members.length > 0 ? (
                        team.members.map((m) => (
                          <div key={m.id} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>{m.user?.name || `User #${m.userId}`}</span>
                            <span className="text-[10px] text-slate-400">({m.user?.phone || 'No phone'})</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No assigned personnel yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="pt-4 border-t border-slate-100 mt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    Update Team Operational State:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleUpdateTeamStatus(team.id, 'AVAILABLE')}
                      disabled={actionLoading || team.status === 'AVAILABLE'}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        team.status === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      AVAILABLE
                    </button>
                    <button
                      onClick={() => handleUpdateTeamStatus(team.id, 'BUSY')}
                      disabled={actionLoading || team.status === 'BUSY'}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        team.status === 'BUSY'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      BUSY
                    </button>
                    <button
                      onClick={() => handleUpdateTeamStatus(team.id, 'OFFLINE')}
                      disabled={actionLoading || team.status === 'OFFLINE'}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        team.status === 'OFFLINE'
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      OFFLINE
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FIELD TASK DISPATCH */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Create & Dispatch Tactical Field Task
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-6 max-w-2xl">
              Dispatch formal execution orders to relief teams with GPS targets and resource delivery objectives.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Target Resource Request *
                  </label>
                  <select
                    value={taskModalRequest?.id || ''}
                    onChange={(e) => {
                      const req = requests.find((r) => r.id === Number(e.target.value));
                      if (req) handleOpenTaskModal(req);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a resource request...</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        Request #{r.id} - {r.camp?.name} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Assigned Relief Team *
                  </label>
                  <select
                    value={taskTeamId || ''}
                    onChange={(e) => setTaskTeamId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Water Tanker Delivery to Camp Alpha"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Task Execution Instructions
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide tactical notes, emergency contact, or delivery verification instructions..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={taskAddress}
                  onChange={(e) => setTaskAddress(e.target.value)}
                  placeholder="Relief Camp Street Address"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={taskLat}
                    onChange={(e) => setTaskLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={taskLng}
                    onChange={(e) => setTaskLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <MapPin className="w-4 h-4" />
                <span>Issue & Dispatch Task Order</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DELIVERY DISPATCHES & LOGISTICS */}
      {/* ========================================================================= */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Resource Delivery Dispatch Management
                </h3>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Select Resource Request to View & Dispatch Deliveries:
              </label>
              <select
                value={viewDeliveriesRequestId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) handleViewDeliveries(id);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a request...</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    Request #{r.id} - {r.camp?.name} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            {viewDeliveriesRequestId && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Deliveries for Request #{viewDeliveriesRequestId} ({requestDeliveries.length})
                  </h4>
                  {requests.find((r) => r.id === viewDeliveriesRequestId) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const r = requests.find((req) => req.id === viewDeliveriesRequestId);
                        if (r) handleOpenDeliveryModal(r);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log New Delivery Batch</span>
                    </Button>
                  )}
                </div>

                {requestDeliveries.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No delivery batches logged for this request yet. Click "Log New Delivery Batch" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestDeliveries.map((deliv) => (
                      <Card key={deliv.id} className="flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">
                              Delivery Batch #{deliv.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDeliveryStatusColor(
                                deliv.status
                              )}`}
                            >
                              {deliv.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <p>Assigned Team: <strong>{deliv.team?.teamName || `Team #${deliv.teamId}`}</strong></p>
                            <p>Created: {formatDate(deliv.createdAt)}</p>
                            {deliv.notes && <p className="italic text-slate-500">"{deliv.notes}"</p>}
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Manifest Items:
                            </span>
                            <div className="space-y-1 mt-1">
                              {deliv.items?.map((item) => (
                                <div key={item.id} className="text-xs font-semibold text-slate-700">
                                  • {Number(item.quantity)} {item.resource?.unit || 'units'}{' '}
                                  {item.resource?.name || `Resource #${item.resourceId}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Transition Status:
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {['IN_TRANSIT', 'DELIVERED', 'PARTIALLY_DELIVERED', 'FAILED', 'CANCELLED'].map(
                              (st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateDeliveryStatus(deliv.id, st as DeliveryStatus)}
                                  disabled={actionLoading || deliv.status === st}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                                    deliv.status === st
                                      ? 'bg-slate-800 text-white border-slate-800'
                                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DUPLICATE REVIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Automated Duplicate Request Heuristic Checks
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-2xl">
              Inspect overlapping relief demands detected within the same camp location and submit formal review determinations.
            </p>

            <div className="flex flex-wrap items-end gap-3 max-w-xl">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Target Request:
                </label>
                <select
                  value={activeDuplicateRequestId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (id) handleFetchDuplicateChecks(id);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="">Select a request...</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      Request #{r.id} - {r.camp?.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (activeDuplicateRequestId) {
                    handleRunDuplicateDetection(activeDuplicateRequestId);
                  }
                }}
                disabled={!activeDuplicateRequestId}
                isLoading={isDetectingDuplicates}
                className="bg-purple-600 hover:bg-purple-700 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Heuristic Similarity Check</span>
              </Button>
            </div>

            {isDetectingDuplicates ? (
              <LoadingSpinner size="md" label="Analyzing duplicate request vectors..." />
            ) : duplicateChecks.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                {activeDuplicateRequestId
                  ? 'No potential duplicate requests detected for this target request.'
                  : 'Select a request above to run or view duplicate checks.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {duplicateChecks.map((check) => (
                  <Card key={check.id} className="border-purple-200 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-900">Check #{check.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            check.decision === 'CONFIRMED_DUPLICATE'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : check.decision === 'NOT_DUPLICATE'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {check.decision}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <p>Original Request: <strong>#{check.originalRequestId}</strong></p>
                        <p>Potential Duplicate: <strong>#{check.possibleDuplicateRequestId}</strong></p>
                        {check.reason && <p className="italic text-slate-500">"{check.reason}"</p>}
                        {check.reviewedAt && (
                          <p className="text-[11px] text-slate-400">
                            Reviewed: {formatDate(check.reviewedAt)} by Operator #{check.reviewedById}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReviewModalCheck(check);
                          setReviewDecision(check.decision);
                        }}
                        className="w-full text-xs text-purple-700 hover:bg-purple-50 border-purple-200"
                      >
                        <span>Record Review Decision</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AUDIT LOGS TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={auditEntityTypeFilter}
                onChange={(e) => setAuditEntityTypeFilter(e.target.value)}
                placeholder="Filter by Entity Type (e.g. ResourceRequest)..."
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={auditEntityIdFilter}
                onChange={(e) => setAuditEntityIdFilter(e.target.value)}
                placeholder="Filter by Entity ID..."
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-36"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => auditLogService.getAuditLogs().then(setAuditLogs)}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Trail</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Log #</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-500">#{log.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {log.entityType} #{log.entityId}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-md">{log.description}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {log.performedBy?.name || `User #${log.performedById}`}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST DETAILS */}
      {/* ========================================================================= */}
      {requestDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Resource Request</span>
                <h3 className="text-xl font-bold text-slate-900">Request #{selectedRequest.id}</h3>
              </div>
              <button
                onClick={() => setRequestDetailsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Priority</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.priority}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Verification</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.verificationStatus}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Status</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.status}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Channel</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.channel}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Requesting Camp</span>
              <p className="font-bold text-slate-900">{selectedRequest.camp?.name}</p>
              <p className="text-slate-600">{selectedRequest.camp?.address}</p>
            </div>

            {selectedRequest.description && (
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Notes / Reason</span>
                <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 italic border border-slate-100">
                  "{selectedRequest.description}"
                </p>
              </div>
            )}

            {/* Requested Items Table */}
            <div className="space-y-2">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Requested Commodities</span>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Resource Name</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {selectedRequest.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-semibold">
                          {item.resource?.name || `Resource #${item.resourceId}`}
                        </td>
                        <td className="px-3 py-2 font-bold text-indigo-700">
                          {Number(item.quantity)} {item.resource?.unit}
                        </td>
                        <td className="px-3 py-2 text-slate-500 italic">{item.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons inside Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedRequest.verificationStatus === 'PENDING' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRequestDetailsOpen(false);
                        setConfirmVerifyModal({ request: selectedRequest, status: 'VERIFIED' });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify Request</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setRequestDetailsOpen(false);
                        setConfirmVerifyModal({ request: selectedRequest, status: 'REJECTED' });
                      }}
                      className="text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Request</span>
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRequestDetailsOpen(false)}
                className="text-xs"
              >
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM VERIFICATION / REJECTION */}
      {/* ========================================================================= */}
      {confirmVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              {confirmVerifyModal.status === 'VERIFIED' ? (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Confirm {confirmVerifyModal.status} Decision
                </h4>
                <p className="text-xs text-slate-500">Resource Request #{confirmVerifyModal.request.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to mark this request as{' '}
              <strong className="text-slate-900">{confirmVerifyModal.status}</strong>? This decision will be logged permanently in the incident audit trail.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmVerifyModal(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant={confirmVerifyModal.status === 'VERIFIED' ? 'primary' : 'danger'}
                size="sm"
                isLoading={actionLoading}
                onClick={() =>
                  handleVerifyRequest(confirmVerifyModal.request.id, confirmVerifyModal.status)
                }
                className="text-xs"
              >
                Confirm Decision
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN TEAM TO REQUEST */}
      {/* ========================================================================= */}
      {assignModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Assignment Workflow</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Assign Team to Request #{assignModalRequest.id}
                </h3>
              </div>
              <button
                onClick={() => setAssignModalRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Select Available Relief Team *
                </label>
                {availableTeams.length === 0 ? (
                  <p className="text-rose-600 italic">No teams in AVAILABLE status right now.</p>
                ) : (
                  <select
                    value={selectedTeamIdToAssign || ''}
                    onChange={(e) => setSelectedTeamIdToAssign(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName} (Phone: {team.contactNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Assignment Mission Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={2}
                  placeholder="Special instructions, priority routes, dispatch checkpoints..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAssignModalRequest(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedTeamIdToAssign || availableTeams.length === 0}
                isLoading={actionLoading}
                onClick={handleAssignTeam}
                className="text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                Confirm Team Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RECORD DUPLICATE REVIEW DECISION */}
      {/* ========================================================================= */}
      {reviewModalCheck && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-base">
                Duplicate Review Decision (Check #{reviewModalCheck.id})
              </h4>
              <button
                onClick={() => setReviewModalCheck(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Comparing Request <strong>#{reviewModalCheck.originalRequestId}</strong> with Request{' '}
                <strong>#{reviewModalCheck.possibleDuplicateRequestId}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Determination Decision *
                </label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as DuplicateDecision)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                >
                  <option value="NOT_DUPLICATE">NOT_DUPLICATE (Legitimate Separate Request)</option>
                  <option value="CONFIRMED_DUPLICATE">CONFIRMED_DUPLICATE (Redundant Request)</option>
                  <option value="DISMISSED">DISMISSED (Dismiss from Review Queue)</option>
                  <option value="PENDING">PENDING (Keep Pending)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewModalCheck(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleSubmitDuplicateReview}
                className="text-xs bg-purple-600 hover:bg-purple-700"
              >
                Save Review Determination
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CREATE RESOURCE DELIVERY */}
      {/* ========================================================================= */}
      {deliveryModalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Logistics Dispatch</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Create Resource Delivery for Request #{deliveryModalRequest.id}
                </h3>
              </div>
              <button
                onClick={() => setDeliveryModalRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Executing Relief Team *
                </label>
                <select
                  value={deliveryTeamId || ''}
                  onChange={(e) => setDeliveryTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                  required
                >
                  <option value="">Select assigned team...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Delivery Quantities per Commodity *
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {deliveryModalRequest.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-semibold text-slate-900">
                          {item.resource?.name || `Resource #${item.resourceId}`}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Requested: {Number(item.quantity)} {item.resource?.unit}
                        </p>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          max={Number(item.quantity)}
                          value={deliveryItemQuantities[item.resourceId] || ''}
                          onChange={(e) =>
                            setDeliveryItemQuantities({
                              ...deliveryItemQuantities,
                              [item.resourceId]: Number(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold text-right"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Logistics Notes (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Truck registration, convoy number, driver contact..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeliveryModalRequest(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm & Dispatch Delivery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
