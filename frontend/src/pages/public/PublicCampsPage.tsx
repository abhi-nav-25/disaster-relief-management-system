import React, { useEffect, useState } from 'react';
import { Building2, Search, MapPin, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { campService } from '../../services/camp.service';
import type { ReliefCamp } from '../../types/models.types';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getCampStatusColor } from '../../utils/formatters';

export const PublicCampsPage: React.FC = () => {
  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchCamps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campService.getAllCamps();
      setCamps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load relief camps directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const filteredCamps = camps.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.officialCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || camp.operationalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Relief Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Relief Camps Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status, shelter capacities, and operational conditions across active camps
          </p>
        </div>

        <button
          onClick={fetchCamps}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search camp by name, address, or official code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading relief camps directory..." />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h4 className="font-semibold text-rose-900">Failed to connect to backend</h4>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchCamps}
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredCamps.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No Relief Camps Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No camps match your search criteria or none have been created yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCamps.map((camp) => {
            const occupancyPct =
              camp.capacity > 0
                ? Math.min(Math.round((camp.currentOccupancy / camp.capacity) * 100), 100)
                : 0;

            return (
              <Card key={camp.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {camp.officialCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{camp.name}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${getCampStatusColor(
                        camp.operationalStatus
                      )}`}
                    >
                      {camp.operationalStatus}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{camp.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>Lat: {camp.latitude.toFixed(4)}</span>
                      <span>•</span>
                      <span>Lng: {camp.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Occupancy</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {camp.currentOccupancy} / {camp.capacity} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 95
                            ? 'bg-rose-500'
                            : occupancyPct >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {camp.operationalNotes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      "{camp.operationalNotes}"
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
