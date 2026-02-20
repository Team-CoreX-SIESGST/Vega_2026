'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, RefreshCw, Search } from 'lucide-react';
import { apiClient } from '@/utils/api_client';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  primary: '#4E4E94',
  primaryLight: 'rgba(78,78,148,0.1)',
  primaryMedium: 'rgba(78,78,148,0.3)',
  success: '#28C840',
  warning: '#FEBC2E',
  danger: '#FF5F57',
  background: '#FFFFFF',
  foreground: '#1A1A2E',
  muted: '#4A4A6A',
};

const statusBg = (status) => {
  switch (status) {
    case 'resolved':
    case 'closed':
      return COLORS.success;
    case 'working_on':
    case 'assigned':
      return COLORS.primary;
    case 'hold':
    case 'escalated':
    case 'rejected':
      return COLORS.danger;
    case 'pending_info':
    case 'received':
    default:
      return COLORS.warning;
  }
};

export default function DashboardQueriesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ queries: [], pagination: null });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '15');
    params.set('sortBy', 'createdAt');
    params.set('sortOrder', 'desc');
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'all') params.set('status', status);
    return params.toString();
  }, [page, search, status]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/queries');
      return;
    }
    fetchQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, queryString]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/queries?${queryString}`);
      if (!res.data?.status) throw new Error(res.data?.message || 'Failed to fetch queries');
      setData(res.data.data);
    } catch (e) {
      setError(e.message || 'Failed to fetch queries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueries();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} style={{ color: COLORS.primary }} />
          <p className="text-lg" style={{ color: COLORS.muted }}>Loading queries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="mx-auto mb-4" size={48} style={{ color: COLORS.danger }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.foreground }}>Error Loading Queries</h2>
          <p className="mb-6" style={{ color: COLORS.muted }}>{error}</p>
          <button
            onClick={onRefresh}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const queries = data?.queries || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
              <FileText size={18} style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-outfit" style={{ color: COLORS.foreground }}>
                View <span style={{ color: COLORS.primary }}>Queries</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Filter, search, and track query status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold border"
              style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.primary }}
            >
              Back to Dashboard
            </Link>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary, color: 'white' }}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border p-4 bg-white/80 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Search</div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'rgba(78,78,148,0.2)' }}>
              <Search size={16} style={{ color: COLORS.muted }} />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="description / train name / keyword"
                className="w-full outline-none bg-transparent text-sm"
                style={{ color: COLORS.foreground }}
              />
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-white/80 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Status</div>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
              style={{ borderColor: 'rgba(78,78,148,0.2)', color: COLORS.foreground }}
            >
              <option value="all">All</option>
              <option value="received">Received</option>
              <option value="assigned">Assigned</option>
              <option value="working_on">Working On</option>
              <option value="hold">Hold</option>
              <option value="pending_info">Pending Info</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="rounded-xl border p-4 bg-white/80 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Results</div>
            <div className="text-sm" style={{ color: COLORS.foreground }}>
              {pagination?.totalQueries ?? queries.length} total
            </div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Page {pagination?.currentPage ?? page} of {pagination?.totalPages ?? 1}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {queries.length === 0 ? (
            <div className="rounded-xl border p-10 text-center bg-white/80 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.foreground }}>No queries found</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>Try changing filters or search text.</div>
            </div>
          ) : (
            queries.map((q) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border p-4 bg-white/85 backdrop-blur-md hover:shadow-lg transition-all"
                style={{ borderColor: 'rgba(78,78,148,0.15)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold line-clamp-2" style={{ color: COLORS.foreground }}>
                      {q.description}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: statusBg(q.status) }}>
                        {q.status}
                      </span>
                      <span className="text-xs" style={{ color: COLORS.muted }}>
                        Train: {q.train_number} {q.train_details?.train_name ? `· ${q.train_details.train_name}` : ''}
                      </span>
                      <span className="text-xs" style={{ color: COLORS.muted }}>
                        Priority: <span className="font-semibold" style={{ color: COLORS.primary }}>{q.priority_percentage}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-right shrink-0" style={{ color: COLORS.muted }}>
                    {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50"
              style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.primary }}
            >
              Prev
            </button>
            <div className="text-sm" style={{ color: COLORS.muted }}>
              Page <span className="font-semibold" style={{ color: COLORS.foreground }}>{page}</span> / {pagination.totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50"
              style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.primary }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

