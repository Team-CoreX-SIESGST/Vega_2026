// utils/insightGenerator.js

export const generateConversionInsights = (data) => {
  const {
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
    newVisitors,
    returningVisitors,
  } = data;

  const insights = [];

  // 1. Overall Conversion Health Check
  if (overallConversionRate < 1.5) {
    insights.push({
      type: "critical",
      title: "Critical: Conversion Rate Crisis",
      message: `At ${overallConversionRate.toFixed(
        2
      )}%, your conversion rate is dangerously low. Industry average for e-commerce is 2-3%. You're losing significant revenue potential.`,
      recommendation:
        "Conduct a full funnel audit, implement exit-intent popups, add urgency elements, and simplify checkout to 1-2 steps.",
      impact:
        "High - Every 0.1% increase in conversion rate could add thousands in revenue.",
      timeframe: "Immediate action required",
    });
  } else if (overallConversionRate >= 1.5 && overallConversionRate < 2.5) {
    insights.push({
      type: "warning",
      title: "Below Average Conversion Performance",
      message: `Your ${overallConversionRate.toFixed(
        2
      )}% conversion rate is below the 2-3% e-commerce benchmark. There's substantial room for improvement.`,
      recommendation:
        "Focus on improving product page quality scores, add video demonstrations, implement live chat support, and optimize mobile experience.",
      impact:
        "Medium - Can increase revenue by 15-25% with proper optimization.",
      timeframe: "1-2 months",
    });
  } else if (overallConversionRate >= 2.5 && overallConversionRate < 4) {
    insights.push({
      type: "info",
      title: "Solid Conversion Performance",
      message: `A ${overallConversionRate.toFixed(
        2
      )}% conversion rate shows good optimization. You're performing at or above industry average.`,
      recommendation:
        "Shift focus to increasing AOV through upselling, bundles, and subscription models. Implement abandoned cart recovery campaigns.",
      impact:
        "Moderate - Further optimization can yield 10-15% revenue growth.",
      timeframe: "Next quarter",
    });
  } else {
    insights.push({
      type: "excellent",
      title: "Exceptional Conversion Performance",
      message: `Congratulations! Your ${overallConversionRate.toFixed(
        2
      )}% conversion rate is in the top 20% of e-commerce stores.`,
      recommendation:
        "Scale successful strategies, invest more in top-performing channels, and consider expanding to new markets or product lines.",
      impact: "High - Excellent position for scaling business.",
      timeframe: "Ongoing maintenance",
    });
  }

  // 2. AOV Analysis with Detailed Recommendations
  const aovBenchmarks = {
    "Very Low": [0, 49],
    Low: [50, 74],
    Average: [75, 124],
    Good: [125, 199],
    Excellent: [200, Infinity],
  };

  for (const [category, [min, max]] of Object.entries(aovBenchmarks)) {
    if (aov >= min && aov <= max) {
      insights.push({
        type:
          category === "Excellent" || category === "Good"
            ? "success"
            : "warning",
        title: `AOV Analysis: ${category} Performance`,
        message: `Your current AOV is $${aov.toFixed(
          2
        )}, which falls in the "${category}" range compared to industry standards.`,
        recommendation:
          category === "Very Low" || category === "Low"
            ? "Implement mandatory add-ons, create high-value bundles (3+ products), set free shipping threshold at $100+, and introduce premium product lines."
            : category === "Average"
            ? "Optimize product recommendations, implement 'Customers also bought' sections, offer volume discounts, and test limited-time offers."
            : "Consider VIP programs, subscription models with discounts, and exclusive access to new products for high-value customers.",
        impact: `Medium - Potential to increase revenue by ${
          category === "Very Low"
            ? "40-60%"
            : category === "Low"
            ? "25-40%"
            : "10-20%"
        } through AOV optimization.`,
        timeframe: "6-8 weeks",
      });
      break;
    }
  }

  // 3. New vs Returning Visitor Deep Analysis
  const totalVisitors = newVisitors + returningVisitors;
  const returningPercentage = (returningVisitors / totalVisitors) * 100;

  if (returningPercentage < 15) {
    insights.push({
      type: "warning",
      title: "Low Customer Retention Rate",
      message: `Only ${returningPercentage.toFixed(
        1
      )}% of your visitors are returning customers. High-performing stores typically have 25-35% returning visitors.`,
      recommendation:
        "Implement email marketing automation for post-purchase sequences, create a loyalty program, send personalized re-engagement campaigns, and offer exclusive content to past customers.",
      impact: "High - Increasing retention by 5% can boost profits by 25-95%.",
      timeframe: "2-3 months",
    });
  } else if (returningPercentage >= 15 && returningPercentage < 25) {
    insights.push({
      type: "info",
      title: "Average Retention Performance",
      message: `${returningPercentage.toFixed(
        1
      )}% returning visitors indicates moderate customer loyalty. There's significant opportunity for improvement.`,
      recommendation:
        "Launch a customer referral program, create a members-only area, implement win-back campaigns for inactive customers, and gather feedback through post-purchase surveys.",
      impact:
        "Medium - Can increase lifetime value by 30-50% with proper retention strategies.",
      timeframe: "Next quarter",
    });
  }

  if (returningConversionRate > newConversionRate * 1.8) {
    insights.push({
      type: "opportunity",
      title: "New Visitor Conversion Gap Identified",
      message: `Returning visitors convert ${(
        (returningConversionRate / newConversionRate) *
        100
      ).toFixed(
        0
      )}% better than new visitors (${returningConversionRate.toFixed(
        2
      )}% vs ${newConversionRate.toFixed(2)}%).`,
      recommendation:
        "Create dedicated onboarding flows for new visitors, implement progressive profiling, offer first-time buyer discounts, and improve educational content for new users.",
      impact:
        "High - Closing this gap could increase overall conversion rate by 20-40%.",
      timeframe: "Immediate",
    });
  }

  // 4. Device Performance Analysis
  const desktopData = deviceData.find((d) => d.device === "desktop") || {
    conversionRate: 0,
    sessions: 0,
    revenue: 0,
  };
  const mobileData = deviceData.find((d) => d.device === "mobile") || {
    conversionRate: 0,
    sessions: 0,
    revenue: 0,
  };
  const desktopSessions = desktopData.sessions || 0;
  const mobileSessions = mobileData.sessions || 0;
  const totalDeviceSessions = desktopSessions + mobileSessions;
  const mobilePercentage =
    totalDeviceSessions > 0 ? (mobileSessions / totalDeviceSessions) * 100 : 0;

  if (
    mobilePercentage > 60 &&
    mobileData.conversionRate < desktopData.conversionRate * 0.6
  ) {
    insights.push({
      type: "critical",
      title: "Mobile Experience Crisis",
      message: `${mobilePercentage.toFixed(
        0
      )}% of traffic comes from mobile, but conversion is ${(
        (1 - mobileData.conversionRate / desktopData.conversionRate) *
        100
      ).toFixed(0)}% lower than desktop.`,
      recommendation:
        "Conduct mobile-specific usability testing, implement accelerated mobile pages (AMP), optimize images for mobile, simplify forms for touch, and ensure one-click checkout on mobile.",
      impact:
        "Extreme - Fixing mobile conversion could increase total revenue by 25-40%.",
      timeframe: "Immediate priority",
    });
  } else if (
    mobilePercentage > 40 &&
    mobileData.conversionRate < desktopData.conversionRate * 0.8
  ) {
    insights.push({
      type: "warning",
      title: "Mobile Optimization Opportunity",
      message: `Mobile represents ${mobilePercentage.toFixed(
        0
      )}% of traffic but underperforms desktop by ${(
        (1 - mobileData.conversionRate / desktopData.conversionRate) *
        100
      ).toFixed(0)}%.`,
      recommendation:
        "Optimize mobile load times (target under 3 seconds), implement thumb-friendly navigation, ensure all forms are mobile-responsive, and test mobile-specific CTAs.",
      impact: "High - Can increase mobile conversions by 30-50%.",
      timeframe: "4-6 weeks",
    });
  }

  // 5. Source Performance Analysis
  if (sourceData.length >= 3) {
    const topSource = sourceData.sort(
      (a, b) => b.conversionRate - a.conversionRate
    )[0];
    const worstSource = sourceData.sort(
      (a, b) => a.conversionRate - b.conversionRate
    )[0];
    const topSourceRevenue = sourceData.sort(
      (a, b) => b.revenue - a.revenue
    )[0];

    // Best converting source insight
    insights.push({
      type: "success",
      title: "Top Performing Channel",
      message: `${
        topSource.source
      } delivers the highest conversion rate at ${topSource.conversionRate.toFixed(
        2
      )}%, generating $${formatNumber(topSource.revenue)} in revenue.`,
      recommendation: `Increase budget allocation to ${topSource.source} by 20-30%, A/B test ad creatives specifically for this channel, and analyze audience characteristics to replicate success elsewhere.`,
      impact:
        "Medium - Further optimization could yield 15-25% more conversions.",
      timeframe: "Next month",
    });

    // Worst converting source insight
    if (worstSource.conversionRate < topSource.conversionRate * 0.3) {
      insights.push({
        type: "alert",
        title: "Underperforming Channel",
        message: `${
          worstSource.source
        } converts at only ${worstSource.conversionRate.toFixed(2)}%, ${(
          topSource.conversionRate / worstSource.conversionRate -
          1
        ).toFixed(0)}x lower than your best channel.`,
        recommendation: `Consider pausing ${worstSource.source} campaigns temporarily, conduct audience analysis to identify mismatches, or test completely new creative approaches before increasing spend.`,
        impact:
          "Low-Medium - Reallocating budget could improve overall efficiency.",
        timeframe: "1-2 weeks to test",
      });
    }

    // Revenue concentration insight
    const sourceRevenueTotal = sourceData.reduce(
      (sum, s) => sum + s.revenue,
      0
    );
    const topSourceRevenuePercentage =
      (topSourceRevenue.revenue / sourceRevenueTotal) * 100;

    if (topSourceRevenuePercentage > 70) {
      insights.push({
        type: "warning",
        title: "High Channel Dependency Risk",
        message: `${
          topSourceRevenue.source
        } generates ${topSourceRevenuePercentage.toFixed(
          0
        )}% of your total revenue, creating significant business risk.`,
        recommendation:
          "Diversify channel mix, invest in building organic/owned channels (email, SEO), test 2-3 new acquisition channels with 10-15% of budget each.",
        impact: "High - Reduces business risk significantly.",
        timeframe: "3-6 months",
      });
    }
  }

  // 6. Funnel Analysis with Stage-by-Stage Optimization
  if (funnelData.length >= 3) {
    const sessionToEngagedRate = funnelData[1].rate; // Engaged rate
    const engagedToOrderRate =
      (funnelData[2].count / funnelData[1].count) * 100; // Engagement to order

    if (sessionToEngagedRate < 40) {
      insights.push({
        type: "warning",
        title: "Low Engagement Rate",
        message: `Only ${sessionToEngagedRate.toFixed(
          1
        )}% of sessions view more than one page, indicating poor initial engagement.`,
        recommendation:
          "Improve homepage value proposition, implement content recommendations on landing pages, use interactive elements (quizzes, calculators), and optimize page load speed.",
        impact:
          "High - Improving this rate by 10% could increase orders by 15-20%.",
        timeframe: "4-8 weeks",
      });
    }

    if (engagedToOrderRate < 15) {
      insights.push({
        type: "critical",
        title: "Engagement-to-Order Conversion Crisis",
        message: `Only ${engagedToOrderRate.toFixed(
          1
        )}% of engaged visitors complete a purchase, indicating major friction points in the conversion process.`,
        recommendation:
          "Implement heatmap analysis, conduct user testing on checkout flow, simplify form fields, add trust badges and security signals, and test guest checkout options.",
        impact: "Extreme - Fixing this could double or triple conversion rate.",
        timeframe: "Immediate investigation required",
      });
    }
  }

  // 7. Profit Margin Health Check
  const marginHealth =
    profitMargin < 10
      ? "Critical"
      : profitMargin < 20
      ? "Concerning"
      : profitMargin < 30
      ? "Average"
      : profitMargin < 40
      ? "Good"
      : "Excellent";

  if (marginHealth === "Critical" || marginHealth === "Concerning") {
    insights.push({
      type: "alert",
      title: `${marginHealth} Profit Margin`,
      message: `Your profit margin of ${profitMargin.toFixed(
        2
      )}% is ${marginHealth.toLowerCase()} and may not be sustainable long-term. Industry average for e-commerce is 35-45%.`,
      recommendation:
        "Conduct a cost analysis, negotiate with suppliers, consider price optimization (5-10% increase), focus on higher-margin products, and reduce operational inefficiencies.",
      impact: "High - Improving margin by 5% doubles profitability.",
      timeframe: "Quarterly review",
    });
  }

  // 8. Product Portfolio Analysis
  if (productData.length >= 2) {
    const sortedByRevenue = [...productData].sort(
      (a, b) => b.revenue - a.revenue
    );
    const topProduct = sortedByRevenue[0];
    const bottomProduct = sortedByRevenue[sortedByRevenue.length - 1];
    const totalProductRevenue = sortedByRevenue.reduce(
      (sum, p) => sum + p.revenue,
      0
    );
    const topProductShare = (topProduct.revenue / totalProductRevenue) * 100;

    // Revenue concentration insight
    if (topProductShare > 50) {
      insights.push({
        type: "warning",
        title: "Product Concentration Risk",
        message: `${
          topProduct.productName
        } accounts for ${topProductShare.toFixed(
          1
        )}% of total revenue, creating significant business vulnerability.`,
        recommendation:
          "Develop product line extensions, create complementary products, invest in marketing for secondary products, and consider strategic partnerships or acquisitions.",
        impact: "High - Diversification reduces business risk by 60-80%.",
        timeframe: "6-12 months",
      });
    }

    // Bottom performer insight
    const bottomProductMargin = bottomProduct.profitMargin;
    if (
      bottomProductMargin < 0 ||
      (bottomProductMargin < 10 && bottomProduct.revenue > 1000)
    ) {
      insights.push({
        type: "info",
        title: "Underperforming Product Identified",
        message: `${bottomProduct.productName} has ${
          bottomProductMargin < 0 ? "negative" : "low"
        } margins at ${bottomProductMargin.toFixed(
          1
        )}% and generates only $${formatNumber(
          bottomProduct.revenue
        )} in revenue.`,
        recommendation:
          "Consider discontinuing this product, renegotiate supplier costs, reposition as loss leader, or bundle with higher-margin products.",
        impact: "Medium - Can improve overall margin by 2-5%.",
        timeframe: "Next inventory cycle",
      });
    }
  }

  // 9. Revenue Per Session Analysis
  const rpsBenchmarks = {
    Low: [0, 1.99],
    Average: [2, 4.99],
    Good: [5, 9.99],
    Excellent: [10, Infinity],
  };

  for (const [category, [min, max]] of Object.entries(rpsBenchmarks)) {
    if (revenuePerSession >= min && revenuePerSession <= max) {
      insights.push({
        type:
          category === "Excellent" || category === "Good"
            ? "success"
            : "warning",
        title: `Revenue Per Session: ${category}`,
        message: `Your RPS of $${revenuePerSession.toFixed(
          2
        )} is considered "${category}" in e-commerce. This measures how effectively you monetize each visitor.`,
        recommendation:
          category === "Low" || category === "Average"
            ? "Implement personalized product recommendations, improve cross-selling algorithms, create urgency with countdown timers, and optimize product page layouts for conversion."
            : "Maximize with dynamic pricing algorithms, implement AI-powered recommendations, create scarcity with limited inventory displays, and optimize for impulse purchases.",
        impact: `High - Improving RPS by $1 can increase monthly revenue by $${Math.round(
          totalRevenue / revenuePerSession
        )}.`,
        timeframe: "Ongoing optimization",
      });
      break;
    }
  }

  // 10. Campaign Performance Analysis
  if (campaignData.length >= 2) {
    const performingCampaigns = campaignData.filter(
      (c) => c.conversions > 0 && c.conversionRate > 1
    );
    const underperformingCampaigns = campaignData.filter(
      (c) => c.conversions === 0 || c.conversionRate < 0.5
    );

    if (performingCampaigns.length > 0) {
      const bestCampaign = performingCampaigns.sort(
        (a, b) => b.conversionRate - a.conversionRate
      )[0];
      insights.push({
        type: "success",
        title: "High-Performing Campaign Found",
        message: `Campaign "${
          bestCampaign.campaign
        }" achieves ${bestCampaign.conversionRate.toFixed(
          2
        )}% conversion with ${bestCampaign.conversions} orders.`,
        recommendation:
          "Analyze audience targeting, ad creatives, and messaging of this campaign. Scale budget by 50-100%, apply learnings to other campaigns, and create lookalike audiences.",
        impact:
          "Medium - Scaling successful campaigns can increase conversions by 30-50%.",
        timeframe: "Immediate",
      });
    }

    if (underperformingCampaigns.length > performingCampaigns.length * 2) {
      insights.push({
        type: "warning",
        title: "Campaign Performance Issues",
        message: `${underperformingCampaigns.length} of ${campaignData.length} campaigns are underperforming (<0.5% conversion or no conversions).`,
        recommendation:
          "Pause underperforming campaigns, conduct A/B testing on audiences and creatives, improve campaign-to-landing page consistency, and implement better tracking.",
        impact: "High - Can reduce wasted ad spend by 40-60%.",
        timeframe: "2-4 weeks",
      });
    }
  }

  // 11. Seasonal and Trend Analysis
  if (timelineData.length >= 4) {
    const recentPeriods = timelineData.slice(-4);
    const conversionTrend = recentPeriods.map((p) => p.conversionRate);
    const avgRecent =
      conversionTrend.reduce((a, b) => a + b, 0) / conversionTrend.length;
    const earliestRecent = conversionTrend[0];
    const latestRecent = conversionTrend[conversionTrend.length - 1];
    const trendPercentage =
      ((latestRecent - earliestRecent) / earliestRecent) * 100;

    if (trendPercentage < -15) {
      insights.push({
        type: "alert",
        title: "Declining Conversion Trend Detected",
        message: `Conversion rate has declined by ${Math.abs(
          trendPercentage
        ).toFixed(1)}% over the last ${
          recentPeriods.length
        } periods. Current rate: ${latestRecent.toFixed(2)}%.`,
        recommendation:
          "Investigate recent website changes, check for technical issues, review competitor activity, analyze pricing strategy, and conduct customer surveys.",
        impact: "Critical - Could indicate serious business issues.",
        timeframe: "Immediate investigation",
      });
    } else if (trendPercentage > 20) {
      insights.push({
        type: "excellent",
        title: "Strong Positive Momentum",
        message: `Conversion rate has increased by ${trendPercentage.toFixed(
          1
        )}% over recent periods, showing excellent growth momentum.`,
        recommendation:
          "Document successful changes, double down on what's working, allocate more resources to growth initiatives, and consider expanding to new markets.",
        impact:
          "High - Capitalize on positive momentum for accelerated growth.",
        timeframe: "Continue current strategy",
      });
    }

    // Detect seasonality
    if (timelineData.length >= 12) {
      const monthlyData = timelineData.reduce((acc, day) => {
        const month = day.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { totalSessions: 0, totalConversions: 0 };
        acc[month].totalSessions += day.sessions;
        acc[month].totalConversions += day.conversions;
        return acc;
      }, {});

      const monthlyRates = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        rate: (data.totalConversions / data.totalSessions) * 100,
      }));

      const variance =
        Math.max(...monthlyRates.map((m) => m.rate)) -
        Math.min(...monthlyRates.map((m) => m.rate));

      if (variance > 2) {
        const bestMonth = monthlyRates.sort((a, b) => b.rate - a.rate)[0];
        const worstMonth = monthlyRates.sort((a, b) => a.rate - b.rate)[0];
        insights.push({
          type: "info",
          title: "Seasonal Patterns Detected",
          message: `Conversion rates vary by ${variance.toFixed(
            1
          )} percentage points seasonally. Best month: ${
            bestMonth.month
          } (${bestMonth.rate.toFixed(2)}%), Worst: ${
            worstMonth.month
          } (${worstMonth.rate.toFixed(2)}%).`,
          recommendation:
            "Plan inventory and marketing around seasonal peaks, create seasonal promotions for slower periods, adjust staffing and budget allocation based on seasonality.",
          impact:
            "Medium - Optimizing for seasonality can increase annual revenue by 10-20%.",
          timeframe: "Annual planning",
        });
      }
    }
  }

  // 12. Landing Page Performance Deep Dive
  if (landingPageData.length >= 3) {
    const highConvertingPages = landingPageData.filter(
      (p) => p.conversionRate > overallConversionRate * 1.5 && p.sessions >= 50
    );
    const lowConvertingPages = landingPageData.filter(
      (p) => p.conversionRate < overallConversionRate * 0.5 && p.sessions >= 50
    );

    if (highConvertingPages.length > 0) {
      const bestPage = highConvertingPages.sort(
        (a, b) => b.conversionRate - a.conversionRate
      )[0];
      insights.push({
        type: "success",
        title: "High-Converting Landing Page Identified",
        message: `"${bestPage.url.substring(
          0,
          50
        )}..." converts at ${bestPage.conversionRate.toFixed(2)}% (${(
          bestPage.conversionRate / overallConversionRate -
          1
        ).toFixed(0)}x above average) with ${bestPage.sessions} sessions.`,
        recommendation:
          "Analyze page elements, copy, design, and flow. Apply successful patterns to other pages. Increase traffic to this high-performing page.",
        impact:
          "High - Applying these patterns site-wide could significantly boost overall conversion.",
        timeframe: "2-4 weeks",
      });
    }

    if (lowConvertingPages.length > 0) {
      const worstPage = lowConvertingPages.sort(
        (a, b) => a.conversionRate - b.conversionRate
      )[0];
      insights.push({
        type: "warning",
        title: "Underperforming Landing Page",
        message: `"${worstPage.url.substring(
          0,
          50
        )}..." converts at only ${worstPage.conversionRate.toFixed(2)}% (${(
          overallConversionRate / worstPage.conversionRate -
          1
        ).toFixed(0)}x below average) despite ${worstPage.sessions} sessions.`,
        recommendation:
          "Conduct A/B testing on this page, improve value proposition, simplify messaging, enhance visual design, and ensure clear CTAs. Consider redirecting traffic to better-performing pages.",
        impact: "Medium - Fixing this could recover significant lost revenue.",
        timeframe: "4-6 weeks",
      });
    }
  }

  // Limit insights to prevent overload, prioritize by impact
  const prioritizedInsights = insights
    .sort((a, b) => {
      const priority = {
        critical: 5,
        alert: 4,
        warning: 3,
        info: 2,
        success: 1,
        excellent: 1,
        opportunity: 3,
      };
      return (priority[b.type] || 0) - (priority[a.type] || 0);
    })
    .slice(0, 8); // Return top 8 most important insights

  return prioritizedInsights;
};

