import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  PhoneCall,
  Package,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Compass,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { campService } from '../../services/camp.service';
import { emergencyService } from '../../services/emergency.service';
import { resourceService } from '../../services/resource.service';
import type { ReliefCamp, EmergencyContact, Resource } from '../../types/models.types';
import { getCampStatusColor } from '../../utils/formatters';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();

  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Nearest Camp Search state inside Citizen Dashboard
  const [lat, setLat] = useState('13.0827');
  const [lng, setLng] = useState('80.2707');
  const [nearestCamps, setNearestCamps] = useState<ReliefCamp[]>([]);
  const [isSearchingNearest, setIsSearchingNearest] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [nearestError, setNearestError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [campsData, contactsData, resourcesData] = await Promise.all([
        campService.getAllCamps(),
        emergencyService.getEmergencyContacts().catch(() => []),
        resourceService.getAllResources().catch(() => []),
      ]);
      setCamps(campsData);
      setContacts(contactsData);
      setResources(resourcesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load relief network data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchNearest = async (latitudeNum: number, longitudeNum: number) => {
    setIsSearchingNearest(true);
    setNearestError(null);
    try {
      const results = await campService.getNearestCamps(latitudeNum, longitudeNum);
      setNearestCamps(results);
    } catch (err: any) {
      setNearestError(err.response?.data?.message || 'Failed to calculate nearest relief camps.');
    } finally {
      setIsSearchingNearest(false);
    }
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setNearestError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGps(true);
    setNearestError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;
        setLat(liveLat.toFixed(4));
        setLng(liveLng.toFixed(4));
        setIsLocatingGps(false);
        handleSearchNearest(liveLat, liveLng);
      },
      (err) => {
        setIsLocatingGps(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access or input coordinates manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal is unavailable. Please enter coordinates manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setNearestError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    loadDashboardData();
    handleSearchNearest(parseFloat(lat), parseFloat(lng));
  }, []);

  const operationalCampsCount = camps.filter(
    (c) => c.operationalStatus === 'OPERATIONAL' || c.operationalStatus === 'LIMITED'
  ).length;

  const totalOccupancy = camps.reduce((sum, c) => sum + (c.currentOccupancy || 0), 0);
  const totalCapacity = camps.reduce((sum, c) => sum + (c.capacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Public Relief Assistance Grid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Welcome, {user?.name || 'Citizen'}
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Access real-time information on nearest safe shelters, emergency helplines, and government relief supplies in your area.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-xs border border-blue-400/30 transition-colors cursor-pointer"
              title="Refresh Network Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
            <Link
              to="/camps/nearest"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 shadow-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Find Nearest Shelter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Advisory Alert */}
      <Alert
        type="info"
        title="Disaster Emergency Protocol Advisory"
        message="Follow official instructions from disaster response teams. In life-threatening emergencies, dial 112 or 1077 immediately."
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Quick Real Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Operational Relief Shelters"
          value={isLoading ? 'Loading...' : `${operationalCampsCount} Active`}
          icon={Building2}
          colorScheme="blue"
          description={
            totalCapacity > 0
              ? `${totalOccupancy} / ${totalCapacity} Sheltered Occupants`
              : 'Registered operational camps'
          }
        />
        <StatCard
          title="Emergency Helplines"
          value={isLoading ? 'Loading...' : contacts.length > 0 ? `${contacts.length} Hotlines` : '24/7 (112 / 1077)'}
          icon={PhoneCall}
          colorScheme="rose"
          description="Medical, rescue, police hotlines"
        />
        <StatCard
          title="Relief Supply Catalog"
          value={isLoading ? 'Loading...' : `${resources.length} Commodities`}
          icon={Package}
          colorScheme="emerald"
          description="Standard relief resources catalogued"
        />
      </div>

      {/* Live Nearest Shelter Proximity Widget */}
      <Card className="border-emerald-200/80 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instant Shelter Proximity Calculator</h3>
              <p className="text-xs text-slate-300">
                Find the 3 closest operational relief camps to your current coordinates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGpsDetect}
              isLoading={isLocatingGps}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Live GPS</span>
            </Button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchNearest(parseFloat(lat), parseFloat(lng));
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full bg-slate-700 hover:bg-slate-600 h-[38px] text-xs text-white cursor-pointer"
              isLoading={isSearchingNearest}
            >
              Calculate Distances
            </Button>
          </div>
        </form>

        {nearestError && (
          <div className="p-3 rounded-lg bg-rose-900/40 border border-rose-500/50 text-rose-200 text-xs mb-4">
            {nearestError}
          </div>
        )}

        {isSearchingNearest ? (
          <LoadingSpinner size="sm" label="Locating closest relief camps..." />
        ) : nearestCamps.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No operational relief camps found near these coordinates.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {nearestCamps.map((camp, idx) => (
              <div
                key={camp.id}
                className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-sm">{camp.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{camp.address}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] shrink-0">
                    {camp.distanceKm !== undefined ? `${Number(camp.distanceKm).toFixed(2)} km` : `#${idx + 1}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Occupancy: {camp.currentOccupancy}/{camp.capacity}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Maps</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active Relief Camps Table / Grid Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Active Relief Camps Overview</h3>
          </div>
          <Link
            to="/camps"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View Full Directory ({camps.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" label="Loading relief camps..." />
        ) : camps.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">
            No relief camps currently available in the database.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {camps.slice(0, 3).map((camp) => {
              const occupancyPct =
                camp.capacity > 0
                  ? Math.min(Math.round((camp.currentOccupancy / camp.capacity) * 100), 100)
                  : 0;

              return (
                <Card key={camp.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {camp.officialCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{camp.name}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${getCampStatusColor(
                          camp.operationalStatus
                        )}`}
                      >
                        {camp.operationalStatus}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{camp.address}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Occupancy</span>
                        </span>
                        <span className="font-semibold text-slate-700">
                          {camp.currentOccupancy} / {camp.capacity} ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency Contacts & Helplines Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Emergency Hotlines & Helplines</h3>
          </div>
          <Link
            to="/emergency-contacts"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
          >
            <span>All Helplines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                National Emergency
              </span>
              <h4 className="text-xl font-extrabold text-rose-900 mt-0.5">112</h4>
              <p className="text-[11px] text-rose-600">Police / Ambulance / Fire</p>
            </div>
            <a
              href="tel:112"
              className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              title="Call 112"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Disaster Control Room
              </span>
              <h4 className="text-xl font-extrabold text-amber-900 mt-0.5">1077</h4>
              <p className="text-[11px] text-amber-600">Disaster Management Helpline</p>
            </div>
            <a
              href="tel:1077"
              className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              title="Call 1077"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Ambulance Emergency
              </span>
              <h4 className="text-xl font-extrabold text-blue-900 mt-0.5">108</h4>
              <p className="text-[11px] text-blue-600">Emergency Medical Service</p>
            </div>
            <a
              href="tel:108"
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title="Call 108"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Card className="hover:border-blue-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Relief Camps Directory</h4>
          <p className="text-xs text-slate-500 mb-4">
            View full camp addresses, shelter occupancy capacity, and operational status in your district.
          </p>
          <Link
            to="/camps"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Camps List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="hover:border-emerald-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Nearest Camp Locator</h4>
          <p className="text-xs text-slate-500 mb-4">
            Calculate distances to the 3 closest operational shelters using live GPS navigation.
          </p>
          <Link
            to="/camps/nearest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Calculate Proximity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="hover:border-indigo-300 transition-all hover:shadow-md">
          <div className="p-3 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Relief Supply Catalog</h4>
          <p className="text-xs text-slate-500 mb-4">
            Browse standard relief commodities, ration packages, medical supplies, and aid kits.
          </p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Supplies ({resources.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
};

