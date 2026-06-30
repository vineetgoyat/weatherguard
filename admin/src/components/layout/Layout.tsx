import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, LayoutDashboard, Shield, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTimeOfDay, timeThemes } from '../../hooks/useTimeOfDay';
import WeatherBackground from '../WeatherBackground';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.button} flex items-center justify-center shadow-lg flex-shrink-0`}
        >
          <CloudLightning className="w-5 h-5 text-white" />
        </motion.div>
        <div className="min-w-0">
          <span className={`font-bold text-lg ${theme.text}`}>WeatherGuard</span>
          <div className={`text-xs ${theme.subtext} flex items-center gap-1 truncate`}>
            {theme.emoji} {theme.label}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all
                  ${active
                    ? `bg-gradient-to-r ${theme.button} text-white shadow-lg`
                    : `${theme.text} hover:bg-white/10`}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className={`rounded-2xl p-4 ${theme.glass}`}>
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar
            ? <img src={user.avatar} className="w-10 h-10 rounded-full ring-2 ring-white/30 flex-shrink-0" alt="" />
            : <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.button} flex items-center justify-center flex-shrink-0`}>
                <User className="w-4 h-4 text-white" />
              </div>
          }
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${theme.text}`}>{user?.name}</p>
            <p className={`text-xs truncate ${theme.subtext}`}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2 text-xs ${theme.subtext} hover:text-red-400 transition-colors`}
        >
          <LogOut className="w-3 h-3 flex-shrink-0" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className={`flex min-h-screen bg-gradient-to-br ${theme.bg} relative overflow-hidden`}
      >
        <WeatherBackground timeOfDay={timeOfDay} />

        {/* Mobile top bar */}
        <div
          className={`md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 ${theme.glass}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.button} flex items-center justify-center flex-shrink-0`}>
              <CloudLightning className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-sm truncate ${theme.text}`}>WeatherGuard</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className={`p-2 rounded-xl ${theme.glass} ${theme.text} flex-shrink-0`}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop sidebar */}
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`hidden md:flex relative z-10 w-64 flex-shrink-0 flex-col p-6 gap-8 ${theme.glass}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
        >
          {SidebarContent}
        </motion.aside>

        {/* Mobile drawer + backdrop */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="md:hidden fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] flex flex-col p-6 gap-8 ${theme.glass}`}
                style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`absolute top-4 right-4 p-2 rounded-xl ${theme.subtext}`}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="relative z-10 flex-1 min-w-0 overflow-auto p-4 pt-20 md:p-8 md:pt-8">
          {children}
        </main>
      </motion.div>
    </AnimatePresence>
  );
}