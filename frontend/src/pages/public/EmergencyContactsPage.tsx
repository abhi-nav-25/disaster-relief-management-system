import React, { useEffect, useState } from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Flame, Siren, AlertCircle, RefreshCw } from 'lucide-react';
import { emergencyService } from '../../services/emergency.service';
import type { EmergencyContact } from '../../types/models.types';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EmergencyContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emergencyService.getEmergencyContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load emergency contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getServiceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('medical') || t.includes('ambulance') || t.includes('hospital')) {
      return <HeartPulse className="w-5 h-5 text-rose-600" />;
    }
    if (t.includes('fire')) {
      return <Flame className="w-5 h-5 text-amber-600" />;
    }
    if (t.includes('police') || t.includes('security')) {
      return <Siren className="w-5 h-5 text-blue-600" />;
    }
    return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Incident Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Emergency Contacts & Helplines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct 24/7 hotline numbers for disaster rescue, medical, and relief coordination
          </p>
        </div>

        <button
          onClick={fetchContacts}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Helplines</span>
        </button>
      </div>

      {/* Primary National Numbers Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 112 - National Emergency */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-5 rounded-2xl shadow-md border border-rose-500/30 flex flex-col justify-between gap-4 transition-all hover:shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-200">
                National Emergency
              </span>
              <div className="mt-1">
                <a
                  href="tel:112"
                  aria-label="Call National Emergency 112"
                  className="text-3xl sm:text-4xl font-black tracking-tight text-white hover:text-rose-100 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded inline-block transition-colors"
                >
                  112
                </a>
              </div>
              <p className="text-xs text-rose-100 mt-1">Police / Medical / Fire All-in-One</p>
            </div>
            <div className="p-3 rounded-xl bg-white/15 text-rose-100 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>

          <div className="pt-3 border-t border-rose-500/50 flex items-center justify-between">
            <span className="text-[11px] text-rose-200 font-medium">Toll-Free • 24/7 Response</span>
            <a
              href="tel:112"
              aria-label="Call National Emergency 112"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>Call 112</span>
            </a>
          </div>
        </div>

        {/* 1077 - Disaster Helpline */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-5 rounded-2xl shadow-md border border-amber-500/30 flex flex-col justify-between gap-4 transition-all hover:shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-200">
                Disaster Helpline
              </span>
              <div className="mt-1">
                <a
                  href="tel:1077"
                  aria-label="Call Disaster Helpline 1077"
                  className="text-3xl sm:text-4xl font-black tracking-tight text-white hover:text-amber-100 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded inline-block transition-colors"
                >
                  1077
                </a>
              </div>
              <p className="text-xs text-amber-100 mt-1">Control Room & Relief Coordination</p>
            </div>
            <div className="p-3 rounded-xl bg-white/15 text-amber-100 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="pt-3 border-t border-amber-500/50 flex items-center justify-between">
            <span className="text-[11px] text-amber-200 font-medium">State Disaster Helpline</span>
            <a
              href="tel:1077"
              aria-label="Call Disaster Helpline 1077"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-amber-800 hover:bg-amber-50 font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>Call 1077</span>
            </a>
          </div>
        </div>

        {/* 108 - Ambulance Direct */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-md border border-blue-500/30 flex flex-col justify-between gap-4 transition-all hover:shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-200">
                Ambulance Direct
              </span>
              <div className="mt-1">
                <a
                  href="tel:108"
                  aria-label="Call Ambulance Direct 108"
                  className="text-3xl sm:text-4xl font-black tracking-tight text-white hover:text-blue-100 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded inline-block transition-colors"
                >
                  108
                </a>
              </div>
              <p className="text-xs text-blue-100 mt-1">Emergency Medical Services</p>
            </div>
            <div className="p-3 rounded-xl bg-white/15 text-blue-100 shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>

          <div className="pt-3 border-t border-blue-500/50 flex items-center justify-between">
            <span className="text-[11px] text-blue-200 font-medium">24/7 Medical Dispatch</span>
            <a
              href="tel:108"
              aria-label="Call Ambulance Direct 108"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Call 108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Fetching active emergency service contacts..." />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h4 className="font-semibold text-rose-900">Failed to fetch contacts</h4>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      ) : contacts.length === 0 ? (
        <Card className="text-center py-12">
          <PhoneCall className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No Emergency Contacts Registered</h4>
          <p className="text-xs text-slate-500 mt-1">
            Emergency contacts will appear here once added by disaster authority administrators.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-100">{getServiceIcon(contact.serviceType)}</div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {contact.serviceType}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{contact.name}</h3>
              {contact.description && (
                <p className="text-xs text-slate-500 mb-4">{contact.description}</p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${contact.phoneNumber}`}
                  aria-label={`Call ${contact.name} at ${contact.phoneNumber}`}
                  className="text-sm font-bold text-slate-900 hover:text-blue-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  {contact.phoneNumber}
                </a>
                <a
                  href={`tel:${contact.phoneNumber}`}
                  aria-label={`Call ${contact.name} at ${contact.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Now</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
