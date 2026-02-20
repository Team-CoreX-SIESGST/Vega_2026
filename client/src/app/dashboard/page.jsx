'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Train,
  Tag,
  Building2,
  BarChart3,
  RefreshCw,
  Calendar,
  MessageSquare,
  FileText
} from 'lucide-react';
import { getDashboardStatistics, getNotificationStatistics } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

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
  chartColors: ['#4E4E94', '#7B7BC8', '#A8A8E8', '#D4D4F4', '#E8E8F8']
};

const statusColors = {
  received: '#FEBC2E',
  assigned: '#4E4E94',
  working_on: '#7B7BC8',
  hold: '#FF5F57',
  pending_info: '#FEBC2E',
  escalated: '#FF5F57',
  resolved: '#28C840',
  closed: '#4A4A6A',
  rejected: '#FF5F57'
};

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [notificationStats, setNotificationStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to hydrate on refresh before deciding.
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, notificationData] = await Promise.all([
        getDashboardStatistics(),
        getNotificationStatistics().catch(() => null)
      ]);
      setStats(dashboardData);
      setNotificationStats(notificationData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} style={{ color: COLORS.primary }} />
          <p className="text-lg" style={{ color: COLORS.muted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="mx-auto mb-4" size={48} style={{ color: COLORS.danger }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.foreground }}>Error Loading Dashboard</h2>
          <p className="mb-6" style={{ color: COLORS.muted }}>{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare chart data
  const statusChartData = stats.statusDistribution || [];
  const priorityChartData = stats.priorityDistribution || [];
  const categoryChartData = stats.categoryDistribution || [];
  const departmentChartData = stats.departmentDistribution || [];
  const trainChartData = stats.trainDistribution || [];
  const timeSeriesData = stats.timeSeriesData || [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
      <div className="flex min-h-screen">
        <DashboardSidebar pathname={pathname} user={user} />

        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-outfit" style={{ color: COLORS.foreground }}>
                  Dashboard <span style={{ color: COLORS.primary }}>Analytics</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                  Comprehensive insights and statistics
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
              >
                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                Refresh
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Queries"
            value={stats.overview?.totalQueries || 0}
            icon={Activity}
            color={COLORS.primary}
            trend={null}
          />
          <StatCard
            title="Resolved"
            value={stats.overview?.resolvedCount || 0}
            icon={CheckCircle}
            color={COLORS.success}
            trend={stats.overview?.totalQueries ? Math.round((stats.overview.resolvedCount / stats.overview.totalQueries) * 100) : 0}
          />
          <StatCard
            title="In Progress"
            value={stats.overview?.inProgressCount || 0}
            icon={Clock}
            color={COLORS.warning}
            trend={stats.overview?.totalQueries ? Math.round((stats.overview.inProgressCount / stats.overview.totalQueries) * 100) : 0}
          />
          <StatCard
            title="High Priority"
            value={stats.overview?.highPriorityCount || 0}
            icon={AlertCircle}
            color={COLORS.danger}
            trend={stats.overview?.avgPriority ? Math.round(stats.overview.avgPriority) : 0}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Pie Chart */}
          <ChartCard title="Status Distribution" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status] || COLORS.chartColors[index % COLORS.chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Priority Distribution Bar Chart */}
          <ChartCard title="Priority Distribution" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.primaryMedium} />
                <XAxis dataKey="range" stroke={COLORS.muted} />
                <YAxis stroke={COLORS.muted} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.primaryMedium}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category Distribution */}
          <ChartCard title="Top Categories" icon={Tag}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.primaryMedium} />
                <XAxis type="number" stroke={COLORS.muted} />
                <YAxis dataKey="category" type="category" stroke={COLORS.muted} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.primaryMedium}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Department Distribution */}
          <ChartCard title="Department Assignment" icon={Building2}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, percent }) => `${department}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chartColors[index % COLORS.chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Time Series Chart - Full Width */}
        <div className="mb-8">
          <ChartCard title="Queries Over Time" icon={Calendar}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.primaryMedium} />
                <XAxis dataKey="date" stroke={COLORS.muted} />
                <YAxis stroke={COLORS.muted} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.primaryMedium}`,
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorPrimary)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom Section - Train Distribution and Recent Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trains */}
          <ChartCard title="Top Trains by Query Count" icon={Train}>
            <div className="space-y-3">
              {trainChartData.slice(0, 10).map((train, index) => (
                <div key={train.trainNumber} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: COLORS.foreground }}>
                      {train.trainName || train.trainNumber}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.muted }}>
                      {train.trainNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg" style={{ color: COLORS.primary }}>
                      {train.count}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.muted }}>
                      queries
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Recent Queries */}
          <ChartCard title="Recent Queries" icon={Activity}>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {stats.recentQueries?.slice(0, 10).map((query) => (
                <div
                  key={query.id}
                  className="p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: COLORS.primaryMedium,
                    backgroundColor: COLORS.background
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2" style={{ color: COLORS.foreground }}>
                        {query.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: statusColors[query.status] || COLORS.primary,
                            color: 'white'
                          }}
                        >
                          {query.status}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.muted }}>
                          {query.train_number}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: query.priority_percentage >= 80 ? COLORS.danger : query.priority_percentage >= 60 ? COLORS.warning : COLORS.success,
                          color: 'white'
                        }}
                      >
                        {query.priority_percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: COLORS.muted }}>
                    {new Date(query.createdAt).toLocaleDateString()} {new Date(query.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Top Keywords */}
        {stats.topKeywords && stats.topKeywords.length > 0 && (
          <div className="mt-8">
            <ChartCard title="Top Keywords" icon={Tag}>
              <div className="flex flex-wrap gap-2">
                {stats.topKeywords.map((keyword, index) => (
                  <motion.div
                    key={keyword.keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: COLORS.primary,
                      color: 'white'
                    }}
                  >
                    {keyword.keyword} ({keyword.count})
                  </motion.div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Notification Stats */}
        {notificationStats && (
          <div className="mt-8">
            <ChartCard title="Notification Statistics" icon={Activity}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.primary }}>
                    {notificationStats.userStatistics?.total || 0}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.muted }}>Total</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.success }}>
                    {notificationStats.userStatistics?.read || 0}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.muted }}>Read</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.warning }}>
                    {notificationStats.userStatistics?.unread || 0}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.muted }}>Unread</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.primary }}>
                    {notificationStats.mainStatistics?.activeNotifications || 0}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.muted }}>Active</div>
                </div>
              </div>
            </ChartCard>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardSidebar({ pathname, user }) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'View Queries', href: '/dashboard/queries', icon: FileText },
    { label: 'RailMind ChatBot', href: '/chat', icon: MessageSquare },
  ];

  return (
    <aside
      className="hidden md:flex w-72 shrink-0 border-r bg-white/70 backdrop-blur-md"
      style={{ borderRightColor: 'rgba(78,78,148,0.15)' }}
    >
      <div className="w-full flex flex-col p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
              <Train size={18} style={{ color: COLORS.primary }} />
            </div>
            <span className="font-outfit font-bold text-lg" style={{ color: COLORS.foreground }}>
              Rail<span style={{ color: COLORS.primary }}>Mind</span>
            </span>
          </div>
          <div className="text-xs" style={{ color: COLORS.muted }}>
            {user?.name ? `Signed in as ${user.name}` : 'Analytics workspace'}
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: active ? COLORS.primaryLight : 'transparent',
                  border: `1px solid ${active ? 'rgba(78,78,148,0.25)' : 'transparent'}`,
                  color: active ? COLORS.primary : COLORS.muted,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: active ? 'rgba(78,78,148,0.12)' : 'rgba(78,78,148,0.06)' }}
                >
                  <Icon size={18} style={{ color: active ? COLORS.primary : COLORS.muted }} />
                </div>
                <div className="font-semibold text-sm">{label}</div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(78,78,148,0.15)', backgroundColor: 'rgba(78,78,148,0.04)' }}>
            <div className="text-sm font-semibold mb-1" style={{ color: COLORS.foreground }}>
              Tip
            </div>
            <div className="text-xs leading-relaxed" style={{ color: COLORS.muted }}>
              Use the Refresh button to pull the latest insights from the backend.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: COLORS.background,
        borderColor: COLORS.primaryMedium
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend !== null && (
          <div className="text-sm font-semibold" style={{ color: COLORS.muted }}>
            {trend}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color: COLORS.foreground }}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm" style={{ color: COLORS.muted }}>
        {title}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: COLORS.background,
        borderColor: COLORS.primaryMedium
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
          <Icon size={20} style={{ color: COLORS.primary }} />
        </div>
        <h3 className="text-lg font-semibold font-outfit" style={{ color: COLORS.foreground }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}
