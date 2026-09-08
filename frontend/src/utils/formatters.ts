import type { UserRole } from '../types/auth.types';
import type {
  CampOperationalStatus,
  DeliveryStatus,
  Priority,
  RequestVerificationStatus,
  ResourceRequestStatus,
  TaskStatus,
  TeamStatus,
} from '../types/models.types';

export const formatRoleName = (role?: UserRole | string): string => {
  if (!role) return 'Unknown';
  switch (role) {
    case 'CITIZEN':
      return 'Citizen';
    case 'RELIEF_CAMP_MANAGER':
      return 'Relief Camp Manager';
    case 'CONTROL_CENTRE_OPERATOR':
      return 'Control Centre Operator';
    case 'DMA_SUPERVISOR':
      return 'DMA Supervisor';
    case 'RELIEF_TEAM':
      return 'Relief Team Member';
    default:
      return role.replace(/_/g, ' ');
  }
};

export const getRoleBadgeColor = (role?: UserRole | string): string => {
  switch (role) {
    case 'DMA_SUPERVISOR':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'CONTROL_CENTRE_OPERATOR':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'RELIEF_CAMP_MANAGER':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'RELIEF_TEAM':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CITIZEN':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getCampStatusColor = (status: CampOperationalStatus | string): string => {
  switch (status) {
    case 'OPERATIONAL':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'LIMITED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'FULL':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'TEMPORARILY_CLOSED':
    case 'CLOSED':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getPriorityColor = (priority: Priority | string): string => {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-rose-600 text-white font-semibold';
    case 'HIGH':
      return 'bg-rose-100 text-rose-800 border-rose-200 font-medium';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 border-amber-200 font-medium';
    case 'LOW':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getVerificationStatusColor = (
  status: RequestVerificationStatus | string
): string => {
  switch (status) {
    case 'VERIFIED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'PENDING':
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
};

export const getTaskStatusColor = (status: TaskStatus | string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ACCEPTED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'ASSIGNED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getDeliveryStatusColor = (status: DeliveryStatus | string): string => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PARTIALLY_DELIVERED':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'IN_TRANSIT':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PLANNED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getTeamStatusColor = (status: TeamStatus | string): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'BUSY':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'OFFLINE':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getRequestStatusColor = (status: ResourceRequestStatus | string): string => {
  switch (status) {
    case 'FULFILLED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PARTIALLY_FULFILLED':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ASSIGNED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const getRoleDashboardPath = (role?: UserRole): string => {
  switch (role) {
    case 'CITIZEN':
      return '/dashboard/citizen';
    case 'RELIEF_CAMP_MANAGER':
      return '/dashboard/camp-manager';
    case 'CONTROL_CENTRE_OPERATOR':
      return '/dashboard/control-centre';
    case 'DMA_SUPERVISOR':
      return '/dashboard/dma';
    case 'RELIEF_TEAM':
      return '/dashboard/team';
    default:
      return '/';
  }
};
