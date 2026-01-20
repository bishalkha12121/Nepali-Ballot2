import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Vote, BarChart3, History, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/vote", label: "Vote Now", icon: Vote },
  { path: "/results", label: "Live Results", icon: BarChart3 },
  { path: "/history", label: "History", icon: History },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <div className="w-10 h-10 relative">
                {/* Nepal Flag inspired logo */}
                <svg viewBox="0 0 40 48" className="w-full h-full">
                  <polygon points="0,0 40,16 0,32" fill="#D90429" />
                  <polygon points="0,16 40,32 0,48" fill="#003049" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                  <circle cx="12" cy="28" r="4" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="font-bebas text-xl text-peace-blue tracking-wider">
                  NEPALI BALLOT
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Election Simulation</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  className={`nav-link font-inter text-sm font-medium flex items-center gap-2 ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
              data-testid="mobile-menu"
            >
              <nav className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm font-inter ${
                      location.pathname === link.path
                        ? "bg-gorkhali-red text-white"
                        : "text-peace-blue hover:bg-gray-100"
                    }`}
                  >
                    <link.icon size={20} />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-peace-blue text-white py-8" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="font-bebas text-lg tracking-wider mb-3">NEPALI BALLOT</h3>
              <p className="text-sm text-gray-300 font-inter">
                A fun election simulation platform exploring Nepal's vibrant democracy.
                This is not an official election platform.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bebas text-lg tracking-wider mb-3">QUICK LINKS</h3>
              <ul className="space-y-2 text-sm text-gray-300 font-inter">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="hover:text-marigold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h3 className="font-bebas text-lg tracking-wider mb-3">DISCLAIMER</h3>
              <p className="text-sm text-gray-300 font-inter">
                This is an election simulation for entertainment purposes only.
                Results do not reflect real political outcomes.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-gray-400 font-inter">
              © 2024 Nepali Ballot Simulation. Built with ❤️ for Nepal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
