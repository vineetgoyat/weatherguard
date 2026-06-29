import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, LayoutDashboard, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTimeOfDay, timeThemes } from '../../hooks/useTimeOfDay';
import WeatherBackground from '../WeatherBackground';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

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

        {/* Sidebar */}
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`relative z-10 w-64 flex flex-col p-6 gap-8 ${theme.glass}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.button} flex items-center justify-center shadow-lg`}
            >
              <CloudLightning className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <span className={`font-bold text-lg ${theme.text}`}>WeatherGuard</span>
              <div className={`text-xs ${theme.subtext} flex items-center gap-1`}>
                {theme.emoji} {theme.label}
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all
                      ${active
                        ? `bg-gradient-to-r ${theme.button} text-white shadow-lg`
                        : `${theme.text} hover:bg-white/10`}`}
                  >
                    <Icon className="w-4 h-4" />
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
                ? <img src={user.avatar} className="w-10 h-10 rounded-full ring-2 ring-white/30" alt="" />
                : <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.button} flex items-center justify-center`}>
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
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </motion.aside>

        {/* Main */}
        <main className="relative z-10 flex-1 overflow-auto p-8">
          {children}
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
