import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudLightning, LayoutDashboard, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 glass border-r border-white/10 flex flex-col p-6 gap-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
            <CloudLightning className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">WeatherGuard</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${active
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar
              ? <img src={user.avatar} className="w-9 h-9 rounded-full" alt="" />
              : <div className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-300" />
                </div>
            }
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
