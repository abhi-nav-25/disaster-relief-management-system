import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  Layers,
  ClipboardList,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  X,
  FileText,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  getCampStatusColor,
  getPriorityColor,
  getRequestStatusColor,
  getVerificationStatusColor,
  formatDate,
} from '../../utils/formatters';
import { campManagerService, type UpdateCampStatusPayload } from '../../services/campManager.service';
import { inventoryService, type UpdateInventoryPayload } from '../../services/inventory.service';
import { resourceRequestService } from '../../services/resourceRequest.service';
import { resourceService } from '../../services/resource.service';
import type {
  CampInventory,
  Resource,
  ResourceRequest,
  CampOperationalStatus,
  InventoryTransactionType,
} from '../../types/models.types';

export const CampManagerDashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const camp = user?.managedCamp;

  // Active Tab: 'overview' | 'inventory' | 'requests'
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'requests'>('overview');

  // Core Data States
  const [inventory, setInventory] = useState<CampInventory[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');

  // Modal States
  const [isCampStatusModalOpen, setIsCampStatusModalOpen] = useState<boolean>(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState<boolean>(false);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState<boolean>(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<ResourceRequest | null>(null);
  const [isLoadingRequestDetails, setIsLoadingRequestDetails] = useState<boolean>(false);

  // Form States - Camp Status Update
  const [campFormOccupancy, setCampFormOccupancy] = useState<number>(camp?.currentOccupancy || 0);
  const [campFormStatus, setCampFormStatus] = useState<CampOperationalStatus>(
    (camp?.operationalStatus as CampOperationalStatus) || 'OPERATIONAL'
  );
  const [campFormNotes, setCampFormNotes] = useState<string>(camp?.operationalNotes || '');
  const [isSubmittingCampStatus, setIsSubmittingCampStatus] = useState<boolean>(false);
  const [campStatusError, setCampStatusError] = useState<string | null>(null);

  // Form States - Inventory Update
  const [invFormResourceId, setInvFormResourceId] = useState<number>(0);
  const [invFormQuantity, setInvFormQuantity] = useState<number>(1);
  const [invFormType, setInvFormType] = useState<InventoryTransactionType>('RECEIPT');
  const [invFormNotes, setInvFormNotes] = useState<string>('');
  const [isSubmittingInventory, setIsSubmittingInventory] = useState<boolean>(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // Form States - Create Resource Request
  const [reqFormDescription, setReqFormDescription] = useState<string>('');
  const [reqFormItems, setReqFormItems] = useState<{ resourceId: number; quantity: number; notes: string }[]>([
    { resourceId: 0, quantity: 1, notes: '' },
  ]);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);
  const [createRequestError, setCreateRequestError] = useState<string | null>(null);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Synchronize campForm state when user/camp updates
  useEffect(() => {
    if (camp) {
      setCampFormOccupancy(camp.currentOccupancy ?? 0);
      setCampFormStatus((camp.operationalStatus as CampOperationalStatus) || 'OPERATIONAL');
      setCampFormNotes(camp.operationalNotes || '');
    }
  }, [camp]);

  // Fetch all dashboard data from real backend endpoints
  const loadDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [inventoryData, requestsData, resourcesData] = await Promise.all([
        inventoryService.getMyCampInventory(),
        resourceRequestService.getMyCampRequests(),
        resourceService.getAllResources(),
      ]);

      setInventory(inventoryData);
      setRequests(requestsData);
      setAllResources(resourcesData.filter((r) => r.isActive));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load camp manager data';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handlers for Camp Operational Status Update
  const handleOpenCampStatusModal = () => {
    if (camp) {
      setCampFormOccupancy(camp.currentOccupancy ?? 0);
      setCampFormStatus((camp.operationalStatus as CampOperationalStatus) || 'OPERATIONAL');
      setCampFormNotes(camp.operationalNotes || '');
    }
    setCampStatusError(null);
    setIsCampStatusModalOpen(true);
  };

  const handleUpdateCampStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampStatusError(null);

    if (campFormOccupancy < 0 || !Number.isInteger(Number(campFormOccupancy))) {
      setCampStatusError('Occupancy must be a non-negative whole number.');
      return;
    }

    setIsSubmittingCampStatus(true);
    try {
      const payload: UpdateCampStatusPayload = {
        currentOccupancy: Number(campFormOccupancy),
        operationalStatus: campFormStatus,
        operationalNotes: campFormNotes.trim() || undefined,
      };

      await campManagerService.updateCampStatus(payload);
      await refreshProfile();
      setSuccessMessage('Camp operational status updated successfully.');
      setIsCampStatusModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update camp status.';
      setCampStatusError(msg);
    } finally {
      setIsSubmittingCampStatus(false);
    }
  };

  // Handlers for Inventory Update
  const handleOpenInventoryModal = (resourceId?: number) => {
    setInventoryError(null);
    if (resourceId) {
      setInvFormResourceId(resourceId);
    } else if (allResources.length > 0) {
      setInvFormResourceId(allResources[0].id);
    }
    setInvFormQuantity(1);
    setInvFormType('RECEIPT');
    setInvFormNotes('');
    setIsInventoryModalOpen(true);
  };

  const handleUpdateInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryError(null);

    if (!invFormResourceId || invFormResourceId <= 0) {
      setInventoryError('Please select a valid resource.');
      return;
    }

    if (!invFormQuantity || invFormQuantity <= 0) {
      setInventoryError('Quantity must be greater than 0.');
      return;
    }

    setIsSubmittingInventory(true);
    try {
      const payload: UpdateInventoryPayload = {
        quantity: Number(invFormQuantity),
        transactionType: invFormType,
        notes: invFormNotes.trim() || undefined,
      };

      await inventoryService.updateInventory(invFormResourceId, payload);
      setSuccessMessage('Inventory updated successfully.');
      setIsInventoryModalOpen(false);
      // Reload inventory & requests data
      const updatedInv = await inventoryService.getMyCampInventory();
      setInventory(updatedInv);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update inventory.';
      setInventoryError(msg);
    } finally {
      setIsSubmittingInventory(false);
    }
  };

  // Handlers for Create Resource Request
  const handleOpenCreateRequestModal = () => {
    setCreateRequestError(null);
    setReqFormDescription('');
    const firstResourceId = allResources.length > 0 ? allResources[0].id : 0;
    setReqFormItems([{ resourceId: firstResourceId, quantity: 1, notes: '' }]);
    setIsCreateRequestModalOpen(true);
  };

  const handleAddItemToRequest = () => {
    const available = allResources.find(
      (r) => !reqFormItems.some((item) => item.resourceId === r.id)
    );
    const nextResourceId = available ? available.id : allResources[0]?.id || 0;
    setReqFormItems([...reqFormItems, { resourceId: nextResourceId, quantity: 1, notes: '' }]);
  };

  const handleRemoveItemFromRequest = (index: number) => {
    if (reqFormItems.length <= 1) return;
    setReqFormItems(reqFormItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'resourceId' | 'quantity' | 'notes', value: any) => {
    const updated = [...reqFormItems];
    updated[index] = { ...updated[index], [field]: value };
    setReqFormItems(updated);
  };

  const handleCreateRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRequestError(null);

    if (reqFormItems.length === 0) {
      setCreateRequestError('At least one resource item is required.');
      return;
    }

    // Validate resource items
    const resourceIds = reqFormItems.map((item) => Number(item.resourceId));
    if (resourceIds.some((id) => !id || id <= 0)) {
      setCreateRequestError('Please select a valid resource for each item.');
      return;
    }

    if (new Set(resourceIds).size !== resourceIds.length) {
      setCreateRequestError('A resource can only appear once in a request. Please combine duplicate items.');
      return;
    }

    for (const item of reqFormItems) {
      if (!item.quantity || Number(item.quantity) <= 0) {
        setCreateRequestError('Every requested item must have a quantity greater than zero.');
        return;
      }
    }

    setIsSubmittingRequest(true);
    try {
      await resourceRequestService.createRequest({
        channel: 'ONLINE',
        description: reqFormDescription.trim() || undefined,
        items: reqFormItems.map((item) => ({
          resourceId: Number(item.resourceId),
          quantity: Number(item.quantity),
          notes: item.notes.trim() || undefined,
        })),
      });

      setSuccessMessage('Resource request submitted to Control Centre successfully.');
      setIsCreateRequestModalOpen(false);
      // Reload requests
      const updatedRequests = await resourceRequestService.getMyCampRequests();
      setRequests(updatedRequests);
      setActiveTab('requests');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create resource request.';
      setCreateRequestError(msg);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // View Request Details Handler
  const handleOpenRequestDetails = async (req: ResourceRequest) => {
    setSelectedRequestForDetails(req);
    setIsLoadingRequestDetails(true);
    try {
      const fullDetails = await resourceRequestService.getRequestById(req.id);
      setSelectedRequestForDetails(fullDetails);
    } catch {
      // Fallback to currently selected object
    } finally {
      setIsLoadingRequestDetails(false);
    }
  };

  // Derived Values (Only derived from real backend data)
  const capacity = camp?.capacity ?? 0;
  const currentOccupancy = camp?.currentOccupancy ?? 0;
  const occupancyPercentage =
    capacity > 0 ? Math.min(Math.round((currentOccupancy / capacity) * 100), 100) : 0;
  const remainingBeds = Math.max(capacity - currentOccupancy, 0);

  const totalResourceTypes = inventory.length;
  const zeroStockResources = inventory.filter((item) => Number(item.quantity) === 0).length;
  const pendingRequestsCount = requests.filter(
    (r) => r.verificationStatus === 'PENDING' || r.status === 'PENDING'
  ).length;

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    if (!inventorySearch.trim()) return true;
    const term = inventorySearch.toLowerCase();
    const resName = item.resource?.name?.toLowerCase() || '';
    const desc = item.resource?.description?.toLowerCase() || '';
    return resName.includes(term) || desc.includes(term);
  });

  // Filtered Requests
  const filteredRequests = requests.filter((req) => {
    // Status Filter
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    // Verification Filter
    if (verificationFilter !== 'ALL' && req.verificationStatus !== verificationFilter) return false;
    // Priority Filter
    if (priorityFilter !== 'ALL' && req.priority !== priorityFilter) return false;

    // Search Term
    if (requestSearch.trim()) {
      const term = requestSearch.toLowerCase();
      const matchId = String(req.id).includes(term);
      const matchDesc = req.description?.toLowerCase().includes(term) || false;
      const matchItem = req.items?.some((i) => i.resource?.name.toLowerCase().includes(term)) || false;
      if (!matchId && !matchDesc && !matchItem) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading Camp Manager Operations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifications */}
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

      {/* Camp Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                RELIEF CAMP MANAGER CONSOLE
              </span>
              {camp?.operationalStatus && (
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getCampStatusColor(
                    camp.operationalStatus
                  )}`}
                >
                  {camp.operationalStatus}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {camp?.name || 'Assigned Relief Camp'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Code: <strong className="text-white">{camp?.officialCode || 'CAMP-CODE'}</strong>
              </span>
              <span>•</span>
              <span>{camp?.address || 'Operational Zone'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={handleOpenCampStatusModal}
              className="bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600"
            >
              Update Camp Status
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Layers className="w-4 h-4" />}
              onClick={() => handleOpenInventoryModal()}
              className="bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600"
            >
              Update Stock
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={handleOpenCreateRequestModal}
              className="bg-blue-600 hover:bg-blue-500 shadow-sm"
            >
              New Resource Request
            </Button>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              title="Refresh Dashboard Data"
              className="p-2.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Occupancy Visual Bar in Banner */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-300">
              <span>Camp Shelter Occupancy</span>
              <span>
                {currentOccupancy} / {capacity > 0 ? capacity : 'Unlimited'} occupants ({occupancyPercentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercentage >= 95
                    ? 'bg-rose-500'
                    : occupancyPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex md:justify-end gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block">Available Beds</span>
              <span className="text-base font-bold text-emerald-400">{remainingBeds}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status</span>
              <span className="text-base font-bold text-blue-300">
                {camp?.operationalStatus || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Camp Occupancy"
          value={`${currentOccupancy} / ${capacity}`}
          icon={Users}
          colorScheme={occupancyPercentage > 85 ? 'rose' : 'blue'}
          description={`${occupancyPercentage}% capacity utilized • ${remainingBeds} beds remaining`}
        />
        <StatCard
          title="Operational Status"
          value={camp?.operationalStatus || 'OPERATIONAL'}
          icon={Building2}
          colorScheme="emerald"
          description="Live shelter operational readiness"
        />
        <StatCard
          title="Inventory Commodities"
          value={totalResourceTypes}
          icon={Layers}
          colorScheme="purple"
          description={`${zeroStockResources} out-of-stock items`}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          icon={ClipboardList}
          colorScheme="amber"
          description={`${requests.length} total camp requests recorded`}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Overview & Operations
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Camp Inventory ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Resource Requests ({requests.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Camp Details & Notes */}
            <Card
              title="Camp Details & Operational Log"
              subtitle="Registered camp properties and manager notes"
              action={
                <Button size="sm" variant="outline" onClick={handleOpenCampStatusModal}>
                  Edit
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Camp Name:</span>
                    <span className="font-semibold text-slate-900">{camp?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Official Code:</span>
                    <span className="font-semibold text-slate-900">{camp?.officialCode || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Registered Capacity:</span>
                    <span className="font-bold text-slate-900">{capacity} persons</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Current Occupants:</span>
                    <span className="font-bold text-blue-700">{currentOccupancy} persons</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Available Beds:</span>
                    <span className="font-bold text-emerald-700">{remainingBeds} beds</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Operational Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCampStatusColor(
                        camp?.operationalStatus || 'OPERATIONAL'
                      )}`}
                    >
                      {camp?.operationalStatus || 'OPERATIONAL'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Operational Log / Notes
                  </h4>
                  {camp?.operationalNotes ? (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 leading-relaxed">
                      <p className="italic">"{camp.operationalNotes}"</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 italic">
                      No operational notes posted for this camp yet. Click "Edit" to record updates.
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-slate-700"
                    onClick={handleOpenCampStatusModal}
                  >
                    Update Camp Status & Notes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Right: Quick Previews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Inventory Preview */}
              <Card
                title="Camp Stock Preview"
                subtitle="High-priority tracked supplies at this shelter"
                action={
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenInventoryModal()}>
                      + Update Stock
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setActiveTab('inventory')}>
                      View All ({inventory.length})
                    </Button>
                  </div>
                }
              >
                {inventory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Inventory Tracked Yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Record stock receipts or adjustments to start managing local camp commodities.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenInventoryModal()}
                      className="mt-2"
                    >
                      Record First Stock Receipt
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Resource Item</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3 text-right">In-Stock Quantity</th>
                          <th className="py-2.5 px-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventory.slice(0, 5).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {item.resource?.name || `Resource #${item.resourceId}`}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {item.resource?.unit || 'Units'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`font-bold px-2 py-0.5 rounded ${
                                  Number(item.quantity) === 0
                                    ? 'bg-rose-100 text-rose-700'
                                    : Number(item.quantity) < 10
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'text-slate-900'
                                }`}
                              >
                                {Number(item.quantity).toLocaleString()}{' '}
                                <span className="text-[11px] font-normal text-slate-500">
                                  {item.resource?.unit}
                                </span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenInventoryModal(item.resourceId)}
                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                              >
                                Adjust
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Recent Requests Preview */}
              <Card
                title="Recent Resource Requests"
                subtitle="Latest requests sent to the Control Centre"
                action={
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="primary" onClick={handleOpenCreateRequestModal}>
                      + New Request
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setActiveTab('requests')}>
                      View All ({requests.length})
                    </Button>
                  </div>
                }
              >
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Resource Requests Filed</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Need supplies, food rations, or emergency medicines? Create an online resource request.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleOpenCreateRequestModal}
                      className="mt-2"
                    >
                      Create First Request
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {requests.slice(0, 4).map((req) => (
                      <div
                        key={req.id}
                        className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleOpenRequestDetails(req)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">REQ-{req.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getVerificationStatusColor(
                                req.verificationStatus
                              )}`}
                            >
                              {req.verificationStatus}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getPriorityColor(
                                req.priority
                              )}`}
                            >
                              {req.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate max-w-md">
                            {req.description || 'Resource supply request'}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {req.items?.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200"
                              >
                                {Number(item.quantity)} {item.resource?.unit || ''}{' '}
                                {item.resource?.name || `Res #${item.resourceId}`}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div className="text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRequestStatusColor(
                                req.status
                              )}`}
                            >
                              {req.status}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1">
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
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

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search camp inventory by name or description..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => handleOpenInventoryModal()}
              >
                Record Stock Transaction
              </Button>
            </div>
          </div>

          <Card title="Camp Inventory Ledger" subtitle="On-site supplies and commodities available at this camp">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-700">No Inventory Matches</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {inventory.length === 0
                    ? 'No supplies are currently logged for this camp. Use the "Record Stock Transaction" button to log inventory receipts.'
                    : 'No inventory records matched your search criteria.'}
                </p>
                {inventory.length === 0 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenInventoryModal()}
                    className="mt-2"
                  >
                    Record Stock Receipt
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Resource ID</th>
                      <th className="py-3 px-4">Resource Item</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4 text-right">In-Stock Qty</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => {
                      const qty = Number(item.quantity);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-xs font-mono text-slate-500">
                            #{item.resourceId}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {item.resource?.name || `Resource #${item.resourceId}`}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                            {item.resource?.description || '—'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {item.resource?.unit || 'Unit'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-md text-sm ${
                                qty === 0
                                  ? 'bg-rose-100 text-rose-700 font-extrabold'
                                  : qty < 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {qty.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {qty === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                Out of Stock
                              </span>
                            ) : qty < 10 ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenInventoryModal(item.resourceId)}
                              className="text-xs"
                            >
                              Update Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: RESOURCE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests by ID, description, or items..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</option>
                  <option value="FULFILLED">FULFILLED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Verification Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Verification:</span>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Verifications</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={handleOpenCreateRequestModal}
              >
                Create Request
              </Button>
            </div>
          </div>

          <Card title="Camp Resource Request Queue" subtitle="Demands logged by this relief camp for central dispatch">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-700">No Resource Requests Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {requests.length === 0
                    ? 'No requests have been submitted by this camp yet. Click below to submit an online resource request.'
                    : 'No requests matched your filter criteria.'}
                </p>
                {requests.length === 0 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleOpenCreateRequestModal}
                    className="mt-2"
                  >
                    Create Online Request
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="py-4 px-3 hover:bg-slate-50/80 transition-colors rounded-xl border border-transparent hover:border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          REQ #{req.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getVerificationStatusColor(
                            req.verificationStatus
                          )}`}
                        >
                          {req.verificationStatus}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getPriorityColor(
                            req.priority
                          )}`}
                        >
                          {req.priority}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRequestStatusColor(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Channel: <strong className="text-slate-600">{req.channel}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDate(req.createdAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRequestDetails(req)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        {req.description}
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Requested Items:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {req.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs shadow-xs"
                          >
                            <span className="font-bold text-slate-900">
                              {Number(item.quantity)} {item.resource?.unit || 'units'}
                            </span>
                            <span className="text-slate-600">
                              {item.resource?.name || `Resource #${item.resourceId}`}
                            </span>
                            {item.notes && (
                              <span className="text-[11px] text-slate-400 italic">
                                ({item.notes})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Teams Info if any */}
                    {req.assignments && req.assignments.length > 0 && (
                      <div className="text-xs text-blue-800 bg-blue-50/60 border border-blue-200/60 p-2 rounded-lg flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Assigned Relief Team: <strong>{req.assignments[0]?.team?.teamName || 'Relief Field Unit'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: UPDATE CAMP STATUS (PUT /api/camp-manager/me)      */}
      {/* ========================================================== */}
      {isCampStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Camp Status</h3>
                  <p className="text-xs text-slate-500">
                    Live operational metrics for {camp?.name || 'your camp'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCampStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {campStatusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{campStatusError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCampStatusSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Occupancy (Persons) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={campFormOccupancy}
                  onChange={(e) => setCampFormOccupancy(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Official Camp Capacity: <strong>{capacity}</strong> persons
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status *
                </label>
                <select
                  value={campFormStatus}
                  onChange={(e) => setCampFormStatus(e.target.value as CampOperationalStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="OPERATIONAL">OPERATIONAL (Accepting evacuees)</option>
                  <option value="LIMITED">LIMITED (Reduced capacity / resources)</option>
                  <option value="FULL">FULL (At maximum capacity)</option>
                  <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Notes & Situation Log
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Medical team on site, power generator active, dry rations needed..."
                  value={campFormNotes}
                  onChange={(e) => setCampFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCampStatusModalOpen(false)}
                  disabled={isSubmittingCampStatus}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingCampStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPDATE INVENTORY (PUT /api/inventory/my-camp/:resourceId)        */}
      {/* ========================================================================= */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Stock Movement</h3>
                  <p className="text-xs text-slate-500">
                    Log receipts, deliveries, consumption, or inventory adjustments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInventoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inventoryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{inventoryError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateInventorySubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Item *
                </label>
                <select
                  required
                  value={invFormResourceId}
                  onChange={(e) => setInvFormResourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                >
                  <option value={0} disabled>
                    -- Select Active Resource --
                  </option>
                  {allResources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Movement Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={invFormQuantity}
                    onChange={(e) => setInvFormQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={invFormType}
                    onChange={(e) => setInvFormType(e.target.value as InventoryTransactionType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                  >
                    <option value="RECEIPT">RECEIPT (+ Add stock)</option>
                    <option value="DELIVERY">DELIVERY (- Dispatched)</option>
                    <option value="CONSUMPTION">CONSUMPTION (- Used by evacuees)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Audit correction)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Notes / Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received shipment from NGO warehouse / Distributed 20 blankets..."
                  value={invFormNotes}
                  onChange={(e) => setInvFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInventoryModalOpen(false)}
                  disabled={isSubmittingInventory}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingInventory}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Record Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE RESOURCE REQUEST (POST /api/resource-requests)            */}
      {/* ========================================================================= */}
      {isCreateRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Online Resource Request</h3>
                  <p className="text-xs text-slate-500">
                    Submit a formal supply requisition to the Control Centre
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createRequestError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{createRequestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequestSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Description & Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Critical shortage of drinking water and baby food after fresh evacuation wave..."
                  value={reqFormDescription}
                  onChange={(e) => setReqFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Requested Resource Items ({reqFormItems.length}) *
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddItemToRequest}
                  >
                    Add Resource
                  </Button>
                </div>

                <div className="space-y-3">
                  {reqFormItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Resource Selector */}
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Item #{index + 1} Resource *
                          </label>
                          <select
                            required
                            value={item.resourceId}
                            onChange={(e) =>
                              handleItemChange(index, 'resourceId', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={0} disabled>
                              -- Select Resource --
                            </option>
                            {allResources.map((res) => (
                              <option key={res.id} value={res.id}>
                                {res.name} ({res.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'quantity',
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Remove Action */}
                        <div className="sm:col-span-3 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItemFromRequest(index)}
                            disabled={reqFormItems.length <= 1}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs w-full sm:w-auto"
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Optional Note */}
                      <div>
                        <input
                          type="text"
                          placeholder="Optional item note (e.g. Size L, pediatric, urgent...)"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateRequestModalOpen(false)}
                  disabled={isSubmittingRequest}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingRequest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Resource Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESOURCE REQUEST DETAILS (GET /api/resource-requests/:id)       */}
      {/* ========================================================================= */}
      {selectedRequestForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Request Details — REQ #{selectedRequestForDetails.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Logged on {formatDate(selectedRequestForDetails.createdAt)} via{' '}
                    {selectedRequestForDetails.channel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequestForDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingRequestDetails ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Status Badges Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Verification</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getVerificationStatusColor(
                        selectedRequestForDetails.verificationStatus
                      )}`}
                    >
                      {selectedRequestForDetails.verificationStatus}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Priority</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getPriorityColor(
                        selectedRequestForDetails.priority
                      )}`}
                    >
                      {selectedRequestForDetails.priority}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Lifecycle Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRequestStatusColor(
                        selectedRequestForDetails.status
                      )}`}
                    >
                      {selectedRequestForDetails.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">Channel</span>
                    <span className="font-bold text-slate-800">
                      {selectedRequestForDetails.channel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedRequestForDetails.description && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Description:</span>
                    <p className="text-slate-800 leading-relaxed">
                      {selectedRequestForDetails.description}
                    </p>
                  </div>
                )}

                {/* Items Breakdown Table */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Itemized Supply Demands
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Item #</th>
                          <th className="py-2.5 px-3">Resource Name</th>
                          <th className="py-2.5 px-3 text-right">Requested Quantity</th>
                          <th className="py-2.5 px-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRequestForDetails.items?.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-2 px-3 text-slate-400 font-mono">#{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {item.resource?.name || `Resource #${item.resourceId}`}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-blue-700">
                              {Number(item.quantity)} {item.resource?.unit || 'units'}
                            </td>
                            <td className="py-2 px-3 text-slate-500 italic">
                              {item.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assigned Relief Team Info if exists */}
                {selectedRequestForDetails.assignments && selectedRequestForDetails.assignments.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                    <span className="font-bold block">Assigned Relief Field Team</span>
                    {selectedRequestForDetails.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex justify-between items-center text-xs">
                        <span>
                          Team: <strong>{assignment.team?.teamName || 'Relief Team'}</strong> (
                          {assignment.team?.contactNumber})
                        </span>
                        <span className="text-[11px] text-blue-700">
                          Assigned: {formatDate(assignment.assignedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequestForDetails(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
