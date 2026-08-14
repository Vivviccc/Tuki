import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupHomePage } from './pages/GroupHomePage';
import { GroupMapPage } from './pages/GroupMapPage';
import { GroupActivityPage } from './pages/GroupActivityPage';
import { GroupMembersPage } from './pages/GroupMembersPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected App Routes */}
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GroupsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GroupHomePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId/map"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GroupMapPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId/activity"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GroupActivityPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId/members"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GroupMembersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/places/:placeId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PlaceDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Default Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};
