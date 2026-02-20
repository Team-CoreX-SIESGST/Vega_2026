'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import GlowButton from "./GlowButton";
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Tracking", href: "#tracking" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:shadow-neon transition-all">
              <span className="font-display text-sm font-bold text-primary">AI</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground hidden sm:block">
              AI Collective Arena
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span>{user?.name || 'Account'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-1 z-50 border border-border">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link href="/auth/register">
                  <GlowButton size="sm">
                    Sign up
                  </GlowButton>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden glass mt-4 rounded-lg p-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors font-medium py-2">
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <GlowButton size="sm" className="w-full">
                    Go to Dashboard
                  </GlowButton>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="block w-full text-center py-2 px-4 text-sm font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <GlowButton size="sm" className="w-full">
                      Sign up
                    </GlowButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;