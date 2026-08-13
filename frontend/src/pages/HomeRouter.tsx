import { useAuth } from "../context/AuthContext";
import { Landing } from "./landing/Landing";
import { Dashboard } from "./Dashboard/Dashboard";

export const HomeRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Do not render either Landing or Dashboard
  // until authentication has been restored.
  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Dashboard /> : <Landing />;
};
