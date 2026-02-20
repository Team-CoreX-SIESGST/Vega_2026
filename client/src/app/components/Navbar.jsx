'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Train } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Problem", href: "#problem" },
    { label: "Solution", href: "#solution" },
    { label: "Features", href: "#features" },
    { label: "Tech Stack", href: "#tech" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-md bg-white/95 backdrop-blur-md" : "bg-white/80 backdrop-blur-sm"
      }`}
      style={{ borderBottom: "1px solid rgba(78,78,148,0.15)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="p-1.5 rounded-lg transition-all duration-200 group-hover:scale-105"
            style={{ backgroundColor: "rgba(78,78,148,0.1)" }}
          >
            <Train size={20} style={{ color: "#4E4E94" }} />
          </div>
          <span className="font-outfit font-bold text-xl" style={{ color: "#1A1A2E" }}>
            Rail<span style={{ color: "#4E4E94" }}>Mind</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#4A4A6A" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4E4E94")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A6A")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: "#4E4E94" }}
              >
                Dashboard
              </Link>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "#4A4A6A" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4E4E94")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A6A")}
              >
                Login
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: "#4E4E94" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
