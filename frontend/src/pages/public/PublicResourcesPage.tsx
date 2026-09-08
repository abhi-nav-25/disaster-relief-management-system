import React, { useEffect, useState } from 'react';
import { Package, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resource.service';
import type { Resource } from '../../types/models.types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const PublicResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load relief resources catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter((res) =>
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Supply Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Relief Resources Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard relief commodities, medical kits, rations, and logistics materials managed across the disaster network
          </p>
        </div>

        <button
          onClick={fetchResources}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search resources by name or description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading relief supplies catalog..." />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h4 className="font-semibold text-rose-900">Failed to load catalog</h4>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No Resources Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No relief items match your query. Items can be registered by DMA Supervisors.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredResources.map((res) => (
            <Card key={res.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <Badge variant={res.isActive ? 'success' : 'default'}>
                    {res.isActive ? 'Active Catalog' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{res.name}</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Unit: {res.unit}
                  </span>
                </div>

                {res.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {res.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
