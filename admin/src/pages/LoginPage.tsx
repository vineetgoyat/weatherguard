import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTimeOfDay, timeThemes } from '../hooks/useTimeOfDay';
import WeatherBackground from '../components/WeatherBackground';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const timeGreetings = {
  dawn:   { greeting: 'Good Morning', sub: 'A new day begins with clear skies.' },
  day:    { greeting: 'Good Day',     sub: 'Stay ahead of the weather, every hour.' },
  sunset: { greeting: 'Good Evening', sub: 'Beautiful skies await you tonight.' },
  night:  { greeting: 'Good Night',   sub: 'Sleep easy, we\'ll watch the skies for you.' },
};

export default function LoginPage() {
  const { user, loading } = useAuth();
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];
  const { greeting, sub } = timeGreetings[timeOfDay];

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <AnimatePresence>
      <motion.div
        key={timeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${theme.bg}`}
      >
        <WeatherBackground timeOfDay={timeOfDay} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className={`rounded-3xl p-10 shadow-2xl ${theme.glass}`}>
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${theme.button} flex items-center justify-center mb-5 shadow-2xl`}
              >
                <CloudLightning className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-4xl font-bold mb-1 ${theme.text}`}
              >
                WeatherGuard
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-sm ${theme.subtext} mb-1`}
              >
                {theme.emoji} {greeting}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-xs ${theme.subtext} text-center`}
              >
                {sub}
              </motion.p>
            </div>

            {/* Divider */}
            <div className={`h-px mb-8 ${timeOfDay === 'day' ? 'bg-blue-900/20' : 'bg-white/10'}`} />

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`${API}/auth/google`}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-slate-800 font-semibold text-sm shadow-xl hover:shadow-2xl transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`${API}/auth/github`}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all ${theme.glass} ${theme.text}`}
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </motion.a>
            </div>

            <p className={`text-center text-xs mt-8 ${theme.subtext}`}>
              🔒 Invite-only · Your request will be reviewed by an admin
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
