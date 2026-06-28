import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudLightning, Send, MapPin, MessageSquare, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusConfig = {
  pending:  { icon: Clock,        color: 'text-amber-400',  bg: 'bg-amber-400/10  border-amber-400/20',  label: 'Pending Review' },
  approved: { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Approved' },
  rejected: { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-400/10    border-red-400/20',    label: 'Rejected' },
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [telegramLink, setTelegramLink] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [message, setMessage] = useState(user?.requestMessage || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/telegram/link').then(r => setTelegramLink(r.data.link)).catch(() => {});
  }, []);

  const status = user?.status || 'pending';
  const StatusIcon = statusConfig[status].icon;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (city) await api.patch('/users/me/city', { city });
      if (message) await api.patch('/users/me/request-message', { message });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="max-w-2xl">
        {/* Header */}
        <motion.div variants={cardVariants} className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm">Manage your WeatherGuard profile and alerts</p>
        </motion.div>

        {/* Status card */}
        <motion.div variants={cardVariants} className={`glass rounded-2xl p-6 mb-4 border ${statusConfig[status].bg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig[status].bg}`}>
              <StatusIcon className={`w-6 h-6 ${statusConfig[status].color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Access Status</p>
              <p className={`text-xl font-bold ${statusConfig[status].color}`}>{statusConfig[status].label}</p>
            </div>
          </div>
          {status === 'pending' && (
            <p className="text-sm text-slate-400 mt-4">
              Your account is pending admin approval. Fill in your details below to help speed up the process.
            </p>
          )}
          {status === 'approved' && (
            <p className="text-sm text-emerald-300 mt-4">
              🎉 Your access is approved! Weather alerts will be sent to your Telegram at 8 AM and 6 PM daily.
            </p>
          )}
        </motion.div>

        {/* Telegram link card */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6 mb-4">
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-400" /> Connect Telegram
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            {user?.telegramChatId ? '✅ Telegram is connected!' : 'Open this link in Telegram to connect your account.'}
          </p>
          {telegramLink && (
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 text-sm border border-sky-500/30 hover:bg-sky-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Telegram
            </a>
          )}
        </motion.div>

        {/* Profile settings */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" /> Your Details
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Your City (for weather alerts)</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Mumbai, London, New York"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Request message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the admin why you'd like access..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              {saved ? '✅ Saved!' : 'Save Changes'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
