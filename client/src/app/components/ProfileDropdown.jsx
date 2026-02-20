"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, ChevronDown, Home, LayoutDashboard, LogOut, MapPinned, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const normalizeRole = (role = "") =>
  String(role).trim().toLowerCase().replace(/[\s_]+/g, "");

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return `${parts[0][0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
};

export default function ProfileDropdown({ className = "" }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const normalizedRole = useMemo(() => normalizeRole(user?.role), [user?.role]);
  const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";
  const homeHref = isAdmin ? "/" : "/mobile";
  const homeLabel = isAdmin ? "Home" : "Mobile Home";

  const hiddenOnRoute =
    pathname?.startsWith("/auth") || pathname?.startsWith("/oauth-callback");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  if (loading || !user || hiddenOnRoute) return null;

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border px-2.5 py-2 sm:px-3 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-200 hover:shadow-md"
        style={{ borderColor: "rgba(78,78,148,0.2)" }}
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: "rgba(78,78,148,0.12)", color: "#4E4E94" }}
        >
          {getInitials(user.name)}
        </span>
        <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
          {user.name || "Profile"}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          style={{ color: "#4E4E94" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[88vw] max-w-64 sm:w-64 rounded-xl border bg-white shadow-xl overflow-hidden z-50"
          style={{ borderColor: "rgba(78,78,148,0.2)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderBottomColor: "rgba(78,78,148,0.1)" }}>
            <div className="text-sm font-semibold text-slate-900 truncate">{user.name || "User"}</div>
            <div className="text-xs text-slate-500 truncate">{user.email || "No email"}</div>
            <div className="mt-2 inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
              {user.role || "user"}
            </div>
          </div>

          <div className="p-1">
            <Link
              href={homeHref}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Home size={15} />
              {homeLabel}
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  href="/map"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <MapPinned size={15} />
                  Map View
                </Link>
                <Link
                  href="/dashboard/train-alerts"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <AlertCircle size={15} />
                  Train Alerts
                </Link>
              </>
            )}
          </div>

          <div className="p-1 border-t" style={{ borderTopColor: "rgba(78,78,148,0.1)" }}>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut size={15} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
