"use client";

import { RotateCcw, DollarSign, AlertTriangle, Package } from "lucide-react";
import KpiCard from "../KpiCard";
import RefundChart from "../charts/RefundChart";
import ChartInsight from "../ChatInsight";
import AIRecommendations from "../AiRecommendation";
import RangeSelector from "../RangeSelector";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/utils/dataCleaners";
import {
  analyzeRefundTrends,
  analyzeRefundByProduct,
} from "@/utils/insightEngine";
import ChatBot from "../ChatBot";
import { generateRefundInsights } from "@/utils/insightGenerator";

const RefundSection = ({
  metrics,
  refundsByProduct,
  totalRefundCount,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
}) => {
  // Generate insights
  const avgRefundValue =
    totalRefundCount > 0 ? metrics.totalRefunds / totalRefundCount : 0;
  const refundTrendInsight = analyzeRefundTrends(
    metrics.refundRate,
    avgRefundValue,
    totalRefundCount
  );
  const refundByProductInsight = analyzeRefundByProduct(refundsByProduct);

  // Generate insights for ChatBot
  const refundMetrics = {
    refundRate: metrics.refundRate,
    totalRefunds: metrics.totalRefunds,
    avgRefundValue,
    totalRefundCount,
  };

  const refundInsights = generateRefundInsights(refundMetrics);

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Refund Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze refund patterns
          </p>
        </div>
        {/* <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
          getCurrentRangeDisplay={getCurrentRangeDisplay}
          activeSection="refunds"
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
              {totalRefundCount} refunds in selected range | Avg refund:{" "}
              {formatCurrency(avgRefundValue)}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Refunds"
          value={formatCurrency(metrics.totalRefunds)}
          
          trend="down"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Rate"
          value={formatPercentage(metrics.refundRate)}
          
          trend="up"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Count"
          value={formatNumber(totalRefundCount)}
          
          trend="down"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Refund Value"
          value={formatCurrency(avgRefundValue)}
          
          trend="neutral"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Refund Rate Insight */}
      <ChartInsight
        type={refundTrendInsight.type}
        message={refundTrendInsight.message}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RefundChart data={refundsByProduct} />
          <ChartInsight
            type={refundByProductInsight.type}
            message={refundByProductInsight.message}
          />
        </div>

        {/* Top Refunded Products Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Top Refunded Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Refunds
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {refundsByProduct
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground">
                        {item.product}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">
                        {formatNumber(item.refunds)}
                      </td>
                      <td className="py-3 px-4 text-sm text-destructive text-right">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI ChatBot with Insights */}
      <ChatBot insights={refundInsights} section="refunds" />

      {/* AI-Powered Recommendations */}
      <AIRecommendations
        sectionType="refund"
        metrics={{
          totalRefunds: metrics.totalRefunds.toFixed(0),
          refundRate: metrics.refundRate.toFixed(1),
          refundCount: totalRefundCount,
          avgRefundValue: avgRefundValue.toFixed(2),
          topRefundedProduct: refundsByProduct.sort(
            (a, b) => b.amount - a.amount
          )[0]?.product,
          topRefundedAmount: refundsByProduct
            .sort((a, b) => b.amount - a.amount)[0]
            ?.amount?.toFixed(0),
        }}
        insights={{
          refundTrend: refundTrendInsight,
          refundByProduct: refundByProductInsight,
        }}
      />
    </div>
  );
};

export default RefundSection;
