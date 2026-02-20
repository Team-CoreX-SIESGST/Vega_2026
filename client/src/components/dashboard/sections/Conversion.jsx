"use client";

import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Target,
  Percent,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import KpiCard from "../KpiCard";
import ConversionChart from "../charts/ConversionChart";
import ChartInsight from "../ChatInsight";
import AIRecommendations from "../AiRecommendation";
import RangeSelector from "../RangeSelector";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/utils/dataCleaners";
import {
  analyzeConversionTimeline,
  analyzeConversionFunnel,
  analyzeSourceConversion,
  analyzeDeviceConversion,
  analyzeVisitorTypeConversion,
  analyzeProductPerformance,
  analyzeRevenueMetrics,
} from "@/utils/insightEngine";
import ChatBot from "../ChatBot";
import { generateConversionInsights } from "@/utils/insightGenerator";

const ConversionSection = ({
  sessions = [],
  orders = [],
  orderItems = [],
  products = [],
  pageviews = [],
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
}) => {
  // Calculate comprehensive conversion metrics
  const calculateMetrics = () => {
    const totalSessions = sessions?.length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.price_usd || 0),
      0
    );
    const totalCogs = orders.reduce(
      (sum, order) => sum + parseFloat(order.cogs_usd || 0),
      0
    );
    const totalProfit = totalRevenue - totalCogs;

    const overallConversionRate =
      totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const revenuePerSession =
      totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const orderSessionIds = new Set(orders.map((o) => o.website_session_id));

    const deviceConversion = sessions.reduce((acc, session) => {
      const device = session.device_type || "unknown";
      if (!acc[device]) {
        acc[device] = { sessions: 0, conversions: 0, revenue: 0 };
      }
      acc[device].sessions += 1;

      if (orderSessionIds.has(session.website_session_id)) {
        acc[device].conversions += 1;
        const order = orders.find(
          (o) => o.website_session_id === session.website_session_id
        );
        if (order) {
          acc[device].revenue += parseFloat(order.price_usd || 0);
        }
      }
      return acc;
    }, {});

    const deviceData = Object.entries(deviceConversion).map(
      ([device, data]) => ({
        device,
        sessions: data.sessions,
        conversions: data.conversions,
        conversionRate:
          data.sessions > 0 ? (data.conversions / data.sessions) * 100 : 0,
        revenue: data.revenue,
      })
    );

    const sourceConversion = sessions.reduce((acc, session) => {
      const source = session.utm_source || "direct";
      if (!acc[source]) {
        acc[source] = { sessions: 0, conversions: 0, revenue: 0 };
      }
      acc[source].sessions += 1;

      if (orderSessionIds.has(session.website_session_id)) {
        acc[source].conversions += 1;
        const order = orders.find(
          (o) => o.website_session_id === session.website_session_id
        );
        if (order) {
          acc[source].revenue += parseFloat(order.price_usd || 0);
        }
      }
      return acc;
    }, {});

    const sourceData = Object.entries(sourceConversion).map(
      ([source, data]) => ({
        source,
        sessions: data.sessions,
        conversions: data.conversions,
        conversionRate:
          data.sessions > 0 ? (data.conversions / data.sessions) * 100 : 0,
        revenue: data.revenue,
        revenuePerSession: data.sessions > 0 ? data.revenue / data.sessions : 0,
      })
    );

    const campaignConversion = sessions.reduce((acc, session) => {
      const campaign = session.utm_campaign || "none";
      if (!acc[campaign]) {
        acc[campaign] = { sessions: 0, conversions: 0, revenue: 0 };
      }
      acc[campaign].sessions += 1;

      if (orderSessionIds.has(session.website_session_id)) {
        acc[campaign].conversions += 1;
        const order = orders.find(
          (o) => o.website_session_id === session.website_session_id
        );
        if (order) {
          acc[campaign].revenue += parseFloat(order.price_usd || 0);
        }
      }
      return acc;
    }, {});

    const campaignData = Object.entries(campaignConversion).map(
      ([campaign, data]) => ({
        campaign,
        sessions: data.sessions,
        conversions: data.conversions,
        conversionRate:
          data.sessions > 0 ? (data.conversions / data.sessions) * 100 : 0,
        revenue: data.revenue,
      })
    );

    const newVisitors = sessions.filter((s) => s.is_repeat_session === "0");
    const returningVisitors = sessions.filter(
      (s) => s.is_repeat_session === "1"
    );

    const newConversions = newVisitors.filter((s) =>
      orderSessionIds.has(s.website_session_id)
    ).length;
    const returningConversions = returningVisitors.filter((s) =>
      orderSessionIds.has(s.website_session_id)
    ).length;

    const newConversionRate =
      newVisitors.length > 0 ? (newConversions / newVisitors.length) * 100 : 0;
    const returningConversionRate =
      returningVisitors.length > 0
        ? (returningConversions / returningVisitors.length) * 100
        : 0;

    const conversionByDate = sessions.reduce((acc, session) => {
      const date = session.created_at.split(" ")[0];
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, conversions: 0 };
      }
      acc[date].sessions += 1;

      if (orderSessionIds.has(session.website_session_id)) {
        acc[date].conversions += 1;
      }
      return acc;
    }, {});

    const timelineData = Object.values(conversionByDate)
      .map((item) => ({
        ...item,
        conversionRate:
          item.sessions > 0 ? (item.conversions / item.sessions) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const productPerformance = orderItems.reduce((acc, item) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = { orders: 0, revenue: 0, profit: 0 };
      }
      acc[productId].orders += 1;
      acc[productId].revenue += parseFloat(item.price_usd || 0);
      acc[productId].profit +=
        parseFloat(item.price_usd || 0) - parseFloat(item.cogs_usd || 0);
      return acc;
    }, {});

    const productData = Object.entries(productPerformance).map(
      ([productId, data]) => {
        const product = products.find((p) => p.product_id === productId);
        return {
          productName: product?.product_name || `Product ${productId}`,
          orders: data.orders,
          revenue: data.revenue,
          profit: data.profit,
          profitMargin:
            data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
        };
      }
    );

    const landingPages = pageviews.reduce(
      (acc, pv) => {
        if (!acc.sessions[pv.website_session_id]) {
          acc.sessions[pv.website_session_id] = true;
          const url = pv.pageview_url || "/";
          if (!acc.pages[url]) {
            acc.pages[url] = { sessions: 0, conversions: 0 };
          }
          acc.pages[url].sessions += 1;

          if (orderSessionIds.has(pv.website_session_id)) {
            acc.pages[url].conversions += 1;
          }
        }
        return acc;
      },
      { sessions: {}, pages: {} }
    );

    const landingPageData = Object.entries(landingPages.pages)
      .map(([url, data]) => ({
        url,
        sessions: data.sessions,
        conversions: data.conversions,
        conversionRate:
          data.sessions > 0 ? (data.conversions / data.sessions) * 100 : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    const uniqueSessionsWithPageviews = new Set(
      pageviews.map((pv) => pv.website_session_id)
    ).size;
    const funnelData = [
      { stage: "Sessions", count: totalSessions, rate: 100 },
      {
        stage: "Engaged (>1 page)",
        count: uniqueSessionsWithPageviews,
        rate:
          totalSessions > 0
            ? (uniqueSessionsWithPageviews / totalSessions) * 100
            : 0,
      },
      {
        stage: "Orders",
        count: totalOrders,
        rate: totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0,
      },
    ];

    return {
      overallConversionRate,
      totalOrders,
      totalRevenue,
      aov,
      revenuePerSession,
      profitMargin,
      totalProfit,
      deviceData,
      sourceData,
      campaignData,
      newConversionRate,
      returningConversionRate,
      timelineData,
      productData,
      landingPageData,
      funnelData,
      newVisitors: newVisitors.length,
      returningVisitors: returningVisitors.length,
    };
  };

  const metrics = calculateMetrics();

  // Generate insights for ChatBot
  const conversionInsights = generateConversionInsights(metrics);

  // Generate insights for chart
  const timelineInsight = analyzeConversionTimeline(metrics.timelineData);
  const funnelInsight = analyzeConversionFunnel(metrics.funnelData);
  const sourceInsight = analyzeSourceConversion(metrics.sourceData);
  const deviceInsight = analyzeDeviceConversion(metrics.deviceData);
  const visitorTypeInsight = analyzeVisitorTypeConversion(
    metrics.newConversionRate,
    metrics.returningConversionRate,
    metrics.newVisitors,
    metrics.returningVisitors
  );
  const productInsight = analyzeProductPerformance(metrics.productData);
  const revenueInsight = analyzeRevenueMetrics(
    metrics.aov,
    metrics.revenuePerSession,
    metrics.totalOrders
  );

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Conversion Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Track conversion performance and optimize your funnel
          </p>
        </div>
        {/* <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
          getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
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
              {metrics.totalOrders} orders and{" "}
              {metrics.newVisitors + metrics.returningVisitors} sessions in
              selected range
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Conversion Rate"
          value={formatPercentage(metrics.overallConversionRate)}
          
          trend="up"
          icon={<Target className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          
          trend="up"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KpiCard
          title="Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          
          trend="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Order Value"
          value={formatCurrency(metrics.aov)}
          
          trend="neutral"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <ChartInsight
        type={revenueInsight.type}
        message={revenueInsight.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Revenue/Session"
          value={formatCurrency(metrics.revenuePerSession)}
          
          trend="up"
          icon={<Percent className="w-4 h-4" />}
        />
        <KpiCard
          title="Profit Margin"
          value={formatPercentage(metrics.profitMargin)}
          
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="New Visitor Conv Rate"
          value={formatPercentage(metrics.newConversionRate)}
          
          trend="down"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Returning Conv Rate"
          value={formatPercentage(metrics.returningConversionRate)}
          
          trend="up"
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ConversionChart
            type="timeline"
            data={metrics.timelineData}
            title="Conversion Rate Over Time"
          />
          <ChartInsight
            type={timelineInsight.type}
            message={timelineInsight.message}
          />
        </div>
        <div>
          <ConversionChart
            type="funnel"
            data={metrics.funnelData}
            title="Conversion Funnel"
          />
          <ChartInsight
            type={funnelInsight.type}
            message={funnelInsight.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ConversionChart
            type="source"
            data={metrics.sourceData.slice(0, 5)}
            title="Conversion Rate by Source"
          />
          <ChartInsight
            type={sourceInsight.type}
            message={sourceInsight.message}
          />
        </div>
        <div>
          <ConversionChart
            type="device"
            data={metrics.deviceData}
            title="Conversion Rate by Device"
          />
          <ChartInsight
            type={deviceInsight.type}
            message={deviceInsight.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ConversionChart
            type="product"
            data={metrics.productData}
            title="Revenue by Product"
          />
          <ChartInsight
            type={productInsight.type}
            message={productInsight.message}
          />
        </div>
        <div>
          <ConversionChart
            type="visitor-type"
            data={[
              {
                type: "New Visitors",
                sessions: metrics.newVisitors,
                conversionRate: metrics.newConversionRate,
              },
              {
                type: "Returning",
                sessions: metrics.returningVisitors,
                conversionRate: metrics.returningConversionRate,
              },
            ]}
            title="New vs Returning Conversion"
          />
          <ChartInsight
            type={visitorTypeInsight.type}
            message={visitorTypeInsight.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Source Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Conv Rate
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Rev/Session
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.sourceData
                  .sort((a, b) => b.conversionRate - a.conversionRate)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground font-medium">
                        {item.source}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">
                        {formatPercentage(item.conversionRate)}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                        {formatCurrency(item.revenuePerSession)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Campaign Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Campaign
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Sessions
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Orders
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Conv Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.campaignData
                  .sort((a, b) => b.conversionRate - a.conversionRate)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground font-medium">
                        {item.campaign}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">
                        {formatNumber(item.sessions)}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">
                        {formatNumber(item.conversions)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                        {formatPercentage(item.conversionRate)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI ChatBot with Insights */}
      <ChatBot insights={conversionInsights} section="conversion" />

      {/* AI-Powered Recommendations */}
      <AIRecommendations
        sectionType="conversion"
        metrics={{
          conversionRate: metrics.overallConversionRate.toFixed(2),
          totalOrders: metrics.totalOrders,
          revenue: metrics.totalRevenue.toFixed(0),
          aov: metrics.aov.toFixed(2),
          profitMargin: metrics.profitMargin.toFixed(1),
          newConversionRate: metrics.newConversionRate.toFixed(2),
          returningConversionRate: metrics.returningConversionRate.toFixed(2),
          topSource: metrics.sourceData[0]?.source,
          topSourceConvRate: metrics.sourceData[0]?.conversionRate.toFixed(2),
        }}
        insights={{
          timeline: timelineInsight,
          funnel: funnelInsight,
          source: sourceInsight,
          device: deviceInsight,
          visitorType: visitorTypeInsight,
          product: productInsight,
          revenue: revenueInsight,
        }}
      />
    </div>
  );
};

export default ConversionSection;
