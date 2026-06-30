import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Send, Clock, RefreshCw, Shield, Trash2, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTimeOfDay, timeThemes } from '../hooks/useTimeOfDay';
import api from '../services/api';
import { User } from '../types';

type TabType = 'all' | 'pending';

function DeleteModal({
  user,
  theme,
  onConfirm,
  onCancel,
  loading,
}: {
  user: User;
  theme: any;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`w-full max-w-md rounded-3xl p-6 ${theme.glass} border border-red-500/20`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className={`text-xl font-bold mb-2 ${theme.text}`}>Delete Account</h2>
          <p className={`text-sm ${theme.subtext}`}>
            You are about to permanently delete
          </p>
          <div className={`mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10`}>
            <p className={`font-semibold ${theme.text}`}>{user.name}</p>
            <p className={`text-xs ${theme.subtext}`}>{user.email}</p>
          </div>
          <p className={`text-xs mt-3 text-red-400/80`}>
            This action cannot be undone. All user data will be permanently removed.
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-colors ${theme.glass} ${theme.subtext} disabled:opacity-50`}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-red-500/80 hover:bg-red-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            {loading ? 'Deleting...' : 'Delete Account'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminPage() {
  const timeOfDay = useTimeOfDay();
  const theme = timeThemes[timeOfDay];

  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pending' ? '/admin/users/pending' : '/admin/users';
      const { data } = await api.get(endpoint);
      setUsers(data);
    } catch {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [tab]);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/approve`);
      await fetchUsers();
      showToast('✅ User approved — Telegram notification sent');
    } catch {
      showToast('Failed to approve user', 'error');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: string) => {
    setActionId(id + '_reject');
    try {
      await api.patch(`/admin/users/${id}/reject`);
      await fetchUsers();
      showToast('User rejected');
    } catch {
      showToast('Failed to reject user', 'error');
    } finally {
      setActionId(null);
    }
  };

  const sendAlert = async (id: string) => {
    setActionId(id + '_alert');
    try {
      await api.post(`/admin/users/${id}/send-alert`);
      showToast('✅ Weather alert sent to Telegram!');
    } catch {
      showToast('Failed to send alert', 'error');
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchUsers();
      showToast('Account permanently deleted');
    } catch {
      showToast('Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge: Record<string, string> = {
    pending:  'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    approved: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    rejected: 'bg-red-400/10 text-red-400 border border-red-400/20',
  };

  return (
    <Layout>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            theme={theme}
            onConfirm={confirmDelete}
            onCancel={() => !deleting && setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl">
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

        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-2xl text-sm font-medium border ${
                toastMsg.type === 'success'
                  ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                  : 'bg-red-400/10 border-red-400/20 text-red-400'
              }`}
            >
              {toastMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          </div>
        ) : users.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${theme.glass}`}>
            <Users className={`w-12 h-12 mx-auto mb-3 ${theme.subtext}`} />
            <p className={theme.subtext}>No {tab === 'pending' ? 'pending ' : ''}users found</p>
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
                            onClick={() => reject(u._id)} disabled={actionId === u._id + '_reject'}
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
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteTarget(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400/70 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </motion.button>
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