import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-600">
              Hi, {user.name.split(" ")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 transition"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
