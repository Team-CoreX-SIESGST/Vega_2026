"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train,
  Mail,
  Lock,
  ChevronDown,
  Loader2,
  Eye,
  EyeOff,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { getStations } from "@/services/stationService";
import { useAuth } from "@/contexts/AuthContext";

const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

// Normalize API response (GeoJSON FeatureCollection) to list of { code, name, state }
const normalizeStations = (apiResponse) => {
  const raw = apiResponse?.data?.stations;
  if (!raw) return [];
  const features = raw.features ?? (Array.isArray(raw) ? raw : []);
  return features
    .map((f) => {
      const p = f.properties ?? f;
      const code = p.code ?? "";
      const name = p.name ?? "";
      const state = p.state ?? "";
      return { code, name, state };
    })
    .filter((s) => s.code || s.name);
};

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams.get("redirect");
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    station: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Search states
  const [roleSearch, setRoleSearch] = useState("");
  const [stationSearch, setStationSearch] = useState("");

  // Refs for closing dropdowns on outside click
  const roleRef = useRef(null);
  const stationRef = useRef(null);
  const roleInputRef = useRef(null);
  const stationInputRef = useRef(null);

  const isAdmin = form.role === "admin";

  // Fetch stations when admin role is selected
  useEffect(() => {
    if (!isAdmin) {
      setStations([]);
      setForm((f) => ({ ...f, station: "" }));
      return;
    }
    setStationsLoading(true);
    setStationsError(null);
    getStations()
      .then((res) => setStations(normalizeStations(res)))
      .catch(() => setStationsError("Failed to load stations. Try again."))
      .finally(() => setStationsLoading(false));
  }, [isAdmin]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleOpen(false);
      }
      if (stationRef.current && !stationRef.current.contains(event.target)) {
        setStationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (roleOpen && roleInputRef.current) {
      setTimeout(() => roleInputRef.current.focus(), 100);
    }
  }, [roleOpen]);

  useEffect(() => {
    if (stationOpen && stationInputRef.current) {
      setTimeout(() => stationInputRef.current.focus(), 100);
    }
  }, [stationOpen]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.success) {
      router.push(safeRedirect);
      return;
    }
    setErrors({ api: result.error || "Login failed. Please try again." });
  };

  const selectedRole = ROLES.find((r) => r.value === form.role);
  const selectedStation = stations.find((s) => s.code === form.station);

  // Filter functions
  const filteredRoles = ROLES.filter((r) =>
    r.label.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const filteredStations = stations
    .filter(
      (s) =>
        s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(stationSearch.toLowerCase()) ||
        (s.state &&
          s.state.toLowerCase().includes(stationSearch.toLowerCase())),
    )
    .slice(0, 100); // Keep performance cap

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display), 'Outfit', sans-serif",
        background: "#F7F7FB",
        padding: "2rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "420px" }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "10px",
              backgroundColor: "rgba(78,78,148,0.1)",
            }}
          >
            <Train size={20} style={{ color: "#4E4E94" }} />
          </div>
          <span
            style={{
              fontWeight: "700",
              fontSize: "1.3rem",
              color: "#1A1A2E",
              letterSpacing: "-0.01em",
            }}
          >
            Rail<span style={{ color: "#4E4E94" }}>Mind</span>
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#4E4E94",
              marginBottom: "0.6rem",
            }}
          >
            Welcome back
          </p>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: "300",
              color: "#1A1A2E",
              lineHeight: "1.2",
              margin: 0,
            }}
          >
            Login to your
            <br />
            <em style={{ fontStyle: "italic", fontWeight: "400" }}>account</em>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ ...iconStyle, left: "0.9rem" }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                style={inputStyle(!!errors.email)}
                onFocus={(e) => (e.target.style.borderColor = "#4E4E94")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.email
                    ? "#e05252"
                    : "rgba(78,78,148,0.2)")
                }
              />
            </div>
            <AnimatePresence>
              {errors.email && <ErrorMsg msg={errors.email} />}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ ...iconStyle, left: "0.9rem" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                style={{
                  ...inputStyle(!!errors.password),
                  paddingRight: "2.8rem",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4E4E94")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.password
                    ? "#e05252"
                    : "rgba(78,78,148,0.2)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(78,78,148,0.5)",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && <ErrorMsg msg={errors.password} />}
            </AnimatePresence>
          </div>

          {/* API error */}
          <AnimatePresence>
            {errors.api && <ErrorMsg msg={errors.api} />}
          </AnimatePresence>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginTop: "-0.3rem" }}>
            <a
              href="#"
              style={{
                fontSize: "0.75rem",
                color: "#4E4E94",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.015 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "10px",
              background: submitting ? "rgba(78,78,148,0.6)" : "#4E4E94",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-display), 'Outfit', sans-serif",
              fontSize: "0.9rem",
              fontWeight: "600",
              letterSpacing: "0.04em",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.4rem",
              boxShadow: "0 4px 20px rgba(78,78,148,0.3)",
              transition: "background 0.2s",
            }}
          >
            {submitting && (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {submitting ? "Signing in…" : "Sign In"}
          </motion.button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "rgba(74,74,106,0.7)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            style={{ color: "#4E4E94", fontWeight: "600", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
        <p
          style={{
            marginTop: "0.5rem",
            textAlign: "center",
            fontSize: "0.72rem",
            color: "rgba(74,74,106,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          SECURE ACCESS · RAILMIND OPERATIONS PLATFORM
        </p>
      </motion.div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// Shared styles
const labelStyle = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: "600",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#4A4A6A",
  marginBottom: "0.45rem",
  fontFamily: "var(--font-display), 'Outfit', sans-serif",
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "0.72rem 1rem 0.72rem 2.5rem",
  borderRadius: "10px",
  border: `1.5px solid ${hasError ? "#e05252" : "rgba(78,78,148,0.2)"}`,
  background: "#fff",
  fontSize: "0.875rem",
  color: "#1A1A2E",
  outline: "none",
  fontFamily: "var(--font-display), 'Outfit', sans-serif",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const iconStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(78,78,148,0.4)",
  pointerEvents: "none",
};

const dropdownStyle = {
  position: "relative",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1.5px solid rgba(78,78,148,0.15)",
  borderRadius: "10px",
  boxShadow: "0 8px 32px rgba(78,78,148,0.12)",
  zIndex: 1000,
  overflow: "hidden",
};

const searchContainerStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.6rem 0.8rem",
  borderBottom: "1px solid rgba(78,78,148,0.1)",
  backgroundColor: "rgba(78,78,148,0.02)",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const searchInputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "0.875rem",
  color: "#1A1A2E",
  fontFamily: "var(--font-display), 'Outfit', sans-serif",
};

const dropdownItemStyle = (active) => ({
  padding: "0.65rem 1rem",
  fontSize: "0.875rem",
  color: active ? "#4E4E94" : "#1A1A2E",
  background: active ? "rgba(78,78,148,0.08)" : "transparent",
  cursor: "pointer",
  fontFamily: "var(--font-display), 'Outfit', sans-serif",
  fontWeight: active ? "600" : "400",
  transition: "background 0.15s",
  borderBottom: "1px solid rgba(78,78,148,0.05)",
});

const ErrorMsg = ({ msg }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    style={{
      margin: "0.35rem 0 0",
      fontSize: "0.72rem",
      color: "#e05252",
      letterSpacing: "0.02em",
    }}
  >
    {msg}
  </motion.p>
);

function LoginPageFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display), 'Outfit', sans-serif",
        background: "#F7F7FB",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          border: "2px solid rgba(78,78,148,0.2)",
          borderTopColor: "#4E4E94",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPage />
    </Suspense>
  );
}