export const generateOverviewInsights = (data) => {
  const {
    totalRevenue,
    netRevenue,
    totalOrders,
    aov,
    refundRate,
    totalRefunds,
    totalSessions,
    totalPageviews,
    totalProducts,
  } = data;

  const insights = [];

  // 1. Overall Business Health Assessment
  const revenuePerOrder = totalRevenue / totalOrders;
  const netMargin = (netRevenue / totalRevenue) * 100 || 0;
  const pagesPerSession = totalPageviews / totalSessions;
  const ordersPerProduct = totalOrders / totalProducts;

  // Revenue Health
  if (totalRevenue < 10000) {
    insights.push({
      type: "info",
      title: "Early Stage Business",
      message: `With $${formatNumber(
        totalRevenue
      )} in revenue and ${totalOrders} orders, you're in the early growth phase. Focus on establishing product-market fit.`,
      recommendation:
        "Concentrate on customer acquisition, gather feedback aggressively, iterate on product offerings, and build brand awareness.",
      impact: "High - Proper foundation critical for future growth.",
      timeframe: "6-12 months",
    });
  } else if (totalRevenue < 100000) {
    insights.push({
      type: "success",
      title: "Growth Phase Business",
      message: `$${formatNumber(
        totalRevenue
      )} revenue indicates solid traction. Time to scale systems and processes.`,
      recommendation:
        "Implement marketing automation, build repeatable acquisition channels, optimize conversion funnels, and consider hiring key roles.",
      impact: "High - Scaling correctly can lead to exponential growth.",
      timeframe: "3-6 months",
    });
  } else {
    insights.push({
      type: "excellent",
      title: "Established Business",
      message: `$${formatNumber(
        totalRevenue
      )} in revenue shows strong market position. Focus on optimization and expansion.`,
      recommendation:
        "Expand to new markets, develop product lines, optimize unit economics, and build strategic partnerships.",
      impact:
        "Medium - Optimization can yield significant profit improvements.",
      timeframe: "Quarterly",
    });
  }

  // 2. Profitability Analysis
  if (netMargin < 10) {
    insights.push({
      type: "critical",
      title: "Low Profitability Warning",
      message: `Net margin of ${netMargin.toFixed(
        1
      )}% is concerning. At this level, business sustainability is at risk during market downturns.`,
      recommendation:
        "Conduct cost analysis, optimize pricing strategy, reduce refunds, improve operational efficiency, and focus on higher-margin products.",
      impact: "Critical - Business viability depends on improving margins.",
      timeframe: "Immediate attention required",
    });
  } else if (netMargin < 20) {
    insights.push({
      type: "warning",
      title: "Moderate Profitability",
      message: `${netMargin.toFixed(
        1
      )}% net margin leaves limited room for error. Industry leaders typically achieve 25-40% net margins.`,
      recommendation:
        "Implement dynamic pricing, negotiate better supplier terms, automate repetitive tasks, and analyze customer acquisition costs by channel.",
      impact: "High - Margin improvement directly increases profitability.",
      timeframe: "Next quarter",
    });
  } else {
    insights.push({
      type: "success",
      title: "Healthy Profitability",
      message: `${netMargin.toFixed(
        1
      )}% net margin indicates good financial health and efficient operations.`,
      recommendation:
        "Reinvest profits into growth initiatives, build cash reserves, consider dividend distributions or strategic acquisitions.",
      impact: "Medium - Maintain and protect current margin levels.",
      timeframe: "Ongoing",
    });
  }

  // 3. Order Volume Analysis
  const dailyOrders = totalOrders / 30; // Assuming 30-day period
  if (dailyOrders < 1) {
    insights.push({
      type: "critical",
      title: "Low Order Volume",
      message: `Averaging ${dailyOrders.toFixed(
        1
      )} orders per day makes statistical analysis difficult and limits growth potential.`,
      recommendation:
        "Focus on generating minimum viable traffic, implement referral programs, run limited-time promotions, and consider partnerships for initial traction.",
      impact:
        "High - Need to reach minimum order volume for sustainable business.",
      timeframe: "Immediate",
    });
  } else if (dailyOrders < 10) {
    insights.push({
      type: "warning",
      title: "Building Order Volume",
      message: `${dailyOrders.toFixed(
        1
      )} daily orders is a good start. Time to scale acquisition while maintaining conversion quality.`,
      recommendation:
        "Increase marketing budget allocation, test new acquisition channels, optimize conversion funnels, and implement email marketing automation.",
      impact: "High - Scaling order volume is key to revenue growth.",
      timeframe: "1-2 months",
    });
  }

  // 4. AOV Growth Opportunity
  const aovOpportunity = aov < 75 ? "High" : aov < 125 ? "Medium" : "Low";
  if (aovOpportunity === "High") {
    insights.push({
      type: "opportunity",
      title: "Major AOV Improvement Opportunity",
      message: `Current AOV of $${aov.toFixed(
        2
      )} is significantly below the $100+ benchmark for healthy e-commerce businesses.`,
      recommendation:
        "Implement product bundling (save 15% on 3 items), add mandatory accessories, create premium versions, set strategic free shipping thresholds, and showcase bestsellers prominently.",
      impact:
        "Very High - Increasing AOV by $25 could increase revenue by ${Math.round(totalOrders * 25)} without additional customers.",
      timeframe: "4-8 weeks",
    });
  }

  // 5. Refund Rate Analysis
  if (refundRate > 8) {
    insights.push({
      type: "critical",
      title: "Excessive Refund Rate",
      message: `${refundRate.toFixed(
        2
      )}% refund rate is unsustainable. Each 1% reduction adds $${Math.round(
        totalRevenue * 0.01
      )} back to net revenue.`,
      recommendation:
        "Implement better product descriptions with videos, improve quality control, enhance customer service response times, create better sizing guides, and consider offering exchanges instead of refunds.",
      impact: "Critical - Direct revenue loss and operational burden.",
      timeframe: "Immediate action required",
    });
  } else if (refundRate > 3) {
    insights.push({
      type: "warning",
      title: "Above Average Refund Rate",
      message: `${refundRate.toFixed(
        2
      )}% exceeds the 1-3% benchmark for well-managed e-commerce stores.`,
      recommendation:
        "Analyze refund reasons by product, improve packaging to reduce damage, implement pre-sales customer support, and consider restocking fees for non-defective returns.",
      impact:
        "Medium - Reduction improves both revenue and customer satisfaction.",
      timeframe: "Next 30 days",
    });
  } else {
    insights.push({
      type: "success",
      title: "Healthy Refund Rate",
      message: `${refundRate.toFixed(
        2
      )}% refund rate is within acceptable range, indicating good product quality and customer alignment.`,
      recommendation:
        "Maintain current standards, document quality control processes, and continue gathering customer feedback for continuous improvement.",
      impact: "Low - Good performance to maintain.",
      timeframe: "Ongoing monitoring",
    });
  }

  // 6. Customer Engagement Metrics
  if (pagesPerSession < 2.5) {
    insights.push({
      type: "warning",
      title: "Low Engagement Detected",
      message: `Only ${pagesPerSession.toFixed(
        1
      )} pages per session suggests visitors aren't exploring your site deeply.`,
      recommendation:
        "Improve site navigation, add internal linking strategies, implement content recommendations, create engaging blog content, and add interactive elements.",
      impact:
        "Medium - Increasing engagement typically boosts conversion rates.",
      timeframe: "2-3 months",
    });
  }

  // 7. Product Portfolio Efficiency
  if (ordersPerProduct < 0.5) {
    insights.push({
      type: "info",
      title: "Product Portfolio Optimization Opportunity",
      message: `With ${totalProducts} products generating ${totalOrders} orders, each product averages only ${ordersPerProduct.toFixed(
        1
      )} orders.`,
      recommendation:
        "Conduct product performance analysis, discontinue underperformers, focus marketing on bestsellers, create product bundles, and consider seasonal rotations.",
      impact: "Medium - Streamlining can reduce complexity and increase focus.",
      timeframe: "Next inventory cycle",
    });
  }

  // 8. Revenue Growth Trajectory (if we had historical data)
  // This would require time-series data which we don't have in the current structure

  return insights.slice(0, 6); // Return top 6 insights for overview
};

export const generateProductInsights = (data) => {
  const insights = [];

  // Parse the data object
  const {
    totalProducts,
    totalRevenue,
    totalOrders,
    totalRefunds,
    avgRefundRate,
    topProduct,
    topProductRevenue,
    topProductPercent,
  } = data;

  // 1. Product Portfolio Health
  const revenuePerProduct = totalRevenue / totalProducts;
  const ordersPerProduct = totalOrders / totalProducts;

  if (revenuePerProduct < 1000) {
    insights.push({
      type: "warning",
      title: "Low Revenue Per Product",
      message: `Average revenue per product is $${formatNumber(
        revenuePerProduct
      )}, indicating many products may not be contributing significantly.`,
      recommendation:
        "Conduct product performance review, discontinue low-performing SKUs, bundle slow-moving products, and focus marketing on top performers.",
      impact: "Medium - Can reduce complexity and increase focus on winners.",
      timeframe: "Next inventory review",
    });
  }

  if (ordersPerProduct < 5) {
    insights.push({
      type: "info",
      title: "Product Engagement Analysis",
      message: `Each product averages only ${ordersPerProduct.toFixed(
        1
      )} orders, suggesting visitors aren't exploring the full catalog.`,
      recommendation:
        "Improve product discovery features, implement 'shop similar' recommendations, create curated collections, and optimize category pages.",
      impact: "Medium - Better discovery can increase overall order value.",
      timeframe: "1-2 months",
    });
  }

  // 2. Revenue Concentration Analysis
  const concentrationRisk =
    parseFloat(topProductPercent) > 60
      ? "Critical"
      : parseFloat(topProductPercent) > 40
      ? "High"
      : parseFloat(topProductPercent) > 25
      ? "Moderate"
      : "Low";

  if (concentrationRisk === "Critical" || concentrationRisk === "High") {
    insights.push({
      type: concentrationRisk === "Critical" ? "critical" : "warning",
      title: `${concentrationRisk} Revenue Concentration`,
      message: `${topProduct} generates ${topProductPercent}% of total revenue ($${formatNumber(
        parseFloat(topProductRevenue)
      )}). This creates significant business risk.`,
      recommendation:
        "Develop complementary products, create product line extensions, run marketing campaigns for secondary products, and consider strategic partnerships.",
      impact: "High - Diversification reduces business vulnerability.",
      timeframe: "3-6 months",
    });
  }

  // 3. Refund Rate Analysis by Product
  const refundSeverity =
    avgRefundRate > 10
      ? "Critical"
      : avgRefundRate > 5
      ? "High"
      : avgRefundRate > 3
      ? "Moderate"
      : "Low";

  if (refundSeverity === "Critical" || refundSeverity === "High") {
    insights.push({
      type: refundSeverity === "Critical" ? "critical" : "warning",
      title: `${refundSeverity} Product Refund Issues`,
      message: `Average product refund rate of ${avgRefundRate.toFixed(
        1
      )}% indicates potential quality, description, or expectation mismatches.`,
      recommendation:
        "Analyze refund reasons by product, improve product photography and descriptions, implement quality control checks, and gather customer feedback systematically.",
      impact: "High - Reduces revenue loss and improves customer satisfaction.",
      timeframe: "Immediate for critical, 30 days for high",
    });
  }

  // 4. Product Lifecycle Analysis
  if (totalProducts > 50 && ordersPerProduct < 2) {
    insights.push({
      type: "warning",
      title: "Product Bloat Detected",
      message: `${totalProducts} products with only ${ordersPerProduct.toFixed(
        1
      )} average orders each suggests too many underperforming SKUs.`,
      recommendation:
        "Conduct ABC analysis (80/20 rule), implement product lifecycle management, create clearance sections for slow movers, and focus on core product development.",
      impact:
        "Medium - Simplification can reduce costs and increase efficiency.",
      timeframe: "Quarterly review",
    });
  }

  // 5. Cross-Selling Opportunity Analysis
  const crossSellPotential =
    parseFloat(topProductPercent) < 30 && totalProducts >= 10
      ? "High"
      : "Moderate";

  if (crossSellPotential === "High") {
    insights.push({
      type: "opportunity",
      title: "Strong Cross-Selling Potential",
      message:
        "Balanced revenue distribution across products indicates good cross-selling opportunities.",
      recommendation:
        "Implement 'frequently bought together' recommendations, create curated bundles, offer volume discounts, and develop product pairing guides.",
      impact: "High - Can increase AOV by 20-40%.",
      timeframe: "4-8 weeks",
    });
  }

  // 6. Seasonal Product Analysis (would require time-series data)
  // Placeholder for future enhancement

  // 7. Inventory Turnover Analysis (would require inventory data)
  // Placeholder for future enhancement

  // 8. Product Margin Analysis (would require cost data)
  const marginHealth = "Unknown"; // Would need product-level margin data

  if (marginHealth === "Concerning") {
    insights.push({
      type: "warning",
      title: "Product Margin Issues",
      message:
        "Several products show concerning profit margins that may not be sustainable.",
      recommendation:
        "Conduct margin analysis by product, consider price adjustments, negotiate supplier terms, or reformulate/repackage low-margin items.",
      impact: "Medium - Margin improvement directly increases profitability.",
      timeframe: "Next pricing review",
    });
  }

  return insights.slice(0, 5); // Return top 5 product insights
};

