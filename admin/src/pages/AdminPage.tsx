import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Send, Clock, RefreshCw, Shield } from 'lucide-react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import { User } from '../types';

type TabType = 'all' | 'pending';

const statusBadge = {
  pending:  'bg-amber-400/10  text-amber-400  border-amber-400/20',
  approved: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  rejected: 'bg-red-400/10    text-red-400    border-red-400/20',
};

export default function AdminPage() {
  const [users, setUsers]   = useState<User[]>([]);
  const [tab, setTab]       = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

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
    alert('Weather alert sent!');
  };

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-400" />
              <span className="gradient-text">Admin Panel</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage user access and weather alerts</p>
          </div>
          <button onClick={fetchUsers} className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'all'] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize
                ${tab === t
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'glass text-slate-400 hover:text-slate-200'}`}
            >
              {t === 'pending' ? <><Clock className="inline w-3 h-3 mr-1" />Pending</> : <><Users className="inline w-3 h-3 mr-1" />All Users</>}
            </button>
          ))}
        </div>

        {/* Users list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No {tab === 'pending' ? 'pending' : ''} users found</p>
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
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {u.avatar
                        ? <img src={u.avatar} className="w-11 h-11 rounded-full flex-shrink-0" alt="" />
                        : <div className="w-11 h-11 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0 text-lg font-bold text-indigo-300">
                            {u.name?.[0]}
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.name}</p>
                        <p className="text-sm text-slate-400 truncate">{u.email}</p>
                        {u.requestMessage && (
                          <p className="text-xs text-slate-500 mt-1 truncate italic">"{u.requestMessage}"</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusBadge[u.status]}`}>
                            {u.status}
                          </span>
                          {u.city && (
                            <span className="text-xs text-slate-500">📍 {u.city}</span>
                          )}
                          {u.telegramChatId && (
                            <span className="text-xs text-sky-400">✈ Telegram linked</span>
                          )}
                          <span className="text-xs text-slate-600 capitalize">{u.provider}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {u.status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => approve(u._id)}
                            disabled={actionId === u._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => reject(u._id)}
                            disabled={actionId === u._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </motion.button>
                        </>
                      )}
                      {u.status === 'approved' && u.telegramChatId && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendAlert(u._id)}
                          disabled={actionId === u._id + '_alert'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium hover:bg-sky-500/30 transition-colors disabled:opacity-50"
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
