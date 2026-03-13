import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/dashboard" className="navbar-brand">
          LeetTracker
        </Link>
        <div className="navbar-right">
          <span className="navbar-user">Hi, {user.name}</span>
          <button onClick={logout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
