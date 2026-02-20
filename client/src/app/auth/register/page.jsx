"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train,
  Mail,
  Lock,
  User,
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

const RegisterPage = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
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
    if (!form.name?.trim()) e.name = "Name is required";
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
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const result = await register(
      form.name.trim(),
      form.email,
      form.password,
      form.role,
      form.station || null,
    );
    setSubmitting(false);
    if (result.success) {
      router.push("/");
      return;
    }
    setErrors({ api: result.error || "Registration failed. Please try again." });
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
            Get started
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
            Create your
            <br />
            <em style={{ fontStyle: "italic", fontWeight: "400" }}>account</em>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={15} style={{ ...iconStyle, left: "0.9rem" }} />
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                style={inputStyle(!!errors.name)}
                onFocus={(e) => (e.target.style.borderColor = "#4E4E94")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.name
                    ? "#e05252"
                    : "rgba(78,78,148,0.2)")
                }
              />
            </div>
            <AnimatePresence>
              {errors.name && <ErrorMsg msg={errors.name} />}
            </AnimatePresence>
          </div>

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

          {/* Role Dropdown */}
          <div ref={roleRef}>
            <label style={labelStyle}>Role</label>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => {
                  setRoleOpen((v) => !v);
                  setStationOpen(false);
                  setRoleSearch(""); // Reset search on open
                }}
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
                <span style={{ fontSize: "0.875rem" }}>
                  {selectedRole ? selectedRole.label : "Select your role"}
                </span>
                <motion.div
                  animate={{ rotate: roleOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={15}
                    style={{ color: "rgba(78,78,148,0.5)" }}
                  />
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
                    {/* Search Input for Roles */}
                    <div style={searchContainerStyle}>
                      <Search
                        size={14}
                        style={{
                          color: "rgba(78,78,148,0.5)",
                          marginRight: "8px",
                        }}
                      />
                      <input
                        ref={roleInputRef}
                        type="text"
                        placeholder="Search role..."
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        style={searchInputStyle}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {roleSearch && (
                        <X
                          size={14}
                          style={{
                            color: "rgba(78,78,148,0.5)",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoleSearch("");
                            roleInputRef.current?.focus();
                          }}
                        />
                      )}
                    </div>

                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <div
                            key={role.value}
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                role: role.value,
                                station: "",
                              }));
                              setRoleOpen(false);
                              setRoleSearch("");
                            }}
                            style={dropdownItemStyle(form.role === role.value)}
                            onMouseEnter={(e) => {
                              if (form.role !== role.value)
                                e.currentTarget.style.background =
                                  "rgba(78,78,148,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              if (form.role !== role.value)
                                e.currentTarget.style.background =
                                  "transparent";
                            }}
                          >
                            {role.label}
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            ...dropdownItemStyle(false),
                            color: "rgba(78,78,148,0.5)",
                            cursor: "default",
                          }}
                        >
                          No roles found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {errors.role && <ErrorMsg msg={errors.role} />}
            </AnimatePresence>
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
                ref={stationRef}
              >
                <label style={labelStyle}>
                  <MapPin
                    size={12}
                    style={{
                      display: "inline",
                      marginRight: "0.3rem",
                      verticalAlign: "middle",
                    }}
                  />
                  Assigned Station
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => {
                      if (!stationsLoading && !stationsError) {
                        setStationOpen((v) => !v);
                        setRoleOpen(false);
                        setStationSearch(""); // Reset search on open
                      }
                    }}
                    style={{
                      ...inputStyle(!!errors.station),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: stationsLoading ? "wait" : "pointer",
                      userSelect: "none",
                      color: selectedStation
                        ? "#1A1A2E"
                        : "rgba(78,78,148,0.4)",
                      paddingLeft: "1rem",
                      opacity: stationsError ? 0.6 : 1,
                    }}
                  >
                    {stationsLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "rgba(78,78,148,0.5)",
                        }}
                      >
                        <Loader2
                          size={13}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Loading stations…
                      </span>
                    ) : stationsError ? (
                      <span style={{ fontSize: "0.875rem", color: "#e05252" }}>
                        {stationsError}
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: "0.875rem" }}>
                          {selectedStation ? (
                            <>
                              <span
                                style={{ display: "block", fontWeight: 600 }}
                              >
                                {selectedStation.code}: {selectedStation.name}
                              </span>
                              {selectedStation.state && (
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "0.75rem",
                                    color: "rgba(78,78,148,0.6)",
                                    fontWeight: 400,
                                  }}
                                >
                                  {selectedStation.state}
                                </span>
                              )}
                            </>
                          ) : (
                            "Select a station"
                          )}
                        </span>
                        <motion.div
                          animate={{ rotate: stationOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown
                            size={15}
                            style={{ color: "rgba(78,78,148,0.5)" }}
                          />
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
                        style={dropdownStyle}
                      >
                        {/* Search Input for Stations */}
                        <div style={searchContainerStyle}>
                          <Search
                            size={14}
                            style={{
                              color: "rgba(78,78,148,0.5)",
                              marginRight: "8px",
                            }}
                          />
                          <input
                            ref={stationInputRef}
                            type="text"
                            placeholder="Search station code or name..."
                            value={stationSearch}
                            onChange={(e) => setStationSearch(e.target.value)}
                            style={searchInputStyle}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {stationSearch && (
                            <X
                              size={14}
                              style={{
                                color: "rgba(78,78,148,0.5)",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setStationSearch("");
                                stationInputRef.current?.focus();
                              }}
                            />
                          )}
                        </div>

                        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                          {filteredStations.length > 0 ? (
                            filteredStations.map((s) => (
                              <div
                                key={s.code}
                                onClick={() => {
                                  setForm((f) => ({ ...f, station: s.code }));
                                  setStationOpen(false);
                                  setStationSearch("");
                                }}
                                style={dropdownItemStyle(
                                  form.station === s.code,
                                )}
                                onMouseEnter={(e) => {
                                  if (form.station !== s.code)
                                    e.currentTarget.style.background =
                                      "rgba(78,78,148,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                  if (form.station !== s.code)
                                    e.currentTarget.style.background =
                                      "transparent";
                                }}
                              >
                                <span
                                  style={{ display: "block", fontWeight: 500 }}
                                >
                                  {s.code}: {s.name}
                                </span>
                                {s.state && (
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "0.75rem",
                                      color: "rgba(78,78,148,0.65)",
                                      marginTop: "0.15rem",
                                    }}
                                  >
                                    {s.state}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                ...dropdownItemStyle(false),
                                color: "rgba(78,78,148,0.5)",
                                cursor: "default",
                              }}
                            >
                              No stations found
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.station && <ErrorMsg msg={errors.station} />}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API error */}
          <AnimatePresence>
            {errors.api && <ErrorMsg msg={errors.api} />}
          </AnimatePresence>

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
            {submitting ? "Creating account…" : "Sign Up"}
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
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{ color: "#4E4E94", fontWeight: "600", textDecoration: "none" }}
          >
            Sign in
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

export default RegisterPage;
