import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogOut}
        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
      >
        Logout
      </button>
    </div>
  );
};
