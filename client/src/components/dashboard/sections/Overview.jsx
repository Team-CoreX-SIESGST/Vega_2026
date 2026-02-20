"use client";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  Wallet,
  Package,
} from "lucide-react";
import KpiCard from "../KpiCard";
import RevenueChart from "../charts/RevenueChart";
import YearlyComparisonChart from "../charts/YearlyComparisionChart";
import RangeSelector from "../RangeSelector";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/utils/dataCleaners";
import ChatBot from "../ChatBot";
import { generateOverviewInsights } from "@/utils/insightGenerator";

const OverviewSection = ({
  metrics,
  revenueByMonth,
  revenueByYear,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
}) => {
  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  // Generate insights for overview section
  const overviewInsights = generateOverviewInsights(metrics);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Your business performance at a glance
          </p>
        </div>
        {/* <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
          getCurrentRangeDisplay={getCurrentRangeDisplay}
          activeSection="overview"
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
              Data is sorted by date (oldest to newest)
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          icon={<Wallet className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          
          trend="up"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov)}
          
          trend="up"
          icon={<Package className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Rate"
          value={formatPercentage(metrics.refundRate)}
          
          trend="up"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Refunds"
          value={formatCurrency(metrics.totalRefunds)}
          
          trend="down"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* AI ChatBot with Insights */}
      <ChatBot insights={overviewInsights} section="overview" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueByMonth} />
        <YearlyComparisonChart data={revenueByYear} />
      </div>
    </div>
  );
};

export default OverviewSection;
