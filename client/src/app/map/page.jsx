'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, BarChart3, MapPinned, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { apiClient } from '@/utils/api_client';
import { useAuth } from '@/contexts/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';

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

const STATUS_META = {
  received: { label: 'Received', color: '#FEBC2E' },
  assigned: { label: 'Assigned', color: '#4E4E94' },
  working_on: { label: 'Working On', color: '#6B5BD6' },
  hold: { label: 'Hold', color: '#FF8A3D' },
  pending_info: { label: 'Pending Info', color: '#F0B429' },
  escalated: { label: 'Escalated', color: '#FF5F57' },
  resolved: { label: 'Resolved', color: '#28C840' },
  closed: { label: 'Closed', color: '#1E9E5A' },
  rejected: { label: 'Rejected', color: '#8E8E8E' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...Object.entries(STATUS_META).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

const normalizeRole = (role = '') =>
  String(role).trim().toLowerCase().replace(/[\s_]+/g, '');

const isAdminRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'superadmin';
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getDominantStatus = (station) => {
  const entries = Object.entries(station?.status_breakdown || {});
  if (!entries.length) return 'received';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0] || 'received';
};

const getStatusBadge = (status) => STATUS_META[status] || STATUS_META.received;

const buildInfoWindowContent = (station) => {
  const statusRows = Object.entries(station?.status_breakdown || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => {
      const statusMeta = getStatusBadge(status);
      return `<div style="display:flex;justify-content:space-between;gap:8px;margin-top:4px;">
        <span style="color:#4A4A6A;">${escapeHtml(statusMeta.label)}</span>
        <strong style="color:${statusMeta.color};">${count}</strong>
      </div>`;
    })
    .join('');

  return `
    <div style="min-width:220px;font-family:Outfit,sans-serif;">
      <div style="font-size:14px;font-weight:700;color:#1A1A2E;">
        ${escapeHtml(station.station_name)} (${escapeHtml(station.station_code)})
      </div>
      <div style="font-size:12px;color:#4A4A6A;margin-top:2px;">
        ${escapeHtml(station.state || 'Unknown State')}
      </div>
      <div style="margin-top:8px;padding:8px;border-radius:8px;background:#F7F7FB;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#4A4A6A;">Queries</span>
          <strong style="color:#4E4E94;">${station.query_count}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="color:#4A4A6A;">Avg Priority</span>
          <strong style="color:#4E4E94;">${station.avg_priority}%</strong>
        </div>
      </div>
      <div style="margin-top:8px;">
        ${statusRows || '<span style="font-size:12px;color:#4A4A6A;">No status breakdown</span>'}
      </div>
    </div>
  `;
};

export default function MapPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [mapError, setMapError] = useState('');
  const [mapScriptReady, setMapScriptReady] = useState(false);
  const [stations, setStations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedStationCode, setSelectedStationCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minCount, setMinCount] = useState(1);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markerByCodeRef = useRef(new Map());
  const markerRefs = useRef([]);
  const circleRefs = useRef([]);

  const canViewMap = isAdminRole(user?.role);
  const mapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  const selectedStation = useMemo(
    () => stations.find((station) => station.station_code === selectedStationCode) || null,
    [stations, selectedStationCode],
  );

  const topStations = useMemo(
    () => [...stations].sort((a, b) => b.query_count - a.query_count),
    [stations],
  );

  const networkAveragePriority = useMemo(() => {
    if (!stations.length) return 0;
    const totalPriority = stations.reduce(
      (sum, station) => sum + station.avg_priority,
      0,
    );
    return Number((totalPriority / stations.length).toFixed(1));
  }, [stations]);

  const fetchMapData = useCallback(
    async ({ manual = false } = {}) => {
      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError('');

        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        params.set('min_count', String(minCount));

        const queryString = params.toString();
        const response = await apiClient.get(
          `/queries/map/stations${queryString ? `?${queryString}` : ''}`,
        );

        if (!response.data?.status) {
          throw new Error(response.data?.message || 'Failed to fetch map data');
        }

        setStations(response.data?.data?.stations || []);
        setSummary(response.data?.data?.summary || null);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to fetch map data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, minCount],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/map');
      return;
    }

    if (!canViewMap) {
      router.push('/mobile');
    }
  }, [authLoading, isAuthenticated, canViewMap, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !canViewMap) return;
    fetchMapData();
  }, [authLoading, isAuthenticated, canViewMap, fetchMapData]);

  useEffect(() => {
    if (!mapsApiKey) {
      setMapError(
        'Missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your client env.',
      );
      return;
    }

    if (typeof window === 'undefined') return;
    if (window.google?.maps) {
      setMapScriptReady(true);
      return;
    }

    const scriptId = 'google-maps-sdk';
    const existingScript = document.getElementById(scriptId);
    let scriptElement = existingScript;

    const handleLoad = () => setMapScriptReady(true);
    const handleError = () => {
      setMapError('Google Maps failed to load. Please verify the API key and enabled APIs.');
    };

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=weekly`;
      scriptElement.async = true;
      scriptElement.defer = true;
      document.head.appendChild(scriptElement);
    }

    scriptElement.addEventListener('load', handleLoad);
    scriptElement.addEventListener('error', handleError);

    return () => {
      scriptElement.removeEventListener('load', handleLoad);
      scriptElement.removeEventListener('error', handleError);
    };
  }, [mapsApiKey]);

  useEffect(() => {
    if (!mapScriptReady || !mapContainerRef.current || !window.google?.maps) return;
    const googleMaps = window.google.maps;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new googleMaps.Map(mapContainerRef.current, {
        center: INDIA_CENTER,
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      infoWindowRef.current = new googleMaps.InfoWindow();
    }

    markerRefs.current.forEach((marker) => marker.setMap(null));
    circleRefs.current.forEach((circle) => circle.setMap(null));
    markerRefs.current = [];
    circleRefs.current = [];
    markerByCodeRef.current.clear();

    if (!stations.length) {
      mapInstanceRef.current.setCenter(INDIA_CENTER);
      mapInstanceRef.current.setZoom(5);
      return;
    }

    const bounds = new googleMaps.LatLngBounds();

    stations.forEach((station) => {
      const position = {
        lat: station.latitude,
        lng: station.longitude,
      };
      bounds.extend(position);

      const dominantStatus = getDominantStatus(station);
      const markerColor = getStatusBadge(dominantStatus).color;
      const markerLabel = station.query_count > 99 ? '99+' : String(station.query_count);

      const marker = new googleMaps.Marker({
        position,
        map: mapInstanceRef.current,
        title: `${station.station_name} (${station.station_code})`,
        label: {
          text: markerLabel,
          color: '#fff',
          fontWeight: '700',
          fontSize: '11px',
        },
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.95,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: Math.min(24, 8 + station.query_count * 0.8),
        },
      });

      const circle = new googleMaps.Circle({
        map: mapInstanceRef.current,
        center: position,
        radius: Math.min(35000, 4500 + station.query_count * 1300),
        strokeColor: markerColor,
        strokeOpacity: 0.28,
        strokeWeight: 1,
        fillColor: markerColor,
        fillOpacity: 0.14,
      });

      marker.addListener('click', () => {
        setSelectedStationCode(station.station_code);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(buildInfoWindowContent(station));
          infoWindowRef.current.open({
            map: mapInstanceRef.current,
            anchor: marker,
          });
        }
      });

      markerRefs.current.push(marker);
      circleRefs.current.push(circle);
      markerByCodeRef.current.set(station.station_code, marker);
    });

    if (stations.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(9);
    } else {
      mapInstanceRef.current.fitBounds(bounds, 90);
    }
  }, [mapScriptReady, stations]);

  const focusStation = (station) => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    setSelectedStationCode(station.station_code);

    const target = { lat: station.latitude, lng: station.longitude };
    mapInstanceRef.current.panTo(target);
    mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom() || 0, 8));

    const marker = markerByCodeRef.current.get(station.station_code);
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(buildInfoWindowContent(station));
      infoWindowRef.current.open({
        map: mapInstanceRef.current,
        anchor: marker,
      });
    }
  };

  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={42} style={{ color: COLORS.primary }} />
          <p className="text-lg" style={{ color: COLORS.muted }}>Preparing map view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
              <MapPinned size={18} style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-outfit" style={{ color: COLORS.foreground }}>
                Station <span style={{ color: COLORS.primary }}>Query Map</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Live station-wise complaint density with status overlays
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
              onClick={() => fetchMapData({ manual: true })}
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

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Stations With Queries</div>
            <div className="text-3xl font-bold" style={{ color: COLORS.foreground }}>
              {summary?.totalStationsWithQueries ?? stations.length}
            </div>
          </div>
          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Total Mapped Queries</div>
            <div className="text-3xl font-bold" style={{ color: COLORS.foreground }}>
              {summary?.totalQueriesMapped ?? stations.reduce((sum, station) => sum + station.query_count, 0)}
            </div>
          </div>
          <div className="rounded-xl border p-4 bg-white/85 backdrop-blur-md" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>Network Avg Priority</div>
            <div className="text-3xl font-bold" style={{ color: COLORS.foreground }}>
              {networkAveragePriority}%
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border p-4 bg-red-50/90" style={{ borderColor: 'rgba(255,95,87,0.3)' }}>
            <div className="flex items-start gap-2 text-sm" style={{ color: COLORS.danger }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-2xl border bg-white/90 backdrop-blur-md p-4" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: COLORS.primary }} />
                <h2 className="font-semibold" style={{ color: COLORS.foreground }}>
                  Geo Visualization
                </h2>
              </div>
              <span className="text-xs" style={{ color: COLORS.muted }}>
                Click a marker to inspect station details
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border relative" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
              <div ref={mapContainerRef} className="w-full h-[64vh] min-h-[420px]" />

              {!mapScriptReady && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/85">
                  <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-3" size={32} style={{ color: COLORS.primary }} />
                    <p className="text-sm" style={{ color: COLORS.muted }}>Loading Google Map...</p>
                  </div>
                </div>
              )}

              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/95 p-6">
                  <div className="max-w-md text-center">
                    <AlertCircle className="mx-auto mb-3" size={30} style={{ color: COLORS.danger }} />
                    <p className="text-sm" style={{ color: COLORS.foreground }}>{mapError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-white/90 backdrop-blur-md p-4" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal size={15} style={{ color: COLORS.primary }} />
                <h3 className="font-semibold text-sm" style={{ color: COLORS.foreground }}>
                  Filters
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: COLORS.muted }}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.foreground }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: COLORS.muted }}>
                    Min Queries Per Station
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minCount}
                    onChange={(event) => setMinCount(Math.max(1, Number(event.target.value) || 1))}
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'rgba(78,78,148,0.25)', color: COLORS.foreground }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white/90 backdrop-blur-md p-4" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: COLORS.foreground }}>
                Stations Ranked By Query Count
              </h3>
              {loading ? (
                <div className="py-8 text-center text-sm" style={{ color: COLORS.muted }}>Loading station data...</div>
              ) : topStations.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: COLORS.muted }}>
                  No stations match current filters.
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {topStations.map((station) => {
                    const dominantStatus = getDominantStatus(station);
                    const dominantMeta = getStatusBadge(dominantStatus);
                    const active = selectedStationCode === station.station_code;

                    return (
                      <button
                        key={station.station_code}
                        type="button"
                        onClick={() => focusStation(station)}
                        className="w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm"
                        style={{
                          borderColor: active ? 'rgba(78,78,148,0.35)' : 'rgba(78,78,148,0.15)',
                          backgroundColor: active ? 'rgba(78,78,148,0.07)' : '#fff',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: COLORS.foreground }}>
                              {station.station_name}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                              {station.station_code} · {station.state || 'Unknown'}
                            </div>
                          </div>
                          <div
                            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: dominantMeta.color }}
                          >
                            {station.query_count}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white/90 backdrop-blur-md p-4" style={{ borderColor: 'rgba(78,78,148,0.15)' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: COLORS.foreground }}>
                {selectedStation ? 'Selected Station' : 'Selection'}
              </h3>
              {!selectedStation ? (
                <p className="text-sm" style={{ color: COLORS.muted }}>
                  Select a marker or station card to inspect query distribution.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold" style={{ color: COLORS.foreground }}>
                    {selectedStation.station_name} ({selectedStation.station_code})
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    {selectedStation.state || 'Unknown state'}
                  </div>
                  <div className="pt-1 text-sm" style={{ color: COLORS.foreground }}>
                    <span className="font-semibold">Queries:</span> {selectedStation.query_count}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.foreground }}>
                    <span className="font-semibold">Avg Priority:</span> {selectedStation.avg_priority}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
