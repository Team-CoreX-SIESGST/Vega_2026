"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Mail, Lock, ChevronDown, Loader2, Eye, EyeOff, MapPin } from "lucide-react";
import { getStations } from "@/services/stationService";

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
  const [form, setForm] = useState({ email: "", password: "", role: "", station: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.role) e.role = "Please select a role";
    if (isAdmin && !form.station) e.station = "Please select a station";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    // TODO: replace with real auth call
    await new Promise((res) => setTimeout(res, 1500));
    setSubmitting(false);
    alert(`Logged in as ${form.role} — ${form.email}`);
  };

  const selectedRole = ROLES.find((r) => r.value === form.role);
  const selectedStation = stations.find((s) => s.code === form.station);

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "10px",
              backgroundColor: "rgba(78,78,148,0.1)",
            }}
          >
            <Train size={20} style={{ color: "#4E4E94" }} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "1.3rem", color: "#1A1A2E", letterSpacing: "-0.01em" }}>
            Rail<span style={{ color: "#4E4E94" }}>Mind</span>
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "#4E4E94", marginBottom: "0.6rem" }}>
            Welcome back
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "300", color: "#1A1A2E", lineHeight: "1.2", margin: 0 }}>
            Sign in to your<br />
            <em style={{ fontStyle: "italic", fontWeight: "400" }}>account</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ ...iconStyle, left: "0.9rem" }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle(!!errors.email)}
                onFocus={(e) => (e.target.style.borderColor = "#4E4E94")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#e05252" : "rgba(78,78,148,0.2)")}
              />
            </div>
            <AnimatePresence>{errors.email && <ErrorMsg msg={errors.email} />}</AnimatePresence>
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
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                style={{ ...inputStyle(!!errors.password), paddingRight: "2.8rem" }}
                onFocus={(e) => (e.target.style.borderColor = "#4E4E94")}
                onBlur={(e) => (e.target.style.borderColor = errors.password ? "#e05252" : "rgba(78,78,148,0.2)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(78,78,148,0.5)", padding: 0 }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <AnimatePresence>{errors.password && <ErrorMsg msg={errors.password} />}</AnimatePresence>
          </div>

          {/* Role Dropdown */}
          <div>
            <label style={labelStyle}>Role</label>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => { setRoleOpen((v) => !v); setStationOpen(false); }}
                style={{
                  ...inputStyle(!!errors.role),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  color: selectedRole ? "#1A1A2E" : "rgba(78,78,148,0.4)",
                  paddingLeft: "1rem",
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>{selectedRole ? selectedRole.label : "Select your role"}</span>
                <motion.div animate={{ rotate: roleOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={15} style={{ color: "rgba(78,78,148,0.5)" }} />
                </motion.div>
              </div>
              <AnimatePresence>
                {roleOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={dropdownStyle}
                  >
                    {ROLES.map((role) => (
                      <div
                        key={role.value}
                        onClick={() => { setForm((f) => ({ ...f, role: role.value, station: "" })); setRoleOpen(false); }}
                        style={dropdownItemStyle(form.role === role.value)}
                        onMouseEnter={(e) => { if (form.role !== role.value) e.currentTarget.style.background = "rgba(78,78,148,0.06)"; }}
                        onMouseLeave={(e) => { if (form.role !== role.value) e.currentTarget.style.background = "transparent"; }}
                      >
                        {role.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>{errors.role && <ErrorMsg msg={errors.role} />}</AnimatePresence>
          </div>

          {/* Station Dropdown — only for Admin */}
          <AnimatePresence>
            {isAdmin && (
              <motion.div
                key="station"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <label style={labelStyle}>
                  <MapPin size={12} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
                  Assigned Station
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => { if (!stationsLoading && !stationsError) { setStationOpen((v) => !v); setRoleOpen(false); } }}
                    style={{
                      ...inputStyle(!!errors.station),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: stationsLoading ? "wait" : "pointer",
                      userSelect: "none",
                      color: selectedStation ? "#1A1A2E" : "rgba(78,78,148,0.4)",
                      paddingLeft: "1rem",
                      opacity: stationsError ? 0.6 : 1,
                    }}
                  >
                    {stationsLoading ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "rgba(78,78,148,0.5)" }}>
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                        Loading stations…
                      </span>
                    ) : stationsError ? (
                      <span style={{ fontSize: "0.875rem", color: "#e05252" }}>{stationsError}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: "0.875rem" }}>
                          {selectedStation ? (
                            <>
                              <span style={{ display: "block", fontWeight: 600 }}>{selectedStation.code}: {selectedStation.name}</span>
                              {selectedStation.state && (
                                <span style={{ display: "block", fontSize: "0.75rem", color: "rgba(78,78,148,0.6)", fontWeight: 400 }}>
                                  {selectedStation.state}
                                </span>
                              )}
                            </>
                          ) : (
                            "Select a station"
                          )}
                        </span>
                        <motion.div animate={{ rotate: stationOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} style={{ color: "rgba(78,78,148,0.5)" }} />
                        </motion.div>
                      </>
                    )}
                  </div>
                  <AnimatePresence>
                    {stationOpen && stations.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{ ...dropdownStyle, maxHeight: "180px", overflowY: "auto" }}
                      >
                        {stations.map((s) => (
                          <div
                            key={s.code}
                            onClick={() => { setForm((f) => ({ ...f, station: s.code })); setStationOpen(false); }}
                            style={dropdownItemStyle(form.station === s.code)}
                            onMouseEnter={(e) => { if (form.station !== s.code) e.currentTarget.style.background = "rgba(78,78,148,0.06)"; }}
                            onMouseLeave={(e) => { if (form.station !== s.code) e.currentTarget.style.background = "transparent"; }}
                          >
                            <span style={{ display: "block", fontWeight: 500 }}>{s.code}: {s.name}</span>
                            {s.state && (
                              <span style={{ display: "block", fontSize: "0.75rem", color: "rgba(78,78,148,0.65)", marginTop: "0.15rem" }}>
                                {s.state}
                              </span>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>{errors.station && <ErrorMsg msg={errors.station} />}</AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginTop: "-0.3rem" }}>
            <a
              href="#"
              style={{ fontSize: "0.75rem", color: "#4E4E94", textDecoration: "none", letterSpacing: "0.01em" }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
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
            {submitting && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {submitting ? "Signing in…" : "Sign In"}
          </motion.button>
        </form>

        <p style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.72rem", color: "rgba(74,74,106,0.5)", letterSpacing: "0.05em" }}>
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
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1.5px solid rgba(78,78,148,0.15)",
  borderRadius: "10px",
  boxShadow: "0 8px 32px rgba(78,78,148,0.12)",
  zIndex: 100,
  overflow: "hidden",
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
});

const ErrorMsg = ({ msg }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    style={{ margin: "0.35rem 0 0", fontSize: "0.72rem", color: "#e05252", letterSpacing: "0.02em" }}
  >
    {msg}
  </motion.p>
);

export default LoginPage;