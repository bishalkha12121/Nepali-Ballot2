import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Vote, BarChart3, History, Home, Gamepad2, Newspaper, MapPin, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allNavLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/vote", label: "Vote Now", icon: Vote },
  { path: "/results", label: "Results", icon: BarChart3, hideOnVote: true },
  { path: "/constituencies", label: "Constituencies", icon: MapPin },
  { path: "/news", label: "News", icon: Newspaper },
  { path: "/sports", label: "Sports", icon: Trophy },
  { path: "/history", label: "History", icon: History },
  { path: "/games", label: "Games", icon: Gamepad2 },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isVotePage = location.pathname === "/vote";

  // Filter out Results link when on Vote page to avoid spoilers
  const navLinks = allNavLinks.filter(link => !(isVotePage && link.hideOnVote));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
              <motion.div 
                className="w-10 h-10 relative"
                whileHover={{ rotate: 5 }}
              >
                <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-md">
                  <polygon points="0,0 40,16 0,32" fill="#D90429" />
                  <polygon points="0,16 40,32 0,48" fill="#003049" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                  <circle cx="12" cy="28" r="4" fill="white" />
                </svg>
              </motion.div>
              <div>
                <h1 className="font-bebas text-xl text-peace-blue tracking-wider group-hover:text-gorkhali-red transition-colors">
                  NEPALI BALLOT
                </h1>
                <p className="text-xs text-gray-500 -mt-1 font-inter">Election Simulation</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" data-testid="desktop-nav">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <motion.div
                      className={`px-4 py-2 rounded-sm font-inter text-sm font-medium flex items-center gap-2 transition-all ${
                        isActive 
                          ? "bg-gorkhali-red text-white" 
                          : "text-peace-blue hover:bg-gray-100"
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <link.icon size={16} />
                      {link.label}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-sm hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t shadow-lg"
              data-testid="mobile-menu"
            >
              <nav className="px-4 py-4 space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
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
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Only show on non-home pages */}
      {!isHomePage && (
        <footer className="bg-peace-blue text-white py-12" data-testid="footer">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10">
                    <svg viewBox="0 0 40 48" className="w-full h-full">
                      <polygon points="0,0 40,16 0,32" fill="#D90429" />
                      <polygon points="0,16 40,32 0,48" fill="white" />
                      <circle cx="12" cy="12" r="4" fill="white" />
                      <circle cx="12" cy="28" r="4" fill="#003049" />
                    </svg>
                  </div>
                  <h3 className="font-bebas text-xl tracking-wider">NEPALI BALLOT</h3>
                </div>
                <p className="font-inter text-sm text-gray-300">
                  A fun election simulation platform exploring Nepal's vibrant democracy.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bebas text-lg tracking-wider mb-4">QUICK LINKS</h4>
                <ul className="space-y-2 font-inter text-sm text-gray-300">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="hover:text-marigold transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ad Space */}
              <div>
                <h4 className="font-bebas text-lg tracking-wider mb-4">SPONSORED</h4>
                <div className="bg-white/10 border border-white/20 p-4 text-center rounded-sm">
                  <p className="text-gray-400 text-xs mb-1">ADVERTISEMENT</p>
                  <p className="text-gray-300 text-sm font-bebas">Your Ad Here</p>
                  <p className="text-gray-500 text-xs mt-1">300x100</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6 text-center">
              <p className="font-inter text-sm text-gray-400">
                © 2026 Nepali Ballot Simulation 🇳🇵
              </p>
              <p className="font-inter text-xs text-gray-500 mt-1">
                This is a simulation for entertainment purposes only.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
