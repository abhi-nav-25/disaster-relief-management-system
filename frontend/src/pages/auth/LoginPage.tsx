import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { getRoleDashboardPath } from '../../utils/formatters';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await login({ email, password });
      const targetPath = from || getRoleDashboardPath(user.role);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to CrisisRelief
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Access your assigned disaster response command portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h6 className="font-semibold text-rose-900 mb-0.5">Authentication Error</h6>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@crisisrelief.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Continue
            </Button>
          </form>

          {/* Quick Helper for Test/Demo Roles */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Role Profiles Reference / Quick Form Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('control@crisis.org')}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60 font-medium text-left transition-colors cursor-pointer"
              >
                Control Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('supervisor@dma.gov')}
                className="p-2 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60 font-medium text-left transition-colors cursor-pointer"
              >
                DMA Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('manager@camp.org')}
                className="p-2 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60 font-medium text-left transition-colors cursor-pointer"
              >
                Camp Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teamalpha@relief.org')}
                className="p-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 font-medium text-left transition-colors cursor-pointer"
              >
                Relief Team
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Need a new account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Register user profile
          </Link>
        </p>
      </div>
    </div>
  );
};
