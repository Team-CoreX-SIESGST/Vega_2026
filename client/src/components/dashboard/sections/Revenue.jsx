"use client";

import { DollarSign, Package, TrendingUp, BarChart3 } from "lucide-react";
import KpiCard from "../KpiCard";
import RevenueChart from "../charts/RevenueChart";
import OrdersChart from "../charts/OrdersChart";
import ProductPieChart from "../charts/ProductPieChart";
import ChartInsight from "../ChatInsight";
import AIRecommendations from "../AiRecommendation";
import RangeSelector from "../RangeSelector";
import { formatCurrency, formatNumber } from "@/utils/dataCleaners";
import {
  analyzeRevenueTrends,
  analyzeOrderTrends,
  analyzeRevenueByProduct,
  analyzeProductDistribution,
} from "@/utils/insightEngine";
import ChatBot from "../ChatBot";
import { generateOverviewInsights } from "@/utils/insightGenerator";

const RevenueSection = ({
  metrics,
  revenueByMonth,
  ordersByProduct,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
}) => {
  // Generate insights for ChatBot
  const revenueInsights = generateOverviewInsights(metrics);

  // Generate insights for chart
  const revenueTrendInsight = analyzeRevenueTrends(revenueByMonth);
  const orderTrendInsight = analyzeOrderTrends(revenueByMonth);
  const revenueByProductInsight = analyzeRevenueByProduct(ordersByProduct);
  const orderDistributionInsight = analyzeProductDistribution(
    ordersByProduct,
    "orders"
  );

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Revenue & Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed revenue analysis and order metrics
          </p>
        </div>
        {/* <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
          getCurrentRangeDisplay={getCurrentRangeDisplay}
          activeSection="revenue"
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
              {metrics.totalOrders} orders |{" "}
              {formatCurrency(metrics.totalRevenue)} revenue in selected range
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          
          trend="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          
          trend="up"
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov)}
          
          trend="up"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RevenueChart data={revenueByMonth} />
          <ChartInsight
            type={revenueTrendInsight.type}
            message={revenueTrendInsight.message}
          />
        </div>
        <div>
          <OrdersChart data={revenueByMonth} />
          <ChartInsight
            type={orderTrendInsight.type}
            message={orderTrendInsight.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ProductPieChart
            data={ordersByProduct}
            title="Orders by Product"
            dataKey="orders"
          />
          <ChartInsight
            type={orderDistributionInsight.type}
            message={orderDistributionInsight.message}
          />
        </div>
        <div>
          <ProductPieChart
            data={ordersByProduct}
            title="Revenue by Product"
            dataKey="revenue"
          />
          <ChartInsight
            type={revenueByProductInsight.type}
            message={revenueByProductInsight.message}
          />
        </div>
      </div>

      {/* AI ChatBot with Insights */}
      <ChatBot insights={revenueInsights} section="revenue" />

      {/* AI-Powered Recommendations */}
      <AIRecommendations
        sectionType="revenue"
        metrics={{
          totalRevenue: metrics.totalRevenue.toFixed(0),
          netRevenue: metrics.netRevenue.toFixed(0),
          totalOrders: metrics.totalOrders,
          aov: metrics.aov.toFixed(2),
          topProduct: ordersByProduct.sort(
            (a, b) => (b.revenue || 0) - (a.revenue || 0)
          )[0]?.product,
          topProductRevenue: ordersByProduct
            .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]
            ?.revenue?.toFixed(0),
        }}
        insights={{
          revenueTrend: revenueTrendInsight,
          orderTrend: orderTrendInsight,
          revenueByProduct: revenueByProductInsight,
        }}
      />
    </div>
  );
};

export default RevenueSection;
