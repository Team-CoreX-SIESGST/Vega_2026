'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Image as ImageIcon, RefreshCw, Send, Sparkles, Train } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTrainComplaintAlerts, seedTrainAlertMockData } from '@/services/dashboardService';
import ProfileDropdown from '../../components/ProfileDropdown';

const COLORS = {
  primary: '#4E4E94',
  primaryLight: 'rgba(78,78,148,0.1)',
  success: '#28C840',
  warning: '#FEBC2E',
  danger: '#FF5F57',
  foreground: '#1A1A2E',
  muted: '#4A4A6A',
};

const normalizeRole = (role = '') =>
  String(role).trim().toLowerCase().replace(/[\s_]+/g, '');

const isAdminRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'superadmin';
};

const smsStatusMeta = (status) => {
  if (status === 'sent') return { bg: 'rgba(40,200,64,0.12)', color: COLORS.success, label: 'SMS Sent' };
  if (status === 'failed') return { bg: 'rgba(255,95,87,0.12)', color: COLORS.danger, label: 'SMS Failed' };
  return { bg: 'rgba(254,188,46,0.14)', color: '#A57700', label: 'SMS Skipped' };
};

export default function TrainAlertsTestPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [trainInput, setTrainInput] = useState('');
  const [trainFilter, setTrainFilter] = useState('');
  const [seedCount, setSeedCount] = useState(6);
  const [seedSendSms, setSeedSendSms] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const canView = isAdminRole(user?.role);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTrainFilter(trainInput.trim());
      setPage(1);
    }, 450);

    return () => clearTimeout(timeout);
  }, [trainInput]);

  const queryArgs = useMemo(
    () => ({
      trainNumber: trainFilter,
      page,
      limit: 10,
    }),
    [trainFilter, page],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/train-alerts');
      return;
    }
    if (!canView) {
      router.push('/mobile');
      return;
    }
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, canView, queryArgs]);

  const fetchAlerts = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const data = await getTrainComplaintAlerts(queryArgs);
      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
      setPagination(data?.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to load train alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSeedMockData = async () => {
    try {
      setSeeding(true);
      setSeedMessage('');
      const response = await seedTrainAlertMockData({
        trainNumber: trainInput.trim() || trainFilter || '107',
        complaintsCount: seedCount,
        sendSms: seedSendSms,
        forceAlert: false,
      });

      const alertId = response?.alert_result?.alert_id
        ? ` Alert ID: ${response.alert_result.alert_id}.`
        : '';
      const triggerText = response?.alert_result?.triggered
        ? ' Alert triggered.'
        : ` Alert not triggered (${response?.alert_result?.reason || 'unknown reason'}).`;

      setSeedMessage(
        `Inserted ${response?.inserted_complaints || 0} complaints for train ${response?.train_number || 'N/A'}.${triggerText}${alertId}`,
      );
      await fetchAlerts(true);
    } catch (err) {
      setSeedMessage(err.message || 'Failed to seed mock data');
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickForceSeed = async () => {
    try {
      setSeeding(true);
      setSeedMessage('');
      const response = await seedTrainAlertMockData({
        trainNumber: trainInput.trim() || trainFilter || '107',
        complaintsCount: seedCount,
        sendSms: true,
        forceAlert: true,
      });

      const alertId = response?.alert_result?.alert_id
        ? ` Alert ID: ${response.alert_result.alert_id}.`
        : '';
      setSeedMessage(
        `One-click force seed done. Inserted ${response?.inserted_complaints || 0} complaints for train ${response?.train_number || 'N/A'}. SMS requested: Yes. Alert triggered.${alertId}`,
      );
      await fetchAlerts(true);
    } catch (err) {
      setSeedMessage(err.message || 'Failed to run one-click force seed');
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={44} style={{ color: COLORS.primary }} />
          <p style={{ color: COLORS.muted }}>Loading train alert test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
              <Train size={18} style={{ color: COLORS.primary }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold font-outfit" style={{ color: COLORS.foreground }}>
                Train Alert <span style={{ color: COLORS.primary }}>Test Page</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Verify spike-triggered alerts, complaint summaries, images, and SMS payload.
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
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary, color: 'white' }}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
              Filter Train Number
            </div>
            <input
              value={trainInput}
              onChange={(event) => setTrainInput(event.target.value)}
              placeholder="e.g. 12951"
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white outline-none"
              style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.foreground }}
            />
          </div>

          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
              Total Alerts
            </div>
            <div className="text-3xl font-bold" style={{ color: COLORS.foreground }}>
              {pagination?.totalAlerts ?? alerts.length}
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
              Page
            </div>
            <div className="text-3xl font-bold" style={{ color: COLORS.foreground }}>
              {pagination?.currentPage ?? page}/{pagination?.totalPages ?? 1}
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4 bg-white/90 backdrop-blur-md mb-6" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: COLORS.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: COLORS.foreground }}>
              Generate Mock Test Data
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs mb-1 font-semibold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                Train Number
              </label>
              <input
                value={trainInput}
                onChange={(event) => setTrainInput(event.target.value)}
                placeholder="107"
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white outline-none"
                style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.foreground }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-semibold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                Complaints
              </label>
              <input
                type="number"
                min={4}
                value={seedCount}
                onChange={(event) => setSeedCount(Math.max(4, Number(event.target.value) || 4))}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white outline-none"
                style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.foreground }}
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: COLORS.foreground }}>
                <input
                  type="checkbox"
                  checked={seedSendSms}
                  onChange={(event) => setSeedSendSms(event.target.checked)}
                />
                Send SMS while seeding
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSeedMockData}
                disabled={seeding}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Sparkles size={15} />
                {seeding ? 'Seeding...' : 'Seed'}
              </button>
              <button
                onClick={handleQuickForceSeed}
                disabled={seeding}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: '#1A1A2E' }}
              >
                <Sparkles size={15} />
                One-Click Force
              </button>
            </div>
          </div>
          {seedMessage ? (
            <div className="mt-3 text-sm" style={{ color: seedMessage.toLowerCase().includes('failed') ? COLORS.danger : COLORS.muted }}>
              {seedMessage}
            </div>
          ) : null}
        </div>

        {error && (
          <div className="rounded-xl border p-4 bg-red-50 mb-6" style={{ borderColor: 'rgba(255,95,87,0.3)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.danger }}>
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        {alerts.length === 0 ? (
          <div className="rounded-xl border p-10 text-center bg-white/85" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-lg font-semibold" style={{ color: COLORS.foreground }}>No train alerts found</div>
            <div className="text-sm mt-2" style={{ color: COLORS.muted }}>
              Create multiple complaints for the same train and refresh this page.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const smsMeta = smsStatusMeta(alert.sms_status);

              return (
                <div
                  key={alert._id}
                  className="rounded-xl border bg-white/90 backdrop-blur-md p-4"
                  style={{ borderColor: 'rgba(78,78,148,0.15)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold" style={{ color: COLORS.foreground }}>
                        Train {alert.train_number}
                      </div>
                      <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
                        Triggered: {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
                          Unique users: {alert.unique_users_count}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(78,78,148,0.08)', color: COLORS.foreground }}>
                          Complaints: {alert.total_complaints_count}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(78,78,148,0.08)', color: COLORS.foreground }}>
                          Rule: {'>'} {alert.threshold} users / {alert.window_minutes} min
                        </span>
                      </div>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: smsMeta.bg, color: smsMeta.color }}
                    >
                      <Send size={12} />
                      {smsMeta.label}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(78,78,148,0.12)' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
                        Next Stations
                      </div>
                      {alert.next_stations?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {alert.next_stations.map((station, index) => (
                            <span
                              key={`${station.station_code}-${index}`}
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{ backgroundColor: 'rgba(78,78,148,0.08)', color: COLORS.foreground }}
                            >
                              {station.station_code || station.station_name || 'N/A'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm" style={{ color: COLORS.muted }}>No next station data</div>
                      )}
                    </div>

                    <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(78,78,148,0.12)' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
                        SMS Details
                      </div>
                      <div className="text-xs break-words" style={{ color: COLORS.foreground }}>
                        <div><span className="font-semibold">Phone:</span> {alert.sms_phone || 'N/A'}</div>
                        <div className="mt-1"><span className="font-semibold">Message:</span> {alert.sms_message || 'N/A'}</div>
                        {alert.sms_error ? (
                          <div className="mt-1" style={{ color: COLORS.danger }}>
                            <span className="font-semibold">Error:</span> {alert.sms_error}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border p-3" style={{ borderColor: 'rgba(78,78,148,0.12)' }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
                      Complaint Summaries
                    </div>
                    {alert.complaint_summaries?.length ? (
                      <div className="space-y-3">
                        {alert.complaint_summaries.map((item, index) => (
                          <div key={`${item.query_id}-${index}`} className="rounded-md border p-3" style={{ borderColor: 'rgba(78,78,148,0.1)' }}>
                            <div className="text-sm" style={{ color: COLORS.foreground }}>
                              {item.description || 'No description'}
                            </div>
                            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
                              {item.station_code ? `Station: ${item.station_code} • ` : ''}
                              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time'}
                            </div>

                            {item.image_urls?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.image_urls.map((url, imageIndex) => (
                                  <a
                                    key={`${url}-${imageIndex}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                                    style={{ backgroundColor: 'rgba(78,78,148,0.08)', color: COLORS.primary }}
                                  >
                                    <ImageIcon size={12} />
                                    Image {imageIndex + 1}
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: COLORS.muted }}>No complaint summaries available</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
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
