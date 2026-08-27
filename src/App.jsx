import { useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { AdminRoute, CompanyAdminRoute, CompanyOnboardingGate, DocumentAccessRoute, OperationsRoute, ProtectedRoute, PublicRoute, SubscriptionGate } from "./components/RouteGuards";
import Companies from "./pages/Companies/Companies";
import Fleets from "./pages/Fleets/Fleets";
import Ships from "./pages/Ships/Ships";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Shipments from "./pages/Shipments/Shipments";
import Dashboard from "./pages/Dashboard/Dashboard";
import Documents from "./pages/Documents/Documents";
import ShipmentDetails from "./pages/ShipmentDetails/ShipmentDetails";
import Users from "./pages/Users/Users";
import Ports from "./pages/Ports/Ports";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Chatbot from "./pages/Chatbot/Chatbot";
import FloatingAssistant from "./components/FloatingAssistant/FloatingAssistant";
import Tracking from "./pages/Tracking/Tracking";
import CompanyOnboarding from "./pages/Onboarding/CompanyOnboarding";

import Subscription from "./pages/Subscription/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import ToastProvider from "./components/Toast/ToastProvider";

function ProtectedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <Navbar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <button type="button" className="mobile-nav-trigger" onClick={() => setSidebarCollapsed(true)} aria-label="Open navigation menu">☰</button>
      <div className="app-content"><Outlet /></div>
      <FloatingAssistant />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding/company" element={<CompanyOnboarding />} />
          <Route element={<CompanyOnboardingGate />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/subscription" element={<Subscription />} />
            <Route element={<SubscriptionGate />}>
            <Route element={<OperationsRoute />}>
              <Route path="/companies" element={<Companies />} />
              <Route path="/fleets" element={<Fleets />} />
              <Route path="/ships" element={<Ships />} />
              <Route path="/tracking" element={<Tracking />} />
            </Route>
            <Route element={<OperationsRoute />}><Route path="/ports" element={<Ports />} /></Route>
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<DocumentAccessRoute />}>
              <Route path="/documents" element={<Documents />} />
            </Route>
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
            <Route element={<CompanyAdminRoute />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            </Route>
          </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
