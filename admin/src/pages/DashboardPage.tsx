import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, MessageSquare, CheckCircle, Clock, XCircle, Monitor, Smartphone, ExternalLink } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTimeOfDay, timeThemes } from '../hooks/useTimeOfDay';
import api from '../services/api';

const statusConfig = {
  pending:  { icon: Clock,       color: 'text-amber-400',   bg: 'bg-amber-400/10  border-amber-400/20',   label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Approved' },
  rejected: { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-400/10    border-red-400/20',     label: 'Rejected' },
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];

  const [telegramLink, setTelegramLink] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [message, setMessage] = useState(user?.requestMessage || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop');

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

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const card = `rounded-2xl p-6 mb-4 ${theme.glass}`;
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const botUsername = 'weatherguard_vineet_bot';

  return (
    <Layout>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-2xl"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="mb-8">
          <h1 className={`text-4xl font-bold mb-1 ${theme.text}`}>
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className={`text-sm ${theme.subtext}`}>Manage your WeatherGuard profile and alerts</p>
        </motion.div>

        {/* Status */}
        <motion.div variants={cardVariants} className={`${card} border ${statusConfig[status].bg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusConfig[status].bg}`}>
              <StatusIcon className={`w-6 h-6 ${statusConfig[status].color}`} />
            </div>
            <div>
              <p className={`text-xs uppercase tracking-widest ${theme.subtext}`}>Access Status</p>
              <p className={`text-xl font-bold ${statusConfig[status].color}`}>{statusConfig[status].label}</p>
            </div>
          </div>
          {status === 'pending' && <p className={`text-sm mt-4 ${theme.subtext}`}>Your account is pending admin approval. Fill in your details below to help speed up the process.</p>}
          {status === 'approved' && <p className="text-sm text-emerald-400 mt-4">🎉 Your access is approved! Weather alerts will be sent to your Telegram at 8 AM and 6 PM daily.</p>}
          {status === 'rejected' && <p className="text-sm text-red-400 mt-4">Your access request was rejected. Please contact the admin for more information.</p>}
        </motion.div>

        {/* Telegram */}
        <motion.div variants={cardVariants} className={card}>
          <h2 className={`font-semibold mb-1 flex items-center gap-2 ${theme.text}`}>
            <Send className="w-4 h-4" style={{ color: 'rgb(56,189,248)' }} /> Connect Telegram
          </h2>

          {user?.telegramChatId ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm mt-3">
              <CheckCircle className="w-4 h-4" /> Telegram is connected! You will receive weather alerts.
            </div>
          ) : (
            <div className="mt-4">
              <p className={`text-sm mb-4 ${theme.subtext}`}>
                Link your Telegram to receive automated weather alerts. Choose how you're accessing this:
              </p>

              {/* Platform Toggle */}
              <div className={`flex rounded-xl p-1 mb-5 gap-1 ${theme.inputBg}`}>
                {(['desktop', 'mobile'] as const).map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      platform === p
                        ? `bg-gradient-to-r ${theme.button} text-white shadow-md`
                        : `${theme.subtext} hover:opacity-80`
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {p === 'desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    {p === 'desktop' ? 'On Desktop / PC' : 'On Mobile'}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {platform === 'desktop' ? (
                  <motion.div
                    key="desktop"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Step 1 */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${theme.glass}`}>
                      <StepBadge n={1} theme={theme} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${theme.text}`}>Click your unique link — it opens the bot instantly</p>
                        <p className={`text-xs mt-0.5 mb-3 ${theme.subtext}`}>No need to open Telegram manually. The link takes you straight to the bot.</p>
                        {telegramLink && (
                          <div className="flex items-center gap-2">
                            <code className={`text-xs rounded-lg px-3 py-2 truncate flex-1 min-w-0 ${theme.inputBg}`}>
                              {telegramLink}
                            </code>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCopy}
                              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${theme.accentBg} ${theme.accent}`}
                            >
                              {copied ? '✅ Copied!' : 'Copy'}
                            </motion.button>
                            <motion.a
                              href={telegramLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r ${theme.button} text-white`}
                            >
                              <ExternalLink className="w-3 h-3" /> Open
                            </motion.a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${theme.glass}`}>
                      <StepBadge n={2} theme={theme} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${theme.text}`}>Press START in the bot</p>
                        <p className={`text-xs mt-0.5 ${theme.subtext}`}>The bot will confirm your account is linked ✅</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Step 1 */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${theme.glass}`}>
                      <StepBadge n={1} theme={theme} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${theme.text}`}>Tap your unique link — it opens the bot instantly</p>
                        <p className={`text-xs mt-0.5 mb-3 ${theme.subtext}`}>The link launches Telegram and takes you straight to the bot. No manual searching needed.</p>
                        {telegramLink && (
                          <div className="flex items-center gap-2">
                            <code className={`text-xs rounded-lg px-3 py-2 truncate flex-1 min-w-0 ${theme.inputBg}`}>
                              {telegramLink}
                            </code>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCopy}
                              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${theme.accentBg} ${theme.accent}`}
                            >
                              {copied ? '✅' : 'Copy'}
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2 — search fallback */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${theme.glass}`}>
                      <StepBadge n={2} theme={theme} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${theme.text}`}>Can't click the link? Search <span className="font-bold">@{botUsername}</span> in Telegram</p>
                        <p className={`text-xs mt-0.5 ${theme.subtext}`}>Only needed if the link doesn't auto-open the bot.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`flex items-start gap-3 rounded-xl p-4 ${theme.glass}`}>
                      <StepBadge n={3} theme={theme} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${theme.text}`}>Tap START in the bot</p>
                        <p className={`text-xs mt-0.5 ${theme.subtext}`}>The bot will confirm your account is linked ✅</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div variants={cardVariants} className={card}>
          <h2 className={`font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
            <MapPin className="w-4 h-4 text-indigo-400" /> Your Details
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={`text-xs mb-1 block ${theme.subtext}`}>Your City (for weather alerts)</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Mumbai, London, New York"
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${theme.inputBg}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1 block flex items-center gap-1 ${theme.subtext}`}>
                <MessageSquare className="w-3 h-3" /> Request message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the admin why you'd like access..."
                rows={3}
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${theme.inputBg}`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className={`py-3 px-6 rounded-xl bg-gradient-to-r ${theme.button} text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saved ? '✅ Saved!' : 'Save Changes'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}

function StepBadge({ n, theme }: { n: number; theme: any }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white bg-gradient-to-br ${theme.button}`}>
      {n}
    </div>
  );
}