import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Guards
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { RoleRoute } from '../components/guards/RoleRoute';

// Public & Auth Pages
import { HomePage } from '../pages/public/HomePage';
import { PublicCampsPage } from '../pages/public/PublicCampsPage';
import { NearestCampsPage } from '../pages/public/NearestCampsPage';
import { EmergencyContactsPage } from '../pages/public/EmergencyContactsPage';
import { PublicResourcesPage } from '../pages/public/PublicResourcesPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Dashboards
import { CitizenDashboard } from '../pages/dashboards/CitizenDashboard';
import { CampManagerDashboard } from '../pages/dashboards/CampManagerDashboard';
import { ControlCentreDashboard } from '../pages/dashboards/ControlCentreDashboard';
import { DmaSupervisorDashboard } from '../pages/dashboards/DmaSupervisorDashboard';
import { ReliefTeamDashboard } from '../pages/dashboards/ReliefTeamDashboard';

// Hooks & Utils
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardPath } from '../utils/formatters';

// Component that redirects /dashboard to user specific dashboard
const DashboardRedirector: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/camps" element={<PublicCampsPage />} />
        <Route path="/camps/nearest" element={<NearestCampsPage />} />
        <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
        <Route path="/resources" element={<PublicResourcesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated Role Dashboards */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRedirector />} />

          {/* Citizen Dashboard */}
          <Route element={<RoleRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          </Route>

          {/* Relief Camp Manager Dashboard */}
          <Route element={<RoleRoute allowedRoles={['RELIEF_CAMP_MANAGER']} />}>
            <Route path="/dashboard/camp-manager" element={<CampManagerDashboard />} />
          </Route>

          {/* Control Centre Operator Dashboard */}
          <Route element={<RoleRoute allowedRoles={['CONTROL_CENTRE_OPERATOR']} />}>
            <Route path="/dashboard/control-centre" element={<ControlCentreDashboard />} />
          </Route>

          {/* DMA Supervisor Dashboard */}
          <Route element={<RoleRoute allowedRoles={['DMA_SUPERVISOR']} />}>
            <Route path="/dashboard/dma-supervisor" element={<DmaSupervisorDashboard />} />
            <Route path="/dashboard/dma" element={<Navigate to="/dashboard/dma-supervisor" replace />} />
          </Route>

          {/* Relief Team Dashboard */}
          <Route element={<RoleRoute allowedRoles={['RELIEF_TEAM']} />}>
            <Route path="/dashboard/relief-team" element={<ReliefTeamDashboard />} />
            <Route path="/dashboard/team" element={<Navigate to="/dashboard/relief-team" replace />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