export const generateRefundInsights = (data) => {
  const insights = [];

  const {
    totalRefunds,
    refundRate,
    refundCount,
    avgRefundValue,
    topRefundedProduct,
    topRefundedAmount,
  } = data;

  // Convert string values to numbers if needed
  const totalRefundsNum =
    typeof totalRefunds === "string" ? parseFloat(totalRefunds) : totalRefunds;
  const refundRateNum =
    typeof refundRate === "string" ? parseFloat(refundRate) : refundRate;
  const avgRefundValueNum =
    typeof avgRefundValue === "string"
      ? parseFloat(avgRefundValue)
      : avgRefundValue;
  const topRefundedAmountNum =
    typeof topRefundedAmount === "string"
      ? parseFloat(topRefundedAmount)
      : topRefundedAmount;

  // 1. Overall Refund Health Assessment
  const refundHealth =
    refundRateNum > 10
      ? "Critical"
      : refundRateNum > 5
      ? "High Risk"
      : refundRateNum > 3
      ? "Concerning"
      : refundRateNum > 1
      ? "Acceptable"
      : "Excellent";

  insights.push({
    type:
      refundHealth === "Critical" || refundHealth === "High Risk"
        ? "critical"
        : refundHealth === "Concerning"
        ? "warning"
        : "info",
    title: `Refund Health: ${refundHealth}`,
    message: `${refundRateNum.toFixed(
      2
    )}% refund rate is ${refundHealth.toLowerCase()}. Industry benchmark is 1-3% for healthy e-commerce.`,
    recommendation:
      refundHealth === "Critical" || refundHealth === "High Risk"
        ? "Implement immediate quality control measures, enhance product descriptions with videos, improve packaging, and add sizing guides for apparel."
        : "Monitor refund reasons closely, implement customer satisfaction surveys post-purchase, and consider offering exchanges instead of refunds.",
    impact:
      refundHealth === "Critical"
        ? "Critical - Business sustainability at risk"
        : refundHealth === "High Risk"
        ? "High - Significant revenue loss"
        : "Medium",
    timeframe:
      refundHealth === "Critical" ? "Immediate action required" : "30 days",
  });

  // 2. Refund Value Analysis
  const avgOrderValueContext =
    avgRefundValueNum > 100
      ? "High-value refunds"
      : avgRefundValueNum > 50
      ? "Moderate-value refunds"
      : "Low-value refunds";

  if (avgRefundValueNum > 75) {
    insights.push({
      type: "warning",
      title: "High-Value Refunds Detected",
      message: `Average refund value of $${avgRefundValueNum.toFixed(
        2
      )} suggests premium products or large orders are being returned.`,
      recommendation:
        "Implement pre-sales consultations for high-value items, add detailed product specifications, offer virtual try-ons where applicable, and consider restocking fees for non-defective returns.",
      impact:
        "High - Each high-value refund represents significant revenue loss.",
      timeframe: "2-4 weeks",
    });
  }

  // 3. Refund Concentration Analysis
  if (topRefundedProduct && topRefundedAmountNum > totalRefundsNum * 0.3) {
    insights.push({
      type: "critical",
      title: "Refund Concentration Crisis",
      message: `${topRefundedProduct} accounts for over 30% of total refund value ($${formatNumber(
        topRefundedAmountNum
      )}). This indicates a serious product-specific issue.`,
      recommendation:
        "Immediately investigate this product: check quality, descriptions, sizing, and customer feedback. Consider temporarily pausing sales until issues are resolved.",
      impact:
        "Critical - Single product causing disproportionate refund losses.",
      timeframe: "Immediate investigation required",
    });
  }

  // 4. Refund Pattern Analysis (would require time-series data)
  // Placeholder for future enhancement with time data

  // 5. Refund Reason Analysis (would require reason codes)
  const commonReasons = [
    "Size/ Fit",
    "Product Quality",
    "Not as Described",
    "Changed Mind",
  ];

  insights.push({
    type: "info",
    title: "Common Refund Reasons Analysis",
    message: `Based on industry data, ${commonReasons[0]} and ${commonReasons[1]} typically account for 60-70% of e-commerce refunds.`,
    recommendation:
      "Implement detailed sizing guides with measurements, add product videos showing actual use, improve quality control processes, and set realistic customer expectations.",
    impact: "Medium - Addressing common reasons can reduce refunds by 30-50%.",
    timeframe: "1-2 months",
  });

  // 6. Financial Impact Analysis
  const monthlyRefundLoss = totalRefundsNum; // Assuming this is for the period
  const annualizedLoss = monthlyRefundLoss * 12;

  if (annualizedLoss > 10000) {
    insights.push({
      type: "alert",
      title: "Significant Financial Impact",
      message: `Refunds are costing approximately $${formatNumber(
        annualizedLoss
      )} annually. Each 1% reduction saves $${formatNumber(
        annualizedLoss * 0.01
      )}.`,
      recommendation:
        "Conduct root cause analysis, implement preventive measures, track refund KPIs by product/category, and set reduction targets with team accountability.",
      impact: "High - Direct bottom-line impact.",
      timeframe: "Quarterly review with targets",
    });
  }

  // 7. Customer Experience Perspective
  if (refundRateNum > 5) {
    insights.push({
      type: "warning",
      title: "Customer Satisfaction Risk",
      message: `High refund rates (${refundRateNum.toFixed(
        2
      )}%) often correlate with poor customer experiences and negative reviews.`,
      recommendation:
        "Implement proactive customer service, offer hassle-free exchanges, gather feedback from refunding customers, and monitor review sites for patterns.",
      impact: "High - Affects brand reputation and customer lifetime value.",
      timeframe: "Ongoing monitoring",
    });
  }

  // 8. Operational Efficiency Impact
  const refundProcessingCost = refundCount * 15; // Estimated $15 per refund processed
  if (refundCount > 100) {
    insights.push({
      type: "info",
      title: "Operational Burden Analysis",
      message: `${refundCount} refunds require approximately ${Math.round(
        refundCount * 0.5
      )} staff hours monthly for processing, costing ~$${formatNumber(
        refundProcessingCost
      )}.`,
      recommendation:
        "Automate refund processing where possible, implement clear refund policies, train staff on efficient handling, and consider outsourcing during peak periods.",
      impact:
        "Medium - Reduces operational costs and frees staff for revenue-generating activities.",
      timeframe: "Next quarter",
    });
  }

  return insights.slice(0, 6); // Return top 6 refund insights
};

