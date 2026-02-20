// Insight Engine - Analyzes data and generates smart insights

// ============== TRAFFIC INSIGHTS ==============

// Analyze traffic timeline data
export const analyzeTimelineData = (timelineData) => {
    if (!timelineData || timelineData.length < 2) {
      return { type: 'info', message: 'Insufficient data for trend analysis.' };
    }
  
    const recentData = timelineData.slice(-7);
    const olderData = timelineData.slice(-14, -7);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return { type: 'info', message: 'Building trend analysis...' };
    }
  
    const recentAvg = recentData.reduce((sum, d) => sum + d.sessions, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + d.sessions, 0) / olderData.length;
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
  
    const recentMobile = recentData.reduce((sum, d) => sum + (d.mobile || 0), 0);
    const recentDesktop = recentData.reduce((sum, d) => sum + (d.desktop || 0), 0);
    const mobilePercent = recentMobile + recentDesktop > 0 
      ? (recentMobile / (recentMobile + recentDesktop)) * 100 
      : 0;
  
    if (Math.abs(changePercent) < 2) {
      return {
        type: 'info',
        message: `Traffic is stable with ${Math.round(recentAvg)} avg daily sessions. Mobile accounts for ${mobilePercent.toFixed(0)}% of traffic.`
      };
    }
  
    if (changePercent > 0) {
      return {
        type: 'trend-up',
        message: `Sessions increased ${changePercent.toFixed(1)}% in recent period (${Math.round(olderAvg)} → ${Math.round(recentAvg)} avg/day). Mobile traffic is ${mobilePercent.toFixed(0)}% of total.`
      };
    } else {
      return {
        type: 'trend-down',
        message: `Sessions decreased ${Math.abs(changePercent).toFixed(1)}% in recent period (${Math.round(olderAvg)} → ${Math.round(recentAvg)} avg/day). Investigate drop causes.`
      };
    }
  };
  
  // Analyze traffic source data
  export const analyzeSourceData = (sourceData) => {
    if (!sourceData || sourceData.length === 0) {
      return { type: 'info', message: 'No traffic source data available.' };
    }
  
    const totalSessions = sourceData.reduce((sum, s) => sum + s.sessions, 0);
    const topSource = sourceData.reduce((max, s) => s.sessions > max.sessions ? s : max, sourceData[0]);
    const topSourcePercent = (topSource.sessions / totalSessions) * 100;
  
    if (topSourcePercent > 70) {
      return {
        type: 'warning',
        message: `${topSource.source} dominates with ${topSourcePercent.toFixed(0)}% of traffic (${topSource.sessions.toLocaleString()} sessions). High dependency risk - diversify sources.`
      };
    }
  
    const otherSources = sourceData.filter(s => s.source !== topSource.source && s.sessions > 50);
    if (otherSources.length > 0) {
      const bestOther = otherSources[0];
      return {
        type: 'opportunity',
        message: `${topSource.source} leads with ${topSourcePercent.toFixed(0)}% of traffic. ${bestOther.source} shows potential with ${bestOther.sessions.toLocaleString()} sessions - consider scaling.`
      };
    }
  
    return {
      type: 'info',
      message: `${topSource.source} is your primary source (${topSourcePercent.toFixed(0)}%) with ${topSource.sessions.toLocaleString()} sessions. Traffic is well-distributed.`
    };
  };
  
  // Analyze device breakdown
  export const analyzeDeviceData = (deviceData) => {
    if (!deviceData || deviceData.length === 0) {
      return { type: 'info', message: 'No device data available.' };
    }
  
    const mobile = deviceData.find(d => d.device === 'mobile' || d.device === 'Mobile') || { sessions: 0 };
    const desktop = deviceData.find(d => d.device === 'desktop' || d.device === 'Desktop') || { sessions: 0 };
    const total = mobile.sessions + desktop.sessions;
  
    if (total === 0) {
      return { type: 'info', message: 'No device data to analyze.' };
    }
  
    const mobilePercent = (mobile.sessions / total) * 100;
  
    if (mobilePercent > 65) {
      return {
        type: 'opportunity',
        message: `Mobile traffic dominates at ${mobilePercent.toFixed(0)}% (${mobile.sessions.toLocaleString()} sessions). Ensure mobile experience is optimized for conversions.`
      };
    } else if (mobilePercent < 35) {
      return {
        type: 'info',
        message: `Desktop leads at ${(100 - mobilePercent).toFixed(0)}% (${desktop.sessions.toLocaleString()} sessions). Consider mobile-first strategies to capture growing mobile audience.`
      };
    } else {
      return {
        type: 'info',
        message: `Balanced traffic: ${mobilePercent.toFixed(0)}% mobile (${mobile.sessions.toLocaleString()}) vs ${(100 - mobilePercent).toFixed(0)}% desktop (${desktop.sessions.toLocaleString()}).`
      };
    }
  };
  
  // Analyze campaign performance
  export const analyzeCampaignData = (campaignData) => {
    if (!campaignData || campaignData.length === 0) {
      return { type: 'info', message: 'No campaign data available.' };
    }
  
    const totalSessions = campaignData.reduce((sum, c) => sum + c.sessions, 0);
    const topCampaign = campaignData.reduce((max, c) => c.sessions > max.sessions ? c : max, campaignData[0]);
    const topPercent = (topCampaign.sessions / totalSessions) * 100;
  
    const activeCampaigns = campaignData.filter(c => c.sessions > 10).length;
  
    if (activeCampaigns === 1) {
      return {
        type: 'warning',
        message: `Only "${topCampaign.campaign}" campaign is active with ${topCampaign.sessions.toLocaleString()} sessions. Test multiple campaigns to find winners.`
      };
    }
  
    if (topPercent > 80) {
      return {
        type: 'opportunity',
        message: `"${topCampaign.campaign}" dominates with ${topPercent.toFixed(0)}% (${topCampaign.sessions.toLocaleString()} sessions). Scale what works but test alternatives.`
      };
    }
  
    return {
      type: 'info',
      message: `${activeCampaigns} active campaigns with "${topCampaign.campaign}" leading at ${topPercent.toFixed(0)}% (${topCampaign.sessions.toLocaleString()} sessions).`
    };
  };
  
  // Analyze landing page performance
  export const analyzeLandingPages = (landingPageData, totalSessions) => {
    if (!landingPageData || landingPageData.length === 0) {
      return { type: 'info', message: 'No landing page data available.' };
    }
  
    const topPage = landingPageData[0];
    const topPercent = (topPage.sessions / totalSessions) * 100;
  
    if (topPage.url === '/home' || topPage.url === '/') {
      if (topPercent > 80) {
        return {
          type: 'opportunity',
          message: `Homepage receives ${topPercent.toFixed(0)}% of traffic (${topPage.sessions.toLocaleString()} sessions). Test deep-linking to product pages for better conversions.`
        };
      }
      return {
        type: 'info',
        message: `Homepage is primary entry at ${topPercent.toFixed(0)}% (${topPage.sessions.toLocaleString()} sessions). Traffic is well-distributed across ${landingPageData.length} pages.`
      };
    }
  
    return {
      type: 'opportunity',
      message: `"${topPage.url}" is top landing page with ${topPercent.toFixed(0)}% of traffic (${topPage.sessions.toLocaleString()} sessions). Optimize this high-value entry point.`
    };
  };
  
  // Generate overall bounce rate insight
  export const analyzeBounceRate = (bounceRate, avgPagesPerSession) => {
    if (bounceRate > 60) {
      return {
        type: 'warning',
        message: `High bounce rate of ${bounceRate.toFixed(1)}% indicates friction. Avg ${avgPagesPerSession.toFixed(1)} pages/session. Test faster load times and clearer CTAs.`
      };
    } else if (bounceRate > 45) {
      return {
        type: 'info',
        message: `Bounce rate at ${bounceRate.toFixed(1)}% is within normal range. Users view avg ${avgPagesPerSession.toFixed(1)} pages per session.`
      };
    } else {
      return {
        type: 'trend-up',
        message: `Strong engagement: ${bounceRate.toFixed(1)}% bounce rate and ${avgPagesPerSession.toFixed(1)} avg pages/session. Visitors are exploring your site.`
      };
    }
  };
  
  // ============== CONVERSION INSIGHTS ==============
  
  // Analyze conversion rate trends
  export const analyzeConversionTimeline = (timelineData) => {
    if (!timelineData || timelineData.length < 2) {
      return { type: 'info', message: 'Insufficient data for conversion trend analysis.' };
    }
  
    const recentData = timelineData.slice(-7);
    const olderData = timelineData.slice(-14, -7);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return { type: 'info', message: 'Building conversion trend analysis...' };
    }
  
    const recentAvgRate = recentData.reduce((sum, d) => sum + d.conversionRate, 0) / recentData.length;
    const olderAvgRate = olderData.reduce((sum, d) => sum + d.conversionRate, 0) / olderData.length;
    const recentOrders = recentData.reduce((sum, d) => sum + d.conversions, 0);
    
    const rateChange = recentAvgRate - olderAvgRate;
  
    if (Math.abs(rateChange) < 0.2) {
      return {
        type: 'info',
        message: `Conversion rate stable at ${recentAvgRate.toFixed(2)}% with ${recentOrders} orders in recent period.`
      };
    }
  
    if (rateChange > 0) {
      return {
        type: 'trend-up',
        message: `Conversion rate improved by ${rateChange.toFixed(2)}% (${olderAvgRate.toFixed(2)}% → ${recentAvgRate.toFixed(2)}%). Recent optimizations are working!`
      };
    } else {
      return {
        type: 'trend-down',
        message: `Conversion rate dropped ${Math.abs(rateChange).toFixed(2)}% (${olderAvgRate.toFixed(2)}% → ${recentAvgRate.toFixed(2)}%). Investigate friction points immediately.`
      };
    }
  };
  
  // Analyze conversion funnel
  export const analyzeConversionFunnel = (funnelData) => {
    if (!funnelData || funnelData.length < 2) {
      return { type: 'info', message: 'Insufficient funnel data.' };
    }
  
    const sessions = funnelData.find(f => f.stage === 'Sessions')?.count || 0;
    const engaged = funnelData.find(f => f.stage.includes('Engaged'))?.count || 0;
    const orders = funnelData.find(f => f.stage === 'Orders')?.count || 0;
  
    const engagementRate = sessions > 0 ? (engaged / sessions) * 100 : 0;
    const conversionRate = sessions > 0 ? (orders / sessions) * 100 : 0;
  
    if (engagementRate < 50) {
      return {
        type: 'warning',
        message: `Only ${engagementRate.toFixed(0)}% of visitors engage beyond landing page. High bounce - test page speed, relevance, and CTAs.`
      };
    }
  
    if (conversionRate < 2) {
      return {
        type: 'warning',
        message: `${conversionRate.toFixed(2)}% conversion rate is below e-commerce average (2-3%). Focus on checkout optimization.`
      };
    } else if (conversionRate > 5) {
      return {
        type: 'trend-up',
        message: `Strong ${conversionRate.toFixed(2)}% conversion rate! ${engagementRate.toFixed(0)}% engagement shows effective funnel.`
      };
    } else {
      return {
        type: 'info',
        message: `${conversionRate.toFixed(2)}% conversion rate with ${engagementRate.toFixed(0)}% engagement. Room for optimization in checkout flow.`
      };
    }
  };
  
  // Analyze source conversion performance
  export const analyzeSourceConversion = (sourceData) => {
    if (!sourceData || sourceData.length === 0) {
      return { type: 'info', message: 'No source conversion data available.' };
    }
  
    const sorted = [...sourceData].sort((a, b) => b.conversionRate - a.conversionRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
  
    if (best.conversionRate > worst.conversionRate * 2) {
      return {
        type: 'opportunity',
        message: `${best.source} converts ${best.conversionRate.toFixed(1)}% vs ${worst.source} at ${worst.conversionRate.toFixed(1)}%. Reallocate budget to high performers.`
      };
    }
  
    const avgConversion = sourceData.reduce((sum, s) => sum + s.conversionRate, 0) / sourceData.length;
  
    return {
      type: 'info',
      message: `${best.source} leads conversion at ${best.conversionRate.toFixed(1)}% (avg: ${avgConversion.toFixed(1)}%). Sources perform similarly.`
    };
  };
  
  // Analyze device conversion
  export const analyzeDeviceConversion = (deviceData) => {
    if (!deviceData || deviceData.length === 0) {
      return { type: 'info', message: 'No device conversion data available.' };
    }
  
    const mobile = deviceData.find(d => d.device === 'mobile') || { conversionRate: 0, sessions: 0 };
    const desktop = deviceData.find(d => d.device === 'desktop') || { conversionRate: 0, sessions: 0 };
  
    const gap = Math.abs(mobile.conversionRate - desktop.conversionRate);
  
    if (gap > 2) {
      if (desktop.conversionRate > mobile.conversionRate) {
        return {
          type: 'warning',
          message: `Desktop converts ${desktop.conversionRate.toFixed(1)}% vs mobile ${mobile.conversionRate.toFixed(1)}% (${gap.toFixed(1)}% gap). Critical mobile UX issue.`
        };
      } else {
        return {
          type: 'trend-up',
          message: `Mobile converts ${mobile.conversionRate.toFixed(1)}% vs desktop ${desktop.conversionRate.toFixed(1)}%. Excellent mobile optimization!`
        };
      }
    }
  
    return {
      type: 'info',
      message: `Balanced conversion: mobile ${mobile.conversionRate.toFixed(1)}% vs desktop ${desktop.conversionRate.toFixed(1)}% (${gap.toFixed(1)}% difference).`
    };
  };
  
  // Analyze new vs returning conversion
  export const analyzeVisitorTypeConversion = (newRate, returningRate, newSessions, returningSessions) => {
    const gap = Math.abs(returningRate - newRate);
  
    if (returningRate > newRate * 2) {
      return {
        type: 'opportunity',
        message: `Returning visitors convert ${returningRate.toFixed(1)}% vs new ${newRate.toFixed(1)}%. Strong loyalty - focus on acquisition quality.`
      };
    }
  
    if (newRate > returningRate) {
      return {
        type: 'warning',
        message: `New visitors convert ${newRate.toFixed(1)}% vs returning ${returningRate.toFixed(1)}%. Retention issue - improve post-purchase experience.`
      };
    }
  
    return {
      type: 'info',
      message: `New visitors: ${newRate.toFixed(1)}% vs Returning: ${returningRate.toFixed(1)}%. Both segments performing well.`
    };
  };
  
  // Analyze product performance
  export const analyzeProductPerformance = (productData) => {
    if (!productData || productData.length === 0) {
      return { type: 'info', message: 'No product performance data available.' };
    }
  
    const sorted = [...productData].sort((a, b) => b.revenue - a.revenue);
    const topProduct = sorted[0];
    const totalRevenue = productData.reduce((sum, p) => sum + p.revenue, 0);
    const topPercent = (topProduct.revenue / totalRevenue) * 100;
  
    if (topPercent > 70) {
      return {
        type: 'warning',
        message: `"${topProduct.productName}" accounts for ${topPercent.toFixed(0)}% of revenue (${topProduct.orders} orders). Product concentration risk.`
      };
    } else if (topPercent > 40) {
      return {
        type: 'opportunity',
        message: `"${topProduct.productName}" is your hero product (${topPercent.toFixed(0)}% revenue, ${topProduct.orders} orders). Cross-sell opportunities.`
      };
    } else {
      return {
        type: 'info',
        message: `Diversified revenue: "${topProduct.productName}" leads at ${topPercent.toFixed(0)}% with ${topProduct.orders} orders across ${productData.length} products.`
      };
    }
  };
  
  // Analyze AOV and revenue per session
  export const analyzeRevenueMetrics = (aov, revenuePerSession, totalOrders) => {
    if (aov < 30) {
      return {
        type: 'warning',
        message: `Low AOV of $${aov.toFixed(2)}. Test bundling, upsells, and free shipping thresholds to increase order value.`
      };
    } else if (aov > 100) {
      return {
        type: 'trend-up',
        message: `Strong AOV of $${aov.toFixed(2)} across ${totalOrders} orders. Consider loyalty program for high-value customers.`
      };
    } else {
      return {
        type: 'info',
        message: `Healthy AOV of $${aov.toFixed(2)} with $${revenuePerSession.toFixed(2)} revenue per session. Test cart optimization.`
      };
    }
  };
  
  // ============== PRODUCT INSIGHTS ==============
  
  // Analyze product distribution
  export const analyzeProductDistribution = (productData, dataKey = 'revenue') => {
    if (!productData || productData.length === 0) {
      return { type: 'info', message: 'No product data available.' };
    }
    
    const total = productData.reduce((sum, p) => sum + (p[dataKey] || 0), 0);
    if (total === 0) {
      return { type: 'info', message: 'No product activity to analyze.' };
    }
    
    const sorted = [...productData].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
    const topProduct = sorted[0];
    const topPercent = (topProduct[dataKey] / total) * 100;
    
    if (topPercent > 70) {
      return {
        type: 'warning',
        message: `${topProduct.product || topProduct.product_name} dominates with ${topPercent.toFixed(0)}% of ${dataKey}. High concentration risk - diversify product mix.`
      };
    } else if (topPercent > 40) {
      return {
        type: 'opportunity',
        message: `${topProduct.product || topProduct.product_name} leads with ${topPercent.toFixed(0)}% of ${dataKey}. Strong performer - leverage for cross-selling.`
      };
    } else {
      return {
        type: 'info',
        message: `Well-distributed ${dataKey}: ${topProduct.product || topProduct.product_name} leads at ${topPercent.toFixed(0)}% across ${productData.length} products.`
      };
    }
  };
  
  // Analyze product refund rates
  export const analyzeProductRefundRate = (productData) => {
    if (!productData || productData.length === 0) {
      return { type: 'info', message: 'No product refund data available.' };
    }
    
    const productsWithRefunds = productData.filter(p => p.refundRate > 0);
    if (productsWithRefunds.length === 0) {
      return {
        type: 'trend-up',
        message: 'Excellent: No refunds across all products. Maintain quality standards.'
      };
    }
    
    const sorted = [...productsWithRefunds].sort((a, b) => b.refundRate - a.refundRate);
    const worstProduct = sorted[0];
    const avgRefundRate = productsWithRefunds.reduce((sum, p) => sum + p.refundRate, 0) / productsWithRefunds.length;
    
    if (worstProduct.refundRate > 10) {
      return {
        type: 'warning',
        message: `"${worstProduct.product_name}" has ${worstProduct.refundRate.toFixed(1)}% refund rate (${worstProduct.refunds} refunds). Investigate quality or description issues.`
      };
    } else if (avgRefundRate > 5) {
      return {
        type: 'warning',
        message: `Average refund rate of ${avgRefundRate.toFixed(1)}% across products. Review product quality and customer expectations.`
      };
    } else {
      return {
        type: 'info',
        message: `Healthy refund rates: Average ${avgRefundRate.toFixed(1)}% across products. "${worstProduct.product_name}" highest at ${worstProduct.refundRate.toFixed(1)}%.`
      };
    }
  };
  
  // ============== REFUND INSIGHTS ==============
  
  // Analyze refund trends
  export const analyzeRefundTrends = (refundRate, avgRefundValue, totalRefunds) => {
    if (refundRate > 10) {
      return {
        type: 'warning',
        message: `High refund rate of ${refundRate.toFixed(1)}% (${totalRefunds} refunds, avg $${avgRefundValue.toFixed(2)}). Critical issue - review product quality and customer service.`
      };
    } else if (refundRate > 5) {
      return {
        type: 'warning',
        message: `Refund rate of ${refundRate.toFixed(1)}% is above industry average (2-3%). Investigate root causes and improve product descriptions.`
      };
    } else if (refundRate < 2) {
      return {
        type: 'trend-up',
        message: `Excellent refund rate of ${refundRate.toFixed(1)}% (${totalRefunds} refunds). Strong product quality and customer satisfaction.`
      };
    } else {
      return {
        type: 'info',
        message: `Refund rate of ${refundRate.toFixed(1)}% is within normal range (${totalRefunds} refunds, avg $${avgRefundValue.toFixed(2)}). Monitor trends.`
      };
    }
  };
  
  // Analyze refunds by product
  export const analyzeRefundByProduct = (refundsByProduct) => {
    if (!refundsByProduct || refundsByProduct.length === 0) {
      return { type: 'info', message: 'No refund data by product available.' };
    }
    
    const sorted = [...refundsByProduct].sort((a, b) => b.amount - a.amount);
    const topRefunded = sorted[0];
    const totalRefunds = refundsByProduct.reduce((sum, r) => sum + r.amount, 0);
    const topPercent = (topRefunded.amount / totalRefunds) * 100;
    
    if (topPercent > 60) {
      return {
        type: 'warning',
        message: `"${topRefunded.product}" accounts for ${topPercent.toFixed(0)}% of refund value ($${topRefunded.amount.toFixed(0)}). Critical product issue requiring immediate attention.`
      };
    } else if (topPercent > 40) {
      return {
        type: 'warning',
        message: `"${topRefunded.product}" leads refunds at ${topPercent.toFixed(0)}% ($${topRefunded.amount.toFixed(0)}). Review product quality and customer feedback.`
      };
    } else {
      return {
        type: 'info',
        message: `Refunds distributed across products. "${topRefunded.product}" highest at ${topPercent.toFixed(0)}% ($${topRefunded.amount.toFixed(0)}).`
      };
    }
  };
  
  // ============== REVENUE INSIGHTS ==============
  
  // Analyze revenue trends over time
  export const analyzeRevenueTrends = (revenueByMonth) => {
    if (!revenueByMonth || revenueByMonth.length < 2) {
      return { type: 'info', message: 'Insufficient data for revenue trend analysis.' };
    }
    
    const recentData = revenueByMonth.slice(-3);
    const olderData = revenueByMonth.slice(-6, -3);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return { type: 'info', message: 'Building revenue trend analysis...' };
    }
    
    const recentAvg = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + (d.revenue || 0), 0) / olderData.length;
    const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    
    if (Math.abs(changePercent) < 5) {
      return {
        type: 'info',
        message: `Revenue stable at $${recentAvg.toFixed(0)} avg/month. Consistent performance.`
      };
    }
    
    if (changePercent > 0) {
      return {
        type: 'trend-up',
        message: `Revenue increased ${changePercent.toFixed(1)}% in recent period ($${olderAvg.toFixed(0)} → $${recentAvg.toFixed(0)} avg/month). Strong growth!`
      };
    } else {
      return {
        type: 'trend-down',
        message: `Revenue decreased ${Math.abs(changePercent).toFixed(1)}% in recent period ($${olderAvg.toFixed(0)} → $${recentAvg.toFixed(0)} avg/month). Investigate causes.`
      };
    }
  };
  
  // Analyze order trends
  export const analyzeOrderTrends = (revenueByMonth) => {
    if (!revenueByMonth || revenueByMonth.length < 2) {
      return { type: 'info', message: 'Insufficient data for order trend analysis.' };
    }
    
    const recentData = revenueByMonth.slice(-3);
    const olderData = revenueByMonth.slice(-6, -3);
    
    if (recentData.length === 0 || olderData.length === 0) {
      return { type: 'info', message: 'Building order trend analysis...' };
    }
    
    const recentAvg = recentData.reduce((sum, d) => sum + (d.orders || 0), 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + (d.orders || 0), 0) / olderData.length;
    const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    
    if (Math.abs(changePercent) < 5) {
      return {
        type: 'info',
        message: `Order volume stable at ${Math.round(recentAvg)} avg orders/month.`
      };
    }
    
    if (changePercent > 0) {
      return {
        type: 'trend-up',
        message: `Orders increased ${changePercent.toFixed(1)}% (${Math.round(olderAvg)} → ${Math.round(recentAvg)} avg/month). Growing demand!`
      };
    } else {
      return {
        type: 'trend-down',
        message: `Orders decreased ${Math.abs(changePercent).toFixed(1)}% (${Math.round(olderAvg)} → ${Math.round(recentAvg)} avg/month). Review marketing and conversion.`
      };
    }
  };
  
  // Analyze revenue by product distribution
  export const analyzeRevenueByProduct = (ordersByProduct) => {
    if (!ordersByProduct || ordersByProduct.length === 0) {
      return { type: 'info', message: 'No product revenue data available.' };
    }
    
    const totalRevenue = ordersByProduct.reduce((sum, p) => sum + (p.revenue || 0), 0);
    if (totalRevenue === 0) {
      return { type: 'info', message: 'No revenue data to analyze.' };
    }
    
    const sorted = [...ordersByProduct].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    const topProduct = sorted[0];
    const topPercent = (topProduct.revenue / totalRevenue) * 100;
    
    if (topPercent > 70) {
      return {
        type: 'warning',
        message: `"${topProduct.product}" accounts for ${topPercent.toFixed(0)}% of revenue ($${topProduct.revenue.toFixed(0)}). High concentration - diversify product portfolio.`
      };
    } else if (topPercent > 40) {
      return {
        type: 'opportunity',
        message: `"${topProduct.product}" is hero product with ${topPercent.toFixed(0)}% revenue ($${topProduct.revenue.toFixed(0)}). Leverage for cross-selling and bundles.`
      };
    } else {
      return {
        type: 'info',
        message: `Balanced revenue: "${topProduct.product}" leads at ${topPercent.toFixed(0)}% ($${topProduct.revenue.toFixed(0)}) across ${ordersByProduct.length} products.`
      };
    }
  };