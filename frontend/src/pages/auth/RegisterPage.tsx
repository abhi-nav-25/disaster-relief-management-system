import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Lock, Mail, Phone, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import type { UserRole } from '../../types/auth.types';
import type { ReliefCamp } from '../../types/models.types';
import { campService } from '../../services/camp.service';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [managedCampId, setManagedCampId] = useState<number | undefined>(undefined);

  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'RELIEF_CAMP_MANAGER') {
      setIsLoadingCamps(true);
      campService
        .getAllCamps()
        .then((data) => {
          setCamps(data);
          if (data.length > 0 && !managedCampId) {
            setManagedCampId(data[0].id);
          }
        })
        .catch(() => {
          setErrorMessage('Could not load camps list. Please make sure backend is running.');
        })
        .finally(() => setIsLoadingCamps(false));
    } else {
      setManagedCampId(undefined);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (role === 'RELIEF_CAMP_MANAGER' && !managedCampId) {
      setErrorMessage('Camp Manager must select an assigned relief camp.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        role,
        managedCampId: role === 'RELIEF_CAMP_MANAGER' ? managedCampId : undefined,
      });

      setSuccessMessage('Registration successful! You can now sign in with your credentials.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Register User Account
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Create an account to participate in disaster response and relief operations
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h6 className="font-semibold text-rose-900 mb-0.5">Registration Error</h6>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h6 className="font-semibold text-emerald-900 mb-0.5">Success</h6>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Officer Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@disastergrid.gov"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Designated Operational Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="CITIZEN">Citizen / Public Relief User</option>
                <option value="RELIEF_CAMP_MANAGER">Relief Camp Manager</option>
                <option value="CONTROL_CENTRE_OPERATOR">Control Centre Operator</option>
                <option value="DMA_SUPERVISOR">DMA Supervisor (Administrator)</option>
                <option value="RELIEF_TEAM">Relief Field Team Member</option>
              </select>
            </div>

            {/* Conditional Camp Selection for Camp Manager */}
            {role === 'RELIEF_CAMP_MANAGER' && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1.5">
                  Assigned Relief Camp (Required)
                </label>
                {isLoadingCamps ? (
                  <p className="text-xs text-slate-500">Loading camps catalog...</p>
                ) : camps.length > 0 ? (
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={managedCampId || ''}
                      onChange={(e) => setManagedCampId(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-blue-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    >
                      {camps.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.name} ({camp.officialCode}) - {camp.address}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-rose-600">
                    No relief camps found in database. DMA Supervisor must create camps first.
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign In to Account
          </Link>
        </p>
      </div>
    </div>
  );
};