export const generateTrafficInsights = (data) => {
  const insights = [];

  const {
    totalSessions,
    uniqueUsers,
    bounceRate,
    avgPagesPerSession,
    topSource,
    topSourcePercent,
    mobilePercent,
    desktopPercent,
    returningRate,
  } = data;

  // Convert string values to numbers if needed
  const bounceRateNum =
    typeof bounceRate === "string" ? parseFloat(bounceRate) : bounceRate;
  const avgPagesPerSessionNum =
    typeof avgPagesPerSession === "string"
      ? parseFloat(avgPagesPerSession)
      : avgPagesPerSession;
  const mobilePercentNum =
    typeof mobilePercent === "string"
      ? parseFloat(mobilePercent)
      : mobilePercent;
  const desktopPercentNum =
    typeof desktopPercent === "string"
      ? parseFloat(desktopPercent)
      : desktopPercent;
  const returningRateNum =
    typeof returningRate === "string"
      ? parseFloat(returningRate)
      : returningRate;
  const topSourcePercentNum =
    typeof topSourcePercent === "string"
      ? parseFloat(topSourcePercent)
      : topSourcePercent;

  // 1. Overall Traffic Health Assessment
  const dailySessions = totalSessions / 30; // Assuming 30-day period
  const trafficHealth =
    dailySessions < 50
      ? "Very Low"
      : dailySessions < 200
      ? "Low"
      : dailySessions < 1000
      ? "Moderate"
      : dailySessions < 5000
      ? "Good"
      : "Excellent";

  insights.push({
    type:
      trafficHealth === "Very Low" || trafficHealth === "Low"
        ? "warning"
        : "info",
    title: `Traffic Volume: ${trafficHealth}`,
    message: `${dailySessions.toFixed(
      0
    )} daily sessions is considered ${trafficHealth.toLowerCase()} volume for e-commerce. Conversion optimization becomes more effective above 200 daily sessions.`,
    recommendation:
      trafficHealth === "Very Low" || trafficHealth === "Low"
        ? "Focus on foundational traffic generation: SEO basics, social media presence, email list building, and partnerships."
        : "Optimize existing channels, implement retargeting campaigns, explore new acquisition channels, and increase content marketing efforts.",
    impact:
      trafficHealth === "Very Low"
        ? "Critical - Need minimum traffic for business viability"
        : "Medium",
    timeframe: trafficHealth === "Very Low" ? "Immediate focus" : "Ongoing",
  });

  // 2. Bounce Rate Deep Analysis
  const bounceRateHealth =
    bounceRateNum > 70
      ? "Critical"
      : bounceRateNum > 60
      ? "High"
      : bounceRateNum > 50
      ? "Concerning"
      : bounceRateNum > 40
      ? "Acceptable"
      : "Excellent";

  if (bounceRateHealth === "Critical" || bounceRateHealth === "High") {
    insights.push({
      type: "critical",
      title: `${bounceRateHealth} Bounce Rate Issue`,
      message: `${bounceRateNum.toFixed(
        1
      )}% bounce rate means ${bounceRateNum.toFixed(
        0
      )}% of visitors leave without interaction. Industry benchmark is 40-55% for e-commerce.`,
      recommendation:
        "Improve page load speed (target under 3 seconds), ensure mobile responsiveness, match ad messaging to landing pages, improve above-the-fold content, and add clear value propositions.",
      impact:
        "High - Reducing bounce rate by 10% can increase conversions by 5-10%.",
      timeframe: "Immediate optimization required",
    });
  }

  // 3. Engagement Metrics Analysis
  const engagementHealth =
    avgPagesPerSessionNum < 2
      ? "Poor"
      : avgPagesPerSessionNum < 3
      ? "Average"
      : avgPagesPerSessionNum < 4
      ? "Good"
      : "Excellent";

  if (engagementHealth === "Poor" || engagementHealth === "Average") {
    insights.push({
      type: engagementHealth === "Poor" ? "warning" : "info",
      title: `${engagementHealth} User Engagement`,
      message: `${avgPagesPerSessionNum.toFixed(
        1
      )} pages per session indicates ${engagementHealth.toLowerCase()} visitor engagement. High-performing sites average 3-4 pages.`,
      recommendation:
        "Improve internal linking, add related product suggestions, create engaging blog content, implement content recommendations, and optimize category pages for exploration.",
      impact:
        "Medium - Better engagement typically leads to higher conversion rates.",
      timeframe: "1-2 months",
    });
  }

  // 4. Traffic Source Concentration Analysis
  const sourceConcentration =
    topSourcePercentNum > 60
      ? "Critical"
      : topSourcePercentNum > 40
      ? "High"
      : topSourcePercentNum > 25
      ? "Moderate"
      : "Healthy";

  if (sourceConcentration === "Critical" || sourceConcentration === "High") {
    insights.push({
      type: sourceConcentration === "Critical" ? "critical" : "warning",
      title: `${sourceConcentration} Traffic Concentration Risk`,
      message: `${topSource} provides ${topSourcePercentNum.toFixed(
        0
      )}% of your traffic. Over-reliance on a single channel creates significant business risk.`,
      recommendation:
        "Diversify traffic sources immediately. Allocate 20-30% of marketing budget to testing new channels (email, SEO, social, partnerships). Build owned channels like email list.",
      impact:
        "High - Reduces vulnerability to channel algorithm changes or policy updates.",
      timeframe: "3-6 months for diversification",
    });
  }

  // 5. Mobile vs Desktop Analysis
  if (mobilePercentNum > 65 && desktopPercentNum < 35) {
    insights.push({
      type: mobilePercentNum > 75 ? "critical" : "warning",
      title: "Mobile-Dominant Traffic Pattern",
      message: `${mobilePercentNum.toFixed(
        0
      )}% mobile traffic requires exceptional mobile experience. Most e-commerce sites convert better on desktop.`,
      recommendation:
        "Prioritize mobile optimization: ensure fast loading (<3s), implement AMP pages, optimize for thumb navigation, simplify checkout for mobile, and test mobile-specific designs.",
      impact:
        "High - Mobile experience directly impacts majority of your visitors.",
      timeframe: "Immediate priority",
    });
  }

  // 6. Returning Visitor Analysis
  const retentionHealth =
    returningRateNum < 15
      ? "Poor"
      : returningRateNum < 25
      ? "Average"
      : returningRateNum < 35
      ? "Good"
      : "Excellent";

  if (retentionHealth === "Poor" || retentionHealth === "Average") {
    insights.push({
      type: retentionHealth === "Poor" ? "warning" : "info",
      title: `${retentionHealth} Customer Retention`,
      message: `${returningRateNum.toFixed(
        1
      )}% returning visitors indicates ${retentionHealth.toLowerCase()} customer loyalty. Top e-commerce sites achieve 25-35% returning visitors.`,
      recommendation:
        "Implement email marketing automation, create loyalty programs, offer exclusive content to past customers, run retargeting campaigns, and personalize experiences.",
      impact: "High - Returning customers spend 67% more than new customers.",
      timeframe: "2-3 months for program implementation",
    });
  }

  // 7. Traffic Quality Assessment (would require conversion data by source)
  // Placeholder for future enhancement

  // 8. Geographic Analysis (would require location data)
  // Placeholder for future enhancement

  // 9. Device Performance Analysis
  const mobileTrafficHealth =
    mobilePercentNum > 50 ? "Mobile-First" : "Desktop-First";
  insights.push({
    type: "info",
    title: `${mobileTrafficHealth} Audience`,
    message: `Your audience is ${mobilePercentNum.toFixed(
      0
    )}% mobile and ${desktopPercentNum.toFixed(
      0
    )}% desktop. Optimize experiences accordingly.`,
    recommendation:
      mobileTrafficHealth === "Mobile-First"
        ? "Test mobile-specific layouts, ensure all forms are mobile-friendly, implement one-click checkout options, and optimize images for mobile data speeds."
        : "Focus on desktop conversion optimization, implement desktop-exclusive features if appropriate, and ensure seamless transition between devices.",
    impact: "Medium - Device-optimized experiences improve conversion rates.",
    timeframe: "Ongoing optimization",
  });

  // 10. Traffic Growth Opportunities
  if (totalSessions < 10000) {
    insights.push({
      type: "opportunity",
      title: "Traffic Growth Phase",
      message: `With ${totalSessions} total sessions, you're in the early growth phase with significant expansion potential.`,
      recommendation:
        "Implement scalable acquisition strategies: content marketing for SEO, social media advertising, email list building, influencer partnerships, and referral programs.",
      impact: "High - Traffic growth is fundamental to revenue growth.",
      timeframe: "3-6 months for measurable growth",
    });
  }

  return insights.slice(0, 7); // Return top 7 traffic insights
};

// Helper function for formatting numbers (copied from dataCleaners)
const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toLocaleString();
};
