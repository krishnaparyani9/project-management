import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SignupPage from "../pages/SignupPage";
import StudentDashboard from "../pages/StudentDashboard";
import GuideDashboard from "../pages/GuideDashboard";
import GroupPage from "../pages/GroupPage";
import TasksPage from "../pages/TasksPage";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

const DashboardHome = () => {
  const { user } = useAuth();
  if (user?.role === "guide") return <GuideDashboard />;
  if (user?.role === "admin") return <Navigate to="/groups" replace />;
  return <StudentDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
