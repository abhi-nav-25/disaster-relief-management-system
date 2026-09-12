import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Package,
  FileSearch,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit3,
  Phone,
  Activity,
  Code,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  getCampStatusColor,
  getTeamStatusColor,
  formatDate,
} from '../../utils/formatters';
import { campService } from '../../services/camp.service';
import { dmaCampService, type UpdateCampOfficialDataPayload } from '../../services/dmaCamp.service';
import { resourceService, type CreateResourcePayload, type UpdateResourcePayload } from '../../services/resource.service';
import { teamService } from '../../services/team.service';
import { auditLogService } from '../../services/auditLog.service';
import type {
  ReliefCamp,
  Resource,
  ReliefTeam,
  AuditLog,
  TeamStatus,
} from '../../types/models.types';

export const DmaSupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Active Tab: 'overview' | 'camps' | 'resources' | 'teams' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'camps' | 'resources' | 'teams' | 'audit'>('overview');

  // Core Data States (Fetched strictly from real backend endpoints)
  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [teams, setTeams] = useState<ReliefTeam[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Loading & Feedback States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [campSearch, setCampSearch] = useState<string>('');
  const [campStatusFilter, setCampStatusFilter] = useState<string>('ALL');

  const [resourceSearch, setResourceSearch] = useState<string>('');
  const [resourceStatusFilter, setResourceStatusFilter] = useState<string>('ALL');

  const [teamSearch, setTeamSearch] = useState<string>('');
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>('ALL');

  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
  const [auditEntityFilter, setAuditEntityFilter] = useState<string>('ALL');

  // Modals
  // 1. Edit Camp Modal
  const [isEditCampModalOpen, setIsEditCampModalOpen] = useState<boolean>(false);
  const [selectedCampForEdit, setSelectedCampForEdit] = useState<ReliefCamp | null>(null);
  const [campEditCode, setCampEditCode] = useState<string>('');
  const [campEditName, setCampEditName] = useState<string>('');
  const [campEditAddress, setCampEditAddress] = useState<string>('');
  const [campEditLat, setCampEditLat] = useState<number>(0);
  const [campEditLng, setCampEditLng] = useState<number>(0);
  const [campEditCapacity, setCampEditCapacity] = useState<number>(100);
  const [isSubmittingCampEdit, setIsSubmittingCampEdit] = useState<boolean>(false);
  const [campEditError, setCampEditError] = useState<string | null>(null);

  // 2. Resource Modals
  const [isCreateResourceModalOpen, setIsCreateResourceModalOpen] = useState<boolean>(false);
  const [resCreateName, setResCreateName] = useState<string>('');
  const [resCreateDescription, setResCreateDescription] = useState<string>('');
  const [resCreateUnit, setResCreateUnit] = useState<string>('Units');
  const [isSubmittingResourceCreate, setIsSubmittingResourceCreate] = useState<boolean>(false);
  const [resourceCreateError, setResourceCreateError] = useState<string | null>(null);

  const [isEditResourceModalOpen, setIsEditResourceModalOpen] = useState<boolean>(false);
  const [selectedResourceForEdit, setSelectedResourceForEdit] = useState<Resource | null>(null);
  const [resEditName, setResEditName] = useState<string>('');
  const [resEditDescription, setResEditDescription] = useState<string>('');
  const [resEditUnit, setResEditUnit] = useState<string>('');
  const [resEditIsActive, setResEditIsActive] = useState<boolean>(true);
  const [isSubmittingResourceEdit, setIsSubmittingResourceEdit] = useState<boolean>(false);
  const [resourceEditError, setResourceEditError] = useState<string | null>(null);

  // 3. Team Modals
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState<boolean>(false);
  const [teamCreateName, setTeamCreateName] = useState<string>('');
  const [teamCreateContact, setTeamCreateContact] = useState<string>('');
  const [isSubmittingTeamCreate, setIsSubmittingTeamCreate] = useState<boolean>(false);
  const [teamCreateError, setTeamCreateError] = useState<string | null>(null);

  const [selectedTeamDetails, setSelectedTeamDetails] = useState<ReliefTeam | null>(null);
  const [isLoadingTeamDetails, setIsLoadingTeamDetails] = useState<boolean>(false);

  const [isUpdateTeamStatusModalOpen, setIsUpdateTeamStatusModalOpen] = useState<boolean>(false);
  const [selectedTeamForStatus, setSelectedTeamForStatus] = useState<ReliefTeam | null>(null);
  const [teamNewStatus, setTeamNewStatus] = useState<TeamStatus>('AVAILABLE');
  const [isSubmittingTeamStatus, setIsSubmittingTeamStatus] = useState<boolean>(false);
  const [teamStatusError, setTeamStatusError] = useState<string | null>(null);

  // 4. Audit Log Details Modal
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Synchronize Tab with URL hash (e.g., #camps, #resources, #teams, #audit)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'camps' || hash === 'resources' || hash === 'teams' || hash === 'audit') {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load all DMA operational data from real backend endpoints
  const loadDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [campsData, resourcesData, teamsData, logsData] = await Promise.all([
        campService.getAllCamps(),
        resourceService.getAllResources(),
        teamService.getAllTeams(),
        auditLogService.getAuditLogs(),
      ]);

      setCamps(campsData);
      setResources(resourcesData);
      setTeams(teamsData);
      setAuditLogs(logsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch DMA Supervisor operational data';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ==========================================
  // CAMP MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenEditCampModal = (camp: ReliefCamp) => {
    setSelectedCampForEdit(camp);
    setCampEditCode(camp.officialCode);
    setCampEditName(camp.name);
    setCampEditAddress(camp.address);
    setCampEditLat(camp.latitude);
    setCampEditLng(camp.longitude);
    setCampEditCapacity(camp.capacity);
    setCampEditError(null);
    setIsEditCampModalOpen(true);
  };

  const handleEditCampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampForEdit) return;
    setCampEditError(null);

    if (!campEditCode.trim() || !campEditName.trim() || !campEditAddress.trim()) {
      setCampEditError('Official code, name, and address are required.');
      return;
    }

    if (campEditLat < -90 || campEditLat > 90) {
      setCampEditError('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (campEditLng < -180 || campEditLng > 180) {
      setCampEditError('Longitude must be between -180 and 180 degrees.');
      return;
    }

    if (campEditCapacity <= 0 || !Number.isInteger(Number(campEditCapacity))) {
      setCampEditError('Capacity must be a positive whole number.');
      return;
    }

    setIsSubmittingCampEdit(true);
    try {
      const payload: UpdateCampOfficialDataPayload = {
        officialCode: campEditCode.trim(),
        name: campEditName.trim(),
        address: campEditAddress.trim(),
        latitude: Number(campEditLat),
        longitude: Number(campEditLng),
        capacity: Number(campEditCapacity),
      };

      await dmaCampService.updateCampOfficialData(selectedCampForEdit.id, payload);
      setSuccessMessage(`Official records for ${campEditName} updated successfully.`);
      setIsEditCampModalOpen(false);
      // Refresh camps list
      const updatedCamps = await campService.getAllCamps();
      setCamps(updatedCamps);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update camp official data.';
      setCampEditError(msg);
    } finally {
      setIsSubmittingCampEdit(false);
    }
  };

  // ==========================================
  // RESOURCE MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenCreateResourceModal = () => {
    setResCreateName('');
    setResCreateDescription('');
    setResCreateUnit('Units');
    setResourceCreateError(null);
    setIsCreateResourceModalOpen(true);
  };

  const handleCreateResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResourceCreateError(null);

    if (!resCreateName.trim() || !resCreateUnit.trim()) {
      setResourceCreateError('Resource commodity name and unit of measurement are required.');
      return;
    }

    setIsSubmittingResourceCreate(true);
    try {
      const payload: CreateResourcePayload = {
        name: resCreateName.trim(),
        description: resCreateDescription.trim() || undefined,
        unit: resCreateUnit.trim(),
      };

      await resourceService.createResource(payload);
      setSuccessMessage(`New resource commodity "${resCreateName}" registered successfully.`);
      setIsCreateResourceModalOpen(false);
      // Refresh resources
      const updatedResources = await resourceService.getAllResources();
      setResources(updatedResources);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register resource commodity.';
      setResourceCreateError(msg);
    } finally {
      setIsSubmittingResourceCreate(false);
    }
  };

  const handleOpenEditResourceModal = (res: Resource) => {
    setSelectedResourceForEdit(res);
    setResEditName(res.name);
    setResEditDescription(res.description || '');
    setResEditUnit(res.unit);
    setResEditIsActive(res.isActive);
    setResourceEditError(null);
    setIsEditResourceModalOpen(true);
  };

  const handleEditResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceForEdit) return;
    setResourceEditError(null);

    if (!resEditName.trim() || !resEditUnit.trim()) {
      setResourceEditError('Resource name and unit are required.');
      return;
    }

    setIsSubmittingResourceEdit(true);
    try {
      const payload: UpdateResourcePayload = {
        name: resEditName.trim(),
        description: resEditDescription.trim() || undefined,
        unit: resEditUnit.trim(),
        isActive: resEditIsActive,
      };

      await resourceService.updateResource(selectedResourceForEdit.id, payload);
      setSuccessMessage(`Resource "${resEditName}" updated successfully.`);
      setIsEditResourceModalOpen(false);
      // Refresh resources
      const updatedResources = await resourceService.getAllResources();
      setResources(updatedResources);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update resource.';
      setResourceEditError(msg);
    } finally {
      setIsSubmittingResourceEdit(false);
    }
  };

  const handleToggleResourceActive = async (res: Resource) => {
    try {
      await resourceService.updateResource(res.id, {
        isActive: !res.isActive,
      });
      setSuccessMessage(`Resource "${res.name}" status updated to ${!res.isActive ? 'Active' : 'Inactive'}.`);
      const updatedResources = await resourceService.getAllResources();
      setResources(updatedResources);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update resource status.';
      setErrorMessage(msg);
    }
  };

  // ==========================================
  // RELIEF TEAM MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenCreateTeamModal = () => {
    setTeamCreateName('');
    setTeamCreateContact('');
    setTeamCreateError(null);
    setIsCreateTeamModalOpen(true);
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamCreateError(null);

    if (!teamCreateName.trim() || !teamCreateContact.trim()) {
      setTeamCreateError('Team name and official contact number are required.');
      return;
    }

    setIsSubmittingTeamCreate(true);
    try {
      await teamService.createTeam({
        teamName: teamCreateName.trim(),
        contactNumber: teamCreateContact.trim(),
      });

      setSuccessMessage(`Relief team "${teamCreateName}" created successfully.`);
      setIsCreateTeamModalOpen(false);
      // Refresh teams
      const updatedTeams = await teamService.getAllTeams();
      setTeams(updatedTeams);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create relief team.';
      setTeamCreateError(msg);
    } finally {
      setIsSubmittingTeamCreate(false);
    }
  };

  const handleOpenTeamDetails = async (team: ReliefTeam) => {
    setSelectedTeamDetails(team);
    setIsLoadingTeamDetails(true);
    try {
      const fullTeam = await teamService.getTeamById(team.id);
      setSelectedTeamDetails(fullTeam);
    } catch {
      // Fallback to currently selected object
    } finally {
      setIsLoadingTeamDetails(false);
    }
  };

  const handleOpenUpdateTeamStatusModal = (team: ReliefTeam) => {
    setSelectedTeamForStatus(team);
    setTeamNewStatus(team.status);
    setTeamStatusError(null);
    setIsUpdateTeamStatusModalOpen(true);
  };

  const handleUpdateTeamStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForStatus) return;
    setTeamStatusError(null);

    setIsSubmittingTeamStatus(true);
    try {
      await teamService.updateTeamStatus(selectedTeamForStatus.id, teamNewStatus);
      setSuccessMessage(`Team "${selectedTeamForStatus.teamName}" status changed to ${teamNewStatus}.`);
      setIsUpdateTeamStatusModalOpen(false);
      // Refresh teams
      const updatedTeams = await teamService.getAllTeams();
      setTeams(updatedTeams);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update team status.';
      setTeamStatusError(msg);
    } finally {
      setIsSubmittingTeamStatus(false);
    }
  };

  // ==========================================
  // REAL CALCULATED KPI METRICS
  // ==========================================
  const totalCamps = camps.length;
  const operationalCamps = camps.filter((c) => c.operationalStatus === 'OPERATIONAL').length;
  const limitedCamps = camps.filter((c) => c.operationalStatus === 'LIMITED').length;
  const fullOrClosedCamps = camps.filter(
    (c) => c.operationalStatus === 'FULL' || c.operationalStatus === 'CLOSED' || c.operationalStatus === 'TEMPORARILY_CLOSED'
  ).length;

  const totalResources = resources.length;
  const activeResources = resources.filter((r) => r.isActive).length;
  const inactiveResources = resources.filter((r) => !r.isActive).length;

  const totalTeams = teams.length;
  const availableTeams = teams.filter((t) => t.status === 'AVAILABLE').length;
  const busyTeams = teams.filter((t) => t.status === 'BUSY').length;
  const offlineTeams = teams.filter((t) => t.status === 'OFFLINE').length;

  // ==========================================
  // FILTERED DATASETS
  // ==========================================
  const filteredCamps = camps.filter((c) => {
    if (campStatusFilter !== 'ALL' && c.operationalStatus !== campStatusFilter) return false;
    if (campSearch.trim()) {
      const term = campSearch.toLowerCase();
      const matchName = c.name.toLowerCase().includes(term);
      const matchCode = c.officialCode.toLowerCase().includes(term);
      const matchAddr = c.address.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchAddr) return false;
    }
    return true;
  });

  const filteredResources = resources.filter((r) => {
    if (resourceStatusFilter === 'ACTIVE' && !r.isActive) return false;
    if (resourceStatusFilter === 'INACTIVE' && r.isActive) return false;
    if (resourceSearch.trim()) {
      const term = resourceSearch.toLowerCase();
      const matchName = r.name.toLowerCase().includes(term);
      const matchDesc = r.description?.toLowerCase().includes(term) || false;
      const matchUnit = r.unit.toLowerCase().includes(term);
      if (!matchName && !matchDesc && !matchUnit) return false;
    }
    return true;
  });

  const filteredTeams = teams.filter((t) => {
    if (teamStatusFilter !== 'ALL' && t.status !== teamStatusFilter) return false;
    if (teamSearch.trim()) {
      const term = teamSearch.toLowerCase();
      const matchName = t.teamName.toLowerCase().includes(term);
      const matchPhone = t.contactNumber.toLowerCase().includes(term);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
    if (auditEntityFilter !== 'ALL' && log.entityType !== auditEntityFilter) return false;
    if (auditSearch.trim()) {
      const term = auditSearch.toLowerCase();
      const matchId = String(log.entityId).includes(term) || String(log.id).includes(term);
      const matchDesc = log.description?.toLowerCase().includes(term) || false;
      const matchUser = log.performedBy?.name.toLowerCase().includes(term) || false;
      if (!matchId && !matchDesc && !matchUser) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading DMA Executive Portal...</p>
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

      {/* DMA Supervisor Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
                DMA EXECUTIVE SUPERVISOR PORTAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                COMPLIANCE & MASTER DATA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Disaster Management Authority Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Supervisor: <strong className="text-white">{user?.name}</strong>
              </span>
              <span>•</span>
              <span>Master Relief Shelter Grid, Resource Catalog & Tactical Teams</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={handleOpenCreateResourceModal}
              className="bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600"
            >
              Add Resource
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Users className="w-4 h-4" />}
              onClick={handleOpenCreateTeamModal}
              className="bg-purple-600 hover:bg-purple-500 shadow-sm"
            >
              New Relief Team
            </Button>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              title="Refresh Master Data"
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
          title="Relief Camps Master"
          value={totalCamps}
          icon={Building2}
          colorScheme="purple"
          description={`${operationalCamps} operational • ${limitedCamps} limited • ${fullOrClosedCamps} full/closed`}
        />
        <StatCard
          title="Master Resources"
          value={totalResources}
          icon={Package}
          colorScheme="emerald"
          description={`${activeResources} active in catalog • ${inactiveResources} deactivated`}
        />
        <StatCard
          title="Relief Field Teams"
          value={totalTeams}
          icon={Users}
          colorScheme="blue"
          description={`${availableTeams} available • ${busyTeams} busy • ${offlineTeams} offline`}
        />
        <StatCard
          title="Compliance Audit Trail"
          value={auditLogs.length}
          icon={FileSearch}
          colorScheme="slate"
          description="Immutable system action records logged"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('camps')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'camps'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Relief Camps Master ({camps.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Resource Catalog ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'teams'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Relief Teams ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Camps Master Preview */}
            <Card
              title="Official Relief Shelters"
              subtitle="Master camp registry with capacity and coordinates"
              action={
                <Button size="sm" variant="outline" onClick={() => setActiveTab('camps')}>
                  View All ({camps.length})
                </Button>
              }
            >
              {camps.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No camps registered.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {camps.slice(0, 4).map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {c.officialCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.address}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCampStatusColor(
                            c.operationalStatus
                          )}`}
                        >
                          {c.operationalStatus}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1">
                          Cap: {c.capacity.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Teams Readiness */}
            <Card
              title="Tactical Relief Teams"
              subtitle="Registered field response units and current availability"
              action={
                <Button size="sm" variant="primary" onClick={handleOpenCreateTeamModal}>
                  + New Team
                </Button>
              }
            >
              {teams.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No teams registered.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {teams.slice(0, 4).map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{t.teamName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {t.contactNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {t.members?.length || 0} registered members
                        </span>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getTeamStatusColor(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Resource Catalog */}
            <Card
              title="Master Relief Commodities"
              subtitle="Standard supply definitions approved for relief delivery"
              action={
                <Button size="sm" variant="outline" onClick={() => setActiveTab('resources')}>
                  Manage Catalog ({resources.length})
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <th className="py-2 px-3">Resource Item</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.unit}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              r.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {r.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenEditResourceModal(r)}
                            className="text-purple-600 hover:text-purple-800 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Audit Activity */}
            <Card
              title="Recent Audit Events"
              subtitle="Latest system modifications and operator actions"
              action={
                <Button size="sm" variant="outline" onClick={() => setActiveTab('audit')}>
                  View Full Audit Log
                </Button>
              }
            >
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No audit logs recorded.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-[10px] text-slate-700 font-mono">
                            {log.entityType} #{log.entityId}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                      </div>
                      <p className="text-slate-600 truncate">{log.description || 'System state change'}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: RELIEF CAMPS MASTER */}
      {activeTab === 'camps' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search camps by name, code, or address..."
                value={campSearch}
                onChange={(e) => setCampSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={campStatusFilter}
                onChange={(e) => setCampStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Operational Statuses</option>
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="LIMITED">LIMITED</option>
                <option value="FULL">FULL</option>
                <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <Card
            title="Official Relief Camps Master Ledger"
            subtitle="Administer official shelter coordinates, codes, names, and capacities"
          >
            {filteredCamps.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No camps matched your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Official Code</th>
                      <th className="py-3 px-4">Camp Name</th>
                      <th className="py-3 px-4">Address / Zone</th>
                      <th className="py-3 px-4">Coordinates</th>
                      <th className="py-3 px-4 text-right">Capacity</th>
                      <th className="py-3 px-4 text-right">Occupancy</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCamps.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-purple-900">
                          {camp.officialCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{camp.name}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                          {camp.address}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {camp.latitude.toFixed(4)}, {camp.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {camp.capacity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-slate-600">
                          {camp.currentOccupancy.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCampStatusColor(
                              camp.operationalStatus
                            )}`}
                          >
                            {camp.operationalStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditCampModal(camp)}
                            className="text-xs text-purple-700 hover:text-purple-900 border-purple-200 hover:bg-purple-50"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: RESOURCE CATALOG */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources by name or description..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={resourceStatusFilter}
                onChange={(e) => setResourceStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Commodities</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={handleOpenCreateResourceModal}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Register Resource
              </Button>
            </div>
          </div>

          <Card
            title="Master Resource Catalog"
            subtitle="Official relief commodities catalog defined and governed by DMA"
          >
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No resources match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Commodity ID</th>
                      <th className="py-3 px-4">Resource Name</th>
                      <th className="py-3 px-4">Standard Description</th>
                      <th className="py-3 px-4">Unit of Measurement</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">#{res.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{res.name}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-sm truncate">
                          {res.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 font-medium">{res.unit}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              res.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {res.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditResourceModal(res)}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleResourceActive(res)}
                              className={`text-xs ${
                                res.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {res.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: RELIEF TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams by name or contact number..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={teamStatusFilter}
                onChange={(e) => setTeamStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Readiness Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>

              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={handleOpenCreateTeamModal}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Team
              </Button>
            </div>
          </div>

          <Card
            title="Tactical Emergency Response Teams"
            subtitle="Field deployment teams registered under the Disaster Management Authority"
          >
            {filteredTeams.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No relief teams match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Team ID</th>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4">Official Contact</th>
                      <th className="py-3 px-4">Personnel</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">#{team.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{team.teamName}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {team.contactNumber}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {team.members?.length || 0} active members
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTeamStatusColor(
                              team.status
                            )}`}
                          >
                            {team.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenTeamDetails(team)}
                              className="text-xs"
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenUpdateTeamStatusModal(team)}
                              className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                            >
                              Set Status
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by ID, description, or actor..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Action Filter */}
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="VERIFY">VERIFY</option>
                <option value="REJECT">REJECT</option>
                <option value="ASSIGN">ASSIGN</option>
                <option value="OVERRIDE">OVERRIDE</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE</option>
                <option value="DUPLICATE_DECISION">DUPLICATE_DECISION</option>
              </select>

              {/* Entity Filter */}
              <select
                value={auditEntityFilter}
                onChange={(e) => setAuditEntityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Entity Types</option>
                <option value="ResourceRequest">ResourceRequest</option>
                <option value="ReliefCamp">ReliefCamp</option>
                <option value="Resource">Resource</option>
                <option value="ReliefTeam">ReliefTeam</option>
                <option value="Delivery">Delivery</option>
                <option value="Task">Task</option>
                <option value="DuplicateCheck">DuplicateCheck</option>
              </select>
            </div>
          </div>

          <Card
            title="Immutable Compliance Audit Ledger"
            subtitle="Central cryptographic record of all operations, status transitions, and data mutations"
          >
            {filteredAuditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No audit entries match the current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-3">Timestamp</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Entity Type & ID</th>
                      <th className="py-3 px-3">Actor / Performed By</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3 text-right">Data Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-900 font-bold">
                          {log.entityType} #{log.entityId}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {log.performedBy ? (
                            <div>
                              <span className="font-semibold block">{log.performedBy.name}</span>
                              <span className="text-[10px] text-slate-400">{log.performedBy.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">System Auto</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                          {log.description || '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedAuditLog(log)}
                            leftIcon={<Code className="w-3.5 h-3.5" />}
                            className="text-xs text-purple-700"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT CAMP (PUT /api/dma/camps/:id)                               */}
      {/* ========================================================================= */}
      {isEditCampModalOpen && selectedCampForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Official Camp Data</h3>
                  <p className="text-xs text-slate-500">
                    Official registry parameters for Camp #{selectedCampForEdit.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditCampModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {campEditError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{campEditError}</span>
              </div>
            )}

            <form onSubmit={handleEditCampSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={campEditCode}
                    onChange={(e) => setCampEditCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacity (Persons) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={campEditCapacity}
                    onChange={(e) => setCampEditCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Camp Name *
                </label>
                <input
                  type="text"
                  required
                  value={campEditName}
                  onChange={(e) => setCampEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address / Zone *
                </label>
                <input
                  type="text"
                  required
                  value={campEditAddress}
                  onChange={(e) => setCampEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Latitude (-90 to 90) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={campEditLat}
                    onChange={(e) => setCampEditLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Longitude (-180 to 180) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={campEditLng}
                    onChange={(e) => setCampEditLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditCampModalOpen(false)}
                  disabled={isSubmittingCampEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingCampEdit}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Save Official Data
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE RESOURCE (POST /api/resources)                            */}
      {/* ========================================================================= */}
      {isCreateResourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register New Resource</h3>
                  <p className="text-xs text-slate-500">
                    Add standard relief commodity to master catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resourceCreateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resourceCreateError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResourceSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drinking Water Bottles / Trauma Kits / Blankets"
                  value={resCreateName}
                  onChange={(e) => setResCreateName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit of Measurement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liters, Boxes, Kg, Packs, Pieces"
                  value={resCreateUnit}
                  onChange={(e) => setResCreateUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Specification, packaging details, storage requirements..."
                  value={resCreateDescription}
                  onChange={(e) => setResCreateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateResourceModalOpen(false)}
                  disabled={isSubmittingResourceCreate}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingResourceCreate}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Register Commodity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT RESOURCE (PUT /api/resources/:id)                           */}
      {/* ========================================================================= */}
      {isEditResourceModalOpen && selectedResourceForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Resource Commodity</h3>
                  <p className="text-xs text-slate-500">Resource #{selectedResourceForEdit.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resourceEditError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resourceEditError}</span>
              </div>
            )}

            <form onSubmit={handleEditResourceSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  required
                  value={resEditName}
                  onChange={(e) => setResEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit of Measurement *
                </label>
                <input
                  type="text"
                  required
                  value={resEditUnit}
                  onChange={(e) => setResEditUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={resEditDescription}
                  onChange={(e) => setResEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="resEditIsActive"
                  checked={resEditIsActive}
                  onChange={(e) => setResEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="resEditIsActive" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Active in Master Resource Catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditResourceModalOpen(false)}
                  disabled={isSubmittingResourceEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingResourceEdit}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE RELIEF TEAM (POST /api/teams)                             */}
      {/* ========================================================================= */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register Relief Team</h3>
                  <p className="text-xs text-slate-500">Establish a new tactical field deployment unit</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {teamCreateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{teamCreateError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rapid Rescue Unit 4 / Coastal Evac Alpha"
                  value={teamCreateName}
                  onChange={(e) => setTeamCreateName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Contact Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9876543210 / 044-2345678"
                  value={teamCreateContact}
                  onChange={(e) => setTeamCreateContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                  disabled={isSubmittingTeamCreate}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingTeamCreate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW TEAM DETAILS (GET /api/teams/:id)                           */}
      {/* ========================================================================= */}
      {selectedTeamDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedTeamDetails.teamName}
                  </h3>
                  <p className="text-xs text-slate-500">Team #{selectedTeamDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingTeamDetails ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-bold text-slate-900">
                      {selectedTeamDetails.contactNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Readiness Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getTeamStatusColor(
                        selectedTeamDetails.status
                      )}`}
                    >
                      {selectedTeamDetails.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Enrolled Team Members ({selectedTeamDetails.members?.length || 0})
                  </h4>
                  {(!selectedTeamDetails.members || selectedTeamDetails.members.length === 0) ? (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      No users currently assigned to this team.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedTeamDetails.members.map((m) => (
                        <div key={m.id} className="p-2.5 bg-white flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {m.user?.name || `User #${m.userId}`}
                            </span>
                            <span className="text-[11px] text-slate-400">{m.user?.email}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                            {m.user?.phone || 'No phone'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedTeamDetails(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: UPDATE TEAM STATUS (PUT /api/teams/:id/status)                    */}
      {/* ========================================================================= */}
      {isUpdateTeamStatusModalOpen && selectedTeamForStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Team Status</h3>
                  <p className="text-xs text-slate-500">{selectedTeamForStatus.teamName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateTeamStatusModalOpen(false)}
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
                  value={teamNewStatus}
                  onChange={(e) => setTeamNewStatus(e.target.value as TeamStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-xs"
                >
                  <option value="AVAILABLE">AVAILABLE (Ready for assignment)</option>
                  <option value="BUSY">BUSY (Active in field mission)</option>
                  <option value="OFFLINE">OFFLINE (Standby / Off-duty)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateTeamStatusModalOpen(false)}
                  disabled={isSubmittingTeamStatus}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingTeamStatus}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Update Status
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: INSPECT AUDIT LOG PAYLOAD (JSON VIEW)                            */}
      {/* ========================================================================= */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Audit Log #{selectedAuditLog.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAuditLog.action} on {selectedAuditLog.entityType} #{selectedAuditLog.entityId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-mono text-slate-800">{formatDate(selectedAuditLog.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Performed By:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAuditLog.performedBy?.name || 'System'} ({selectedAuditLog.performedBy?.email || 'N/A'})
                  </span>
                </div>
                {selectedAuditLog.description && (
                  <div className="pt-1">
                    <span className="text-slate-500 block">Description:</span>
                    <p className="text-slate-800">{selectedAuditLog.description}</p>
                  </div>
                )}
              </div>

              {Boolean(selectedAuditLog.beforeData) && (
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    State Before Mutation:
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedAuditLog.beforeData, null, 2)}
                  </pre>
                </div>
              )}

              {Boolean(selectedAuditLog.afterData) && (
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    State After Mutation:
                  </span>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedAuditLog.afterData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedAuditLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
