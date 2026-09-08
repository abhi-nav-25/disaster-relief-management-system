export type CampOperationalStatus =
  | 'OPERATIONAL'
  | 'LIMITED'
  | 'FULL'
  | 'TEMPORARILY_CLOSED'
  | 'CLOSED';

export type RequestChannel = 'ONLINE' | 'PHONE' | 'SMS';

export type RequestVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ResourceRequestStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TeamStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type TaskType =
  | 'RESCUE'
  | 'EVACUATION'
  | 'MEDICAL_ASSISTANCE'
  | 'RESOURCE_DELIVERY';

export type TaskStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type InventoryTransactionType =
  | 'RECEIPT'
  | 'DELIVERY'
  | 'CONSUMPTION'
  | 'ADJUSTMENT';

export type DuplicateDecision =
  | 'PENDING'
  | 'CONFIRMED_DUPLICATE'
  | 'NOT_DUPLICATE'
  | 'DISMISSED';

export type DeliveryStatus =
  | 'PLANNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VERIFY'
  | 'REJECT'
  | 'ASSIGN'
  | 'OVERRIDE'
  | 'STATUS_CHANGE'
  | 'DUPLICATE_DECISION';

export interface ReliefCamp {
  id: number;
  officialCode: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  operationalStatus: CampOperationalStatus;
  currentOccupancy: number;
  operationalNotes?: string | null;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: number;
  name: string;
  description?: string | null;
  unit: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampInventory {
  id: number;
  campId: number;
  resourceId: number;
  quantity: string | number;
  resource: Resource;
  updatedAt?: string;
}

export interface ResourceRequestItem {
  id: number;
  requestId: number;
  resourceId: number;
  quantity: string | number;
  notes?: string | null;
  resource?: Resource;
}

export interface ResourceRequestAssignment {
  id: number;
  requestId: number;
  teamId: number;
  assignedById: number;
  assignedAt: string;
  unassignedAt?: string | null;
  notes?: string | null;
  team?: ReliefTeam;
  assignedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface ResourceRequest {
  id: number;
  campId: number;
  createdById?: number | null;
  channel: RequestChannel;
  description?: string | null;
  verificationStatus: RequestVerificationStatus;
  verifiedById?: number | null;
  verifiedAt?: string | null;
  priority: Priority;
  status: ResourceRequestStatus;
  camp?: ReliefCamp;
  items: ResourceRequestItem[];
  assignments?: ResourceRequestAssignment[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReliefTeamMember {
  id: number;
  userId: number;
  teamId: number;
  joinedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
}

export interface ReliefTeam {
  id: number;
  teamName: string;
  contactNumber: string;
  status: TeamStatus;
  members?: ReliefTeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskUpdate {
  id: number;
  taskId: number;
  updatedById: number;
  status: TaskStatus;
  outcome?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  clientEventId?: string | null;
  createdAt: string;
  updatedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface Task {
  id: number;
  teamId: number;
  assignedById: number;
  resourceRequestId?: number | null;
  type: TaskType;
  status: TaskStatus;
  title: string;
  description?: string | null;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  outcome?: string | null;
  assignedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  team?: ReliefTeam;
  resourceRequest?: ResourceRequest | null;
  updates?: TaskUpdate[];
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceDeliveryItem {
  id: number;
  deliveryId: number;
  resourceId: number;
  quantity: string | number;
  resource?: Resource;
}

export interface ResourceDelivery {
  id: number;
  requestId: number;
  campId: number;
  teamId: number;
  status: DeliveryStatus;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  notes?: string | null;
  items: ResourceDeliveryItem[];
  camp?: ReliefCamp;
  team?: ReliefTeam;
  request?: ResourceRequest;
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  serviceType: string;
  phoneNumber: string;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface RequestDuplicateCheck {
  id: number;
  originalRequestId: number;
  possibleDuplicateRequestId: number;
  decision: DuplicateDecision;
  reviewedById?: number | null;
  reviewedAt?: string | null;
  reason?: string | null;
  possibleDuplicateRequest?: ResourceRequest;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  action: AuditAction;
  entityType: string;
  entityId: number;
  performedById?: number | null;
  beforeData?: unknown;
  afterData?: unknown;
  description?: string | null;
  createdAt: string;
  performedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}
