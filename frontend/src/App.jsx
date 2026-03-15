import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageServices from "./pages/admin/ManageServices";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SearchServices from "./pages/customer/SearchServices";
import MyRequests from "./pages/customer/MyRequests";

import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageServices />
            </ProtectedRoute>
          } />

          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/services" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <SearchServices />
            </ProtectedRoute>
          } />
          <Route path="/customer/requests" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyRequests />
            </ProtectedRoute>
          } />

          <Route path="/professional" element={
            <ProtectedRoute allowedRoles={["professional"]}>
              <ProfessionalDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

