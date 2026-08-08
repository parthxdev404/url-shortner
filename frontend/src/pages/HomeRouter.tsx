import { useAuth } from "../context/AuthContext";
import { Landing } from "./landing/Landing";
import { Dashboard } from "./Dashboard/Dashboard";
import { ProtectedRoute } from "./auth/ProtectedRoute";

export const HomeRouter = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ) : (
    <Landing />
  );
};
