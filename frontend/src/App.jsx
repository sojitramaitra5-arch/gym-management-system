import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberList from './pages/members/MemberList';
import PlanList from './pages/plans/PlanList';
import MembershipList from './pages/memberships/MembershipList';
import EventList from './pages/events/EventList';
import EquipmentList from './pages/equipment/EquipmentList';
import SupplementStore from './pages/supplements/SupplementStore';
import CartPage from './pages/cart/CartPage';

// Dispatches between Admin Dashboard and Member Portal
const HomeDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'member') {
    return <MemberDashboard />;
  }
  return <Dashboard />;
};

// Restricts Cart to Members only; Admins are redirected
const MemberCartRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/supplements" replace />;
  }
  return <CartPage />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Shared or role-dispatched routes */}
                <Route path="/" element={<HomeDispatcher />} />
                <Route path="/plans" element={<PlanList />} />
                <Route path="/offers" element={<Navigate to="/plans?tab=offers" replace />} />
                <Route path="/equipment" element={<EquipmentList />} />
                <Route path="/supplements" element={<SupplementStore />} />
                <Route path="/cart" element={<MemberCartRoute />} />
                <Route path="/events" element={<EventList />} />

              {/* Admin-only restricted management routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
                <Route path="/members" element={<MemberList />} />
                <Route path="/memberships" element={<MembershipList />} />
                <Route path="/subscriptions" element={<Navigate to="/memberships" replace />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
