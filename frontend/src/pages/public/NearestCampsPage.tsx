import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, AlertCircle, Users } from 'lucide-react';
import { campService } from '../../services/camp.service';
import type { ReliefCamp } from '../../types/models.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const NearestCampsPage: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('13.0827');
  const [longitude, setLongitude] = useState<string>('80.2707');
  const [nearestCamps, setNearestCamps] = useState<ReliefCamp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearest = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campService.getNearestCamps(lat, lng);
      setNearestCamps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to locate nearest camps.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    fetchNearest(lat, lng);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toFixed(4));
        setLongitude(lng.toFixed(4));
        setIsLocating(false);
        fetchNearest(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve location. Please enter coordinates manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please enable location permissions in your browser or enter coordinates manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal is unavailable. Please enter coordinates manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter coordinates manually.';
        }
        setError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchNearest(parseFloat(latitude), parseFloat(longitude));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>Shelter Navigation Grid</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Find Nearest Relief Camp
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Calculate the closest operational relief shelters based on your live GPS coordinates
        </p>
      </div>

      {/* Coordinate Search & Geolocation Box */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Latitude Coordinate
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="13.0827"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Longitude Coordinate
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="80.2707"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-[42px]"
                isLoading={isLoading}
              >
                Find Closest Camps
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDetectLocation}
                className="h-[42px] px-3 bg-slate-700 hover:bg-slate-600"
                isLoading={isLocating}
                title="Detect Live GPS Location"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Results */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" label="Calculating Haversine geospatial proximity..." />
      ) : nearestCamps.length === 0 ? (
        <Card className="text-center py-12">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No Nearby Operational Camps Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no operational camps registered near these coordinates.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Top 3 Nearest Operational Camps
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearestCamps.map((camp, index) => {
              const distance =
                camp.distanceKm !== undefined ? Number(camp.distanceKm).toFixed(2) : '—';
              const occupancyPct =
                camp.capacity > 0
                  ? Math.min(Math.round((camp.currentOccupancy / camp.capacity) * 100), 100)
                  : 0;

              return (
                <Card
                  key={camp.id}
                  className="relative border-2 border-emerald-500/30 hover:border-emerald-500 transition-all shadow-sm"
                >
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{distance} km away</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{camp.officialCode}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{camp.name}</h4>

                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{camp.address}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Occupancy</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {camp.currentOccupancy} / {camp.capacity} ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Navigate via Google Maps</span>
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
