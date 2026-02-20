"use client";

import {
  Users,
  Monitor,
  Smartphone,
  TrendingUp,
  MousePointer,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import KpiCard from "../KpiCard";
import TrafficChart from "../charts/TrafficChart";
import ChartInsight from "../ChatInsight";
import AIRecommendations from "../AiRecommendation";
import RangeSelector from "../RangeSelector";
import { formatNumber, formatPercentage } from "@/utils/dataCleaners";
import {
  analyzeTimelineData,
  analyzeSourceData,
  analyzeDeviceData,
  analyzeCampaignData,
  analyzeLandingPages,
  analyzeBounceRate,
} from "@/utils/insightEngine";
import ChatBot from "../ChatBot";
import { generateTrafficInsights } from "@/utils/insightGenerator";

const TrafficSection = ({
  sessions,
  pageviews,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
}) => {
  // Calculate metrics
  const calculateMetrics = () => {
    // Total sessions
    const totalSessions = sessions.length;

    // Unique users
    const uniqueUsers = new Set(sessions.map((s) => s.user_id)).size;

    // Device breakdown
    const deviceCounts = sessions.reduce((acc, session) => {
      const device = session.device_type?.toLowerCase() || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // New vs Returning
    const newSessions = sessions.filter(
      (s) => s.is_repeat_session === "0"
    ).length;
    const returningSessions = sessions.filter(
      (s) => s.is_repeat_session === "1"
    ).length;

    // Bounce rate calculation (sessions with only 1 pageview)
    const sessionPageviewCounts = pageviews.reduce((acc, pv) => {
      acc[pv.website_session_id] = (acc[pv.website_session_id] || 0) + 1;
      return acc;
    }, {});

    const bouncedSessions = Object.values(sessionPageviewCounts).filter(
      (count) => count === 1
    ).length;
    const bounceRate =
      totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    // Average pages per session
    const avgPagesPerSession =
      totalSessions > 0 ? pageviews.length / totalSessions : 0;

    // Traffic by source
    const trafficBySource = sessions.reduce((acc, session) => {
      const source = session.utm_source || "direct";
      if (!acc[source]) {
        acc[source] = { source, sessions: 0, users: new Set() };
      }
      acc[source].sessions += 1;
      acc[source].users.add(session.user_id);
      return acc;
    }, {});

    const sourceData = Object.values(trafficBySource)
      .map((item) => ({
        source: item.source,
        sessions: item.sessions,
        users: item.users.size,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Traffic by campaign
    const trafficByCampaign = sessions.reduce((acc, session) => {
      const campaign = session.utm_campaign || "none";
      if (!acc[campaign]) {
        acc[campaign] = { campaign, sessions: 0 };
      }
      acc[campaign].sessions += 1;
      return acc;
    }, {});

    const campaignData = Object.values(trafficByCampaign).sort(
      (a, b) => b.sessions - a.sessions
    );

    // Traffic over time (by day)
    const trafficByDate = sessions.reduce((acc, session) => {
      const date = session.created_at.split(" ")[0];
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, desktop: 0, mobile: 0 };
      }
      acc[date].sessions += 1;
      if (session.device_type?.toLowerCase() === "desktop") {
        acc[date].desktop += 1;
      } else if (session.device_type?.toLowerCase() === "mobile") {
        acc[date].mobile += 1;
      }
      return acc;
    }, {});

    const timelineData = Object.values(trafficByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Top landing pages
    const landingPages = pageviews.reduce(
      (acc, pv) => {
        // Get first pageview for each session
        if (!acc.sessions[pv.website_session_id]) {
          acc.sessions[pv.website_session_id] = true;
          const url = pv.pageview_url || "/";
          acc.pages[url] = (acc.pages[url] || 0) + 1;
        }
        return acc;
      },
      { sessions: {}, pages: {} }
    );

    const topLandingPages = Object.entries(landingPages.pages)
      .map(([url, count]) => ({ url, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions);

    return {
      totalSessions,
      uniqueUsers,
      bounceRate,
      avgPagesPerSession,
      deviceCounts,
      newSessions,
      returningSessions,
      sourceData,
      campaignData,
      timelineData,
      topLandingPages,
    };
  };

  const metrics = calculateMetrics();

  // Generate insights for ChatBot
  const trafficMetrics = {
    bounceRate: metrics.bounceRate,
    mobilePercent:
      ((metrics.deviceCounts.mobile || 0) / metrics.totalSessions) * 100,
    desktopPercent:
      ((metrics.deviceCounts.desktop || 0) / metrics.totalSessions) * 100,
    returningRate: (metrics.returningSessions / metrics.totalSessions) * 100,
    avgPagesPerSession: metrics.avgPagesPerSession,
  };

  const trafficInsights = generateTrafficInsights(trafficMetrics);

  // Generate insights for each chart
  const timelineInsight = analyzeTimelineData(metrics.timelineData);
  const sourceInsight = analyzeSourceData(metrics.sourceData);
  const deviceInsight = analyzeDeviceData([
    { device: "desktop", sessions: metrics.deviceCounts.desktop || 0 },
    { device: "mobile", sessions: metrics.deviceCounts.mobile || 0 },
  ]);
  const campaignInsight = analyzeCampaignData(metrics.campaignData);
  const bounceInsight = analyzeBounceRate(
    metrics.bounceRate,
    metrics.avgPagesPerSession
  );
  const landingPageInsight = analyzeLandingPages(
    metrics.topLandingPages,
    metrics.totalSessions
  );

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Traffic & Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor website traffic and user behavior
          </p>
        </div>
        {/* <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
          getCurrentRangeDisplay={getCurrentRangeDisplay}
          activeSection="traffic"
        /> */}
      </div>

      {/* Data Range Info */}
      {rangeDisplay && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Currently viewing{" "}
              <span className="font-semibold text-foreground">
                {rangeDisplay.label}
              </span>{" "}
              {rangeDisplay.current} of {rangeDisplay.total} total
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.uniqueUsers} unique users |{" "}
              {metrics.newSessions + metrics.returningSessions} total sessions
              in selected range
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sessions"
          value={formatNumber(metrics.totalSessions)}
          
          trend="up"
          icon={<MousePointer className="w-4 h-4" />}
        />
        <KpiCard
          title="Unique Users"
          value={formatNumber(metrics.uniqueUsers)}
          
          trend="up"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Bounce Rate"
          value={formatPercentage(metrics.bounceRate)}
          
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Pages/Session"
          value={metrics.avgPagesPerSession.toFixed(2)}
          
          trend="up"
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      {/* Bounce Rate Insight */}
      <ChartInsight type={bounceInsight.type} message={bounceInsight.message} />

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Desktop Sessions"
          value={formatNumber(metrics.deviceCounts.desktop || 0)}
          
          trend="neutral"
          icon={<Monitor className="w-4 h-4" />}
        />
        <KpiCard
          title="Mobile Sessions"
          value={formatNumber(metrics.deviceCounts.mobile || 0)}
          
          trend="up"
          icon={<Smartphone className="w-4 h-4" />}
        />
        <KpiCard
          title="Returning Visitors"
          value={formatPercentage(
            (metrics.returningSessions / metrics.totalSessions) * 100
          )}
          
          trend="up"
          icon={<RefreshCw className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TrafficChart
            type="timeline"
            data={metrics.timelineData}
            title="Traffic Over Time"
          />
          <ChartInsight
            type={timelineInsight.type}
            message={timelineInsight.message}
          />
        </div>

        <div>
          <TrafficChart
            type="source"
            data={metrics.sourceData}
            title="Traffic by Source"
          />
          <ChartInsight
            type={sourceInsight.type}
            message={sourceInsight.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TrafficChart
            type="device"
            data={[
              {
                device: "Desktop",
                sessions: metrics.deviceCounts.desktop || 0,
              },
              { device: "Mobile", sessions: metrics.deviceCounts.mobile || 0 },
            ]}
            title="Device Breakdown"
          />
          <ChartInsight
            type={deviceInsight.type}
            message={deviceInsight.message}
          />
        </div>

        <div>
          <TrafficChart
            type="campaign"
            data={metrics.campaignData.slice(0, 5)}
            title="Top Campaigns"
          />
          <ChartInsight
            type={campaignInsight.type}
            message={campaignInsight.message}
          />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Traffic Sources
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Sessions
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.sourceData.slice(0, 5).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {item.source}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatNumber(item.sessions)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                      {formatNumber(item.users)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Landing Pages Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Top Landing Pages
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Page URL
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Sessions
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.topLandingPages.slice(0, 5).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-mono">
                      {item.url}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatNumber(item.sessions)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                      {formatPercentage(
                        (item.sessions / metrics.totalSessions) * 100
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ChartInsight
            type={landingPageInsight.type}
            message={landingPageInsight.message}
          />
        </div>
      </div>

      {/* AI ChatBot with Insights */}
      <ChatBot insights={trafficInsights} section="traffic" />

      {/* AI-Powered Recommendations */}
      <AIRecommendations
        sectionType="traffic"
        metrics={{
          totalSessions: metrics.totalSessions,
          uniqueUsers: metrics.uniqueUsers,
          bounceRate: metrics.bounceRate.toFixed(1),
          avgPagesPerSession: metrics.avgPagesPerSession.toFixed(2),
          topSource: metrics.sourceData[0]?.source,
          topSourcePercent: (
            (metrics.sourceData[0]?.sessions / metrics.totalSessions) *
            100
          ).toFixed(0),
          mobilePercent: (
            ((metrics.deviceCounts.mobile || 0) / metrics.totalSessions) *
            100
          ).toFixed(0),
          desktopPercent: (
            ((metrics.deviceCounts.desktop || 0) / metrics.totalSessions) *
            100
          ).toFixed(0),
          returningRate: (
            (metrics.returningSessions / metrics.totalSessions) *
            100
          ).toFixed(1),
        }}
        insights={{
          timeline: timelineInsight,
          source: sourceInsight,
          device: deviceInsight,
          campaign: campaignInsight,
          bounce: bounceInsight,
          landingPage: landingPageInsight,
        }}
      />
    </div>
  );
};

export default TrafficSection;
