import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { AdminRoute, OperationsRoute, ProtectedRoute, PublicRoute } from "./components/RouteGuards";
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

function ProtectedLayout() {
  return <><Navbar /><Outlet /></>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/companies" element={<Companies />} />
            <Route path="/fleets" element={<Fleets />} />
            <Route path="/ships" element={<Ships />} />
            <Route element={<OperationsRoute />}><Route path="/ports" element={<Ports />} /></Route>
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<Users />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
