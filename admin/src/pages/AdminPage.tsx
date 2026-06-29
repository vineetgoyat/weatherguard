import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Send, Clock, RefreshCw, Shield } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTimeOfDay, timeThemes } from '../hooks/useTimeOfDay';
import api from '../services/api';
import { User } from '../types';

type TabType = 'all' | 'pending';

export default function AdminPage() {
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];

  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pending' ? '/admin/users/pending' : '/admin/users';
      const { data } = await api.get(endpoint);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [tab]);

  const approve = async (id: string) => {
    setActionId(id);
    await api.patch(`/admin/users/${id}/approve`);
    await fetchUsers();
    setActionId(null);
  };

  const reject = async (id: string) => {
    setActionId(id);
    await api.patch(`/admin/users/${id}/reject`);
    await fetchUsers();
    setActionId(null);
  };

  const sendAlert = async (id: string) => {
    setActionId(id + '_alert');
    await api.post(`/admin/users/${id}/send-alert`);
    setActionId(null);
    setAlertMsg('✅ Weather alert sent to Telegram!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const statusBadge: Record<string, string> = {
    pending:  'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    approved: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    rejected: 'bg-red-400/10 text-red-400 border border-red-400/20',
  };

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${theme.text}`}>
              <Shield className="w-8 h-8" /> Admin Panel
            </h1>
            <p className={`text-sm mt-1 ${theme.subtext}`}>Manage user access and weather alerts</p>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            onClick={fetchUsers}
            className={`p-3 rounded-2xl ${theme.glass} ${theme.subtext} hover:${theme.text} transition-colors`}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Alert toast */}
        <AnimatePresence>
          {alertMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-medium"
            >
              {alertMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'all'] as TabType[]).map(t => (
            <motion.button
              key={t}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all capitalize
                ${tab === t
                  ? `bg-gradient-to-r ${theme.button} text-white shadow-lg`
                  : `${theme.glass} ${theme.subtext}`}`}
            >
              {t === 'pending'
                ? <><Clock className="inline w-3 h-3 mr-1.5" />Pending</>
                : <><Users className="inline w-3 h-3 mr-1.5" />All Users</>}
            </motion.button>
          ))}
        </div>

        {/* Users */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin`}
              style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          </div>
        ) : users.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${theme.glass}`}>
            <Users className={`w-12 h-12 mx-auto mb-3 ${theme.subtext}`} />
            <p className={theme.subtext}>No {tab === 'pending' ? 'pending' : ''} users found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-5 ${theme.glass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {u.avatar
                        ? <img src={u.avatar} className="w-12 h-12 rounded-full ring-2 ring-white/20 flex-shrink-0" alt="" />
                        : <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.button} flex items-center justify-center flex-shrink-0 text-white font-bold text-lg`}>
                            {u.name?.[0]}
                          </div>
                      }
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${theme.text}`}>{u.name}</p>
                        <p className={`text-sm truncate ${theme.subtext}`}>{u.email}</p>
                        {u.requestMessage && (
                          <p className={`text-xs mt-1 truncate italic ${theme.subtext}`}>"{u.requestMessage}"</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${statusBadge[u.status]}`}>
                            {u.status}
                          </span>
                          {u.city && <span className={`text-xs ${theme.subtext}`}>📍 {u.city}</span>}
                          {u.telegramChatId && <span className="text-xs text-sky-400">✈ Telegram linked</span>}
                          <span className={`text-xs capitalize ${theme.subtext}`}>{u.provider}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {u.status === 'pending' && (
                        <>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => approve(u._id)} disabled={actionId === u._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => reject(u._id)} disabled={actionId === u._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </motion.button>
                        </>
                      )}
                      {u.status === 'approved' && u.telegramChatId && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => sendAlert(u._id)} disabled={actionId === u._id + '_alert'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium hover:bg-sky-500/30 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Alert
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
