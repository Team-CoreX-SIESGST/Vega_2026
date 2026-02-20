import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const AIRecommendations = ({ sectionType, metrics, insights }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFallbackRecommendations = (type, metrics) => {
    if (type === 'traffic') {
      const mobilePercent = parseFloat(metrics.mobilePercent || 0);
      const topSourcePercent = parseFloat(metrics.topSourcePercent || 0);
      const bounceRate = parseFloat(metrics.bounceRate || 0);
      
      let recs = `**🎯 Key Recommendations:**\n\n`;
      
      if (mobilePercent > 60) {
        recs += `1. **High Priority: Optimize Mobile Experience** (High Impact)\n`;
        recs += `   Mobile traffic represents ${mobilePercent}% of your visitors. Mobile users often have different needs and behaviors.\n`;
        recs += `   → Audit mobile checkout flow, test one-click purchase, optimize page load speed for mobile devices, and ensure buttons are easily tappable.\n\n`;
      } else {
        recs += `1. **Medium Priority: Capture Mobile Growth** (Medium Impact)\n`;
        recs += `   Mobile traffic is ${mobilePercent}% but growing industry-wide. Position for future growth.\n`;
        recs += `   → Implement mobile-first design principles and test mobile user experience to prepare for increased mobile traffic.\n\n`;
      }
      
      if (topSourcePercent > 70) {
        recs += `2. **Critical: Diversify Traffic Sources** (High Impact)\n`;
        recs += `   ${metrics.topSource} accounts for ${topSourcePercent}% of traffic. Over-reliance on single channel creates vulnerability.\n`;
        recs += `   → Allocate 15-20% of marketing budget to test alternative channels (email marketing, content marketing, partnerships) this quarter.\n\n`;
      } else {
        recs += `2. **Quick Win: Scale Top Performers** (Medium Impact)\n`;
        recs += `   Traffic sources are well-distributed with ${metrics.topSource} leading at ${topSourcePercent}%.\n`;
        recs += `   → Identify what makes your top channels successful and apply those learnings to underperforming channels.\n\n`;
      }
      
      if (bounceRate > 55) {
        recs += `3. **High Priority: Reduce Bounce Rate** (High Impact)\n`;
        recs += `   Bounce rate of ${bounceRate}% is above industry average (40-50%). Visitors aren't finding what they expect.\n`;
        recs += `   → Test clearer value propositions above the fold, improve page load speed (target <3s), and implement exit-intent popups.\n\n`;
      } else {
        recs += `3. **Optimization: Improve Engagement** (Medium Impact)\n`;
        recs += `   Bounce rate of ${bounceRate}% is healthy. Focus on deepening engagement.\n`;
        recs += `   → Add personalized product recommendations, implement related content sections, and test interactive elements.\n\n`;
      }
      
      const returningRate = parseFloat(metrics.returningRate || 0);
      if (returningRate < 20) {
        recs += `4. **Medium Priority: Build Customer Loyalty** (High Impact)\n`;
        recs += `   Only ${returningRate}% of visitors return. Focus on retention.\n`;
        recs += `   → Implement email capture strategy, create loyalty program, and develop remarketing campaigns for first-time visitors.\n\n`;
      } else {
        recs += `4. **Quick Win: Leverage Loyal Audience** (Medium Impact)\n`;
        recs += `   ${returningRate}% visitor return rate shows good retention.\n`;
        recs += `   → Create exclusive offers for returning customers and implement referral program to turn loyal customers into advocates.\n\n`;
      }
      
      const avgPages = parseFloat(metrics.avgPagesPerSession || 0);
      if (avgPages < 2) {
        recs += `5. **Opportunity: Increase Page Depth** (Medium Impact)\n`;
        recs += `   Average ${avgPages} pages/session suggests limited exploration.\n`;
        recs += `   → Add "related products" sections, improve internal linking, and create content hubs to encourage deeper browsing.`;
      } else {
        recs += `5. **Maintain: Strong Engagement** (Low Impact)\n`;
        recs += `   Average ${avgPages} pages/session indicates good engagement.\n`;
        recs += `   → Continue current strategies and test A/B variations to optimize conversion paths.`;
      }
      
      return recs;
    }
    
    if (type === 'conversion') {
      const convRate = parseFloat(metrics.conversionRate || 0);
      const aov = parseFloat(metrics.aov || 0);
      const profitMargin = parseFloat(metrics.profitMargin || 0);
      const newConvRate = parseFloat(metrics.newConversionRate || 0);
      const returningConvRate = parseFloat(metrics.returningConversionRate || 0);
      
      let recs = `**🎯 Key Recommendations:**\n\n`;
      
      // Conversion rate optimization
      if (convRate < 2) {
        recs += `1. **Critical: Improve Conversion Rate** (High Impact)\n`;
        recs += `   ${convRate}% conversion is below e-commerce average (2-3%). Significant revenue opportunity.\n`;
        recs += `   → Simplify checkout (reduce steps from 5 to 3), add trust badges, offer guest checkout, and test social proof elements.\n\n`;
      } else if (convRate < 3) {
        recs += `1. **High Priority: Optimize Checkout Flow** (High Impact)\n`;
        recs += `   ${convRate}% conversion is in average range. Small improvements = big revenue gains.\n`;
        recs += `   → A/B test one-page checkout, add progress indicators, enable autofill for forms, and reduce required fields.\n\n`;
      } else {
        recs += `1. **Optimization: Maintain Excellence** (Medium Impact)\n`;
        recs += `   Strong ${convRate}% conversion rate. Focus on sustaining performance.\n`;
        recs += `   → Monitor checkout analytics daily, conduct quarterly user testing, and continuously optimize page speed.\n\n`;
      }
      
      // AOV optimization
      if (aov < 50) {
        recs += `2. **High Priority: Increase Order Value** (High Impact)\n`;
        recs += `   $${aov} AOV is low. Bundling and upsells can significantly boost revenue.\n`;
        recs += `   → Implement product bundles with 10% discount, add "frequently bought together" section, and offer free shipping at $75 threshold.\n\n`;
      } else if (aov < 100) {
        recs += `2. **Medium Priority: Grow Average Order** (Medium Impact)\n`;
        recs += `   $${aov} AOV has room for growth through strategic upselling.\n`;
        recs += `   → Test cart upsells ("Add X for just $Y more"), implement quantity discounts, and create premium product bundles.\n\n`;
      } else {
        recs += `2. **Quick Win: Leverage High AOV** (Medium Impact)\n`;
        recs += `   Strong $${aov} AOV indicates quality customer base.\n`;
        recs += `   → Launch VIP loyalty program, offer exclusive products for high-value customers, and test subscription options.\n\n`;
      }
      
      // Device conversion gap
      if (metrics.topSourceConvRate) {
        const topConv = parseFloat(metrics.topSourceConvRate);
        recs += `3. **Opportunity: Scale Best Performers** (High Impact)\n`;
        recs += `   ${metrics.topSource} converts at ${topConv}% - your best channel.\n`;
        recs += `   → Increase budget allocation by 30%, analyze what makes this channel successful, and apply learnings to other channels.\n\n`;
      }
      
      // New vs returning conversion
      if (returningConvRate > newConvRate * 2) {
        recs += `4. **Medium Priority: Improve New Visitor Experience** (Medium Impact)\n`;
        recs += `   Returning visitors convert ${returningConvRate}% vs new ${newConvRate}%. First impression gap.\n`;
        recs += `   → Add welcome popup with 10% discount, implement trust signals prominently, create first-time buyer guide, and showcase reviews.\n\n`;
      } else if (newConvRate > returningConvRate) {
        recs += `4. **Critical: Fix Retention Issues** (High Impact)\n`;
        recs += `   New visitors convert better (${newConvRate}%) than returning (${returningConvRate}%). Loyalty problem.\n`;
        recs += `   → Implement post-purchase email sequence, create loyalty rewards program, and offer returning customer discounts.\n\n`;
      } else {
        recs += `4. **Optimization: Balance Acquisition & Retention** (Medium Impact)\n`;
        recs += `   Balanced conversion: New ${newConvRate}% vs Returning ${returningConvRate}%.\n`;
        recs += `   → Continue optimizing both funnels, test personalization for returning visitors, and maintain new user onboarding.\n\n`;
      }
      
      // Profit margin
      if (profitMargin < 40) {
        recs += `5. **Medium Priority: Improve Margins** (Medium Impact)\n`;
        recs += `   ${profitMargin}% profit margin is below healthy threshold (40-50%).\n`;
        recs += `   → Negotiate better supplier rates, optimize shipping costs, phase out low-margin products, and test price increases on high-demand items.`;
      } else {
        recs += `5. **Quick Win: Protect Margins** (Low Impact)\n`;
        recs += `   Healthy ${profitMargin}% profit margin. Focus on maintaining quality.\n`;
        recs += `   → Monitor COGS trends monthly, test premium product lines, and maintain pricing discipline during promotions.`;
      }
      
      return recs;
    }
    
    if (type === 'products') {
      const totalProducts = parseInt(metrics.totalProducts || 0);
      const avgRefundRate = parseFloat(metrics.avgRefundRate || 0);
      const topProductPercent = parseFloat(metrics.topProductPercent || 0);
      
      let recs = `**🎯 Key Recommendations:**\n\n`;
      
      // Product concentration
      if (topProductPercent > 70) {
        recs += `1. **Critical: Diversify Product Portfolio** (High Impact)\n`;
        recs += `   ${metrics.topProduct} accounts for ${topProductPercent}% of revenue. High concentration risk.\n`;
        recs += `   → Launch 2-3 new products this quarter, test complementary products, and develop product bundles to reduce dependency.\n\n`;
      } else if (topProductPercent > 40) {
        recs += `1. **High Priority: Leverage Hero Product** (High Impact)\n`;
        recs += `   ${metrics.topProduct} is your hero product at ${topProductPercent}% revenue ($${metrics.topProductRevenue}).\n`;
        recs += `   → Create product bundles featuring ${metrics.topProduct}, develop upsell strategies, and use as anchor for cross-selling.\n\n`;
      } else {
        recs += `1. **Quick Win: Optimize Product Mix** (Medium Impact)\n`;
        recs += `   Well-distributed portfolio with ${totalProducts} products. ${metrics.topProduct} leads at ${topProductPercent}%.\n`;
        recs += `   → Identify best-performing product attributes and apply to underperformers, test pricing strategies.\n\n`;
      }
      
      // Refund rate
      if (avgRefundRate > 5) {
        recs += `2. **Critical: Reduce Product Refunds** (High Impact)\n`;
        recs += `   ${avgRefundRate}% average refund rate is above industry standard (2-3%). Quality or expectation gap.\n`;
        recs += `   → Review product descriptions for accuracy, improve quality control, add detailed product videos, and enhance customer support.\n\n`;
      } else if (avgRefundRate > 2) {
        recs += `2. **Medium Priority: Monitor Refund Trends** (Medium Impact)\n`;
        recs += `   ${avgRefundRate}% refund rate is acceptable but has room for improvement.\n`;
        recs += `   → Implement post-purchase surveys, analyze refund reasons, and proactively address common issues.\n\n`;
      } else {
        recs += `2. **Maintain: Excellent Product Quality** (Low Impact)\n`;
        recs += `   ${avgRefundRate}% refund rate shows strong product quality and customer satisfaction.\n`;
        recs += `   → Continue quality standards, use as selling point in marketing, and maintain customer service excellence.\n\n`;
      }
      
      // Product catalog size
      if (totalProducts < 5) {
        recs += `3. **High Priority: Expand Product Catalog** (High Impact)\n`;
        recs += `   Only ${totalProducts} products limits growth potential and customer choice.\n`;
        recs += `   → Launch 3-5 new products this quarter, test market demand, and diversify product categories.\n\n`;
      } else {
        recs += `3. **Optimization: Strategic Product Development** (Medium Impact)\n`;
        recs += `   ${totalProducts} products provide good variety. Focus on quality over quantity.\n`;
        recs += `   → Analyze product performance data, phase out underperformers, and invest in top sellers.\n\n`;
      }
      
      // Revenue optimization
      const totalRevenue = parseFloat(metrics.totalRevenue || 0);
      if (totalRevenue > 0) {
        recs += `4. **Quick Win: Optimize Product Pricing** (Medium Impact)\n`;
        recs += `   Total revenue of $${totalRevenue} across ${totalProducts} products.\n`;
        recs += `   → Test dynamic pricing, implement volume discounts, and create premium product tiers.\n\n`;
      }
      
      recs += `5. **Opportunity: Product Marketing Strategy** (Medium Impact)\n`;
      recs += `   Leverage top performers to drive overall catalog growth.\n`;
      recs += `   → Feature ${metrics.topProduct} in marketing campaigns, create product comparison guides, and develop seasonal product strategies.`;
      
      return recs;
    }
    
    if (type === 'refund') {
      const refundRate = parseFloat(metrics.refundRate || 0);
      const totalRefunds = parseFloat(metrics.totalRefunds || 0);
      const avgRefundValue = parseFloat(metrics.avgRefundValue || 0);
      
      let recs = `**🎯 Key Recommendations:**\n\n`;
      
      // Refund rate priority
      if (refundRate > 10) {
        recs += `1. **Critical: Emergency Refund Reduction** (High Impact)\n`;
        recs += `   ${refundRate}% refund rate is critically high (${metrics.refundCount} refunds, $${totalRefunds}). Immediate action required.\n`;
        recs += `   → Conduct refund root cause analysis, improve product quality control, enhance product descriptions, and implement pre-purchase customer support.\n\n`;
      } else if (refundRate > 5) {
        recs += `1. **High Priority: Reduce Refund Rate** (High Impact)\n`;
        recs += `   ${refundRate}% refund rate is above industry average (2-3%). Revenue loss of $${totalRefunds}.\n`;
        recs += `   → Review product quality standards, add detailed product images/videos, improve sizing guides, and enhance return policy clarity.\n\n`;
      } else if (refundRate > 2) {
        recs += `1. **Medium Priority: Optimize Refund Process** (Medium Impact)\n`;
        recs += `   ${refundRate}% refund rate is acceptable but can be improved.\n`;
        recs += `   → Analyze refund reasons, implement proactive customer communication, and test product improvements based on feedback.\n\n`;
      } else {
        recs += `1. **Maintain: Excellent Refund Performance** (Low Impact)\n`;
        recs += `   ${refundRate}% refund rate is excellent. Maintain quality standards.\n`;
        recs += `   → Continue current quality control, use low refund rate as marketing advantage, and monitor trends.\n\n`;
      }
      
      // Top refunded product
      if (metrics.topRefundedProduct) {
        recs += `2. **High Priority: Address Top Refunded Product** (High Impact)\n`;
        recs += `   "${metrics.topRefundedProduct}" has $${metrics.topRefundedAmount} in refunds - highest in catalog.\n`;
        recs += `   → Investigate specific issues with this product, review customer feedback, improve product description, and consider product improvements or discontinuation.\n\n`;
      }
      
      // Average refund value
      if (avgRefundValue > 100) {
        recs += `3. **Medium Priority: High-Value Refund Impact** (Medium Impact)\n`;
        recs += `   Average refund value of $${avgRefundValue} indicates high-ticket items are being returned.\n`;
        recs += `   → Enhance product descriptions for expensive items, add detailed specifications, offer virtual consultations, and improve packaging.\n\n`;
      } else {
        recs += `3. **Optimization: Refund Value Management** (Low Impact)\n`;
        recs += `   Average refund value of $${avgRefundValue} is manageable.\n`;
        recs += `   → Focus on reducing refund count rather than value, implement quality checks, and improve customer expectations.\n\n`;
      }
      
      // Refund process
      recs += `4. **Quick Win: Improve Refund Process** (Medium Impact)\n`;
      recs += `   Streamline refund handling to reduce operational costs.\n`;
      recs += `   → Implement automated refund processing, create clear refund policy, and provide easy return labels.\n\n`;
      
      recs += `5. **Opportunity: Prevent Refunds Proactively** (Medium Impact)\n`;
      recs += `   Focus on preventing refunds before they happen.\n`;
      recs += `   → Add size guides, product comparison tools, customer reviews prominently, and pre-purchase Q&A sections.`;
      
      return recs;
    }
    
    if (type === 'revenue') {
      const totalRevenue = parseFloat(metrics.totalRevenue || 0);
      const aov = parseFloat(metrics.aov || 0);
      const totalOrders = parseInt(metrics.totalOrders || 0);
      
      let recs = `**🎯 Key Recommendations:**\n\n`;
      
      // Revenue growth
      if (totalRevenue > 0) {
        recs += `1. **High Priority: Accelerate Revenue Growth** (High Impact)\n`;
        recs += `   Current revenue of $${totalRevenue} with ${totalOrders} orders (AOV: $${aov}).\n`;
        recs += `   → Implement upselling strategies, create product bundles, test pricing optimization, and expand marketing channels.\n\n`;
      }
      
      // AOV optimization
      if (aov < 50) {
        recs += `2. **Critical: Increase Average Order Value** (High Impact)\n`;
        recs += `   $${aov} AOV is low. Small increases = significant revenue gains.\n`;
        recs += `   → Implement "frequently bought together" suggestions, offer product bundles with 10-15% discount, set free shipping threshold at $75, and test cart upsells.\n\n`;
      } else if (aov < 100) {
        recs += `2. **High Priority: Grow Order Value** (High Impact)\n`;
        recs += `   $${aov} AOV has growth potential through strategic upselling.\n`;
        recs += `   → Add quantity discounts, create premium product tiers, implement subscription options, and test limited-time offers.\n\n`;
      } else {
        recs += `2. **Quick Win: Leverage High AOV** (Medium Impact)\n`;
        recs += `   Strong $${aov} AOV indicates quality customer base.\n`;
        recs += `   → Launch VIP program for high-value customers, offer exclusive products, and create loyalty rewards.\n\n`;
      }
      
      // Top product revenue
      if (metrics.topProduct) {
        const topPercent = metrics.topProductRevenue && totalRevenue > 0 
          ? ((parseFloat(metrics.topProductRevenue) / totalRevenue) * 100).toFixed(0)
          : '0';
        
        if (parseFloat(topPercent) > 70) {
          recs += `3. **Warning: Revenue Concentration Risk** (High Impact)\n`;
          recs += `   "${metrics.topProduct}" accounts for ${topPercent}% of revenue. Diversify.\n`;
          recs += `   → Launch new products, cross-sell other items, and reduce dependency on single product.\n\n`;
        } else {
          recs += `3. **Opportunity: Scale Top Performers** (High Impact)\n`;
          recs += `   "${metrics.topProduct}" generates $${metrics.topProductRevenue} (${topPercent}% of revenue).\n`;
          recs += `   → Increase marketing budget for top products, create product bundles, and leverage for cross-selling.\n\n`;
        }
      }
      
      // Order volume
      if (totalOrders < 100) {
        recs += `4. **High Priority: Increase Order Volume** (High Impact)\n`;
        recs += `   ${totalOrders} orders indicates growth opportunity.\n`;
        recs += `   → Expand marketing channels, improve conversion rate, implement referral program, and test promotional campaigns.\n\n`;
      } else {
        recs += `4. **Optimization: Maintain Order Growth** (Medium Impact)\n`;
        recs += `   ${totalOrders} orders shows healthy activity.\n`;
        recs += `   → Focus on customer retention, implement loyalty programs, and optimize repeat purchase rate.\n\n`;
      }
      
      recs += `5. **Quick Win: Revenue Optimization Tactics** (Medium Impact)\n`;
      recs += `   Small improvements compound into significant revenue gains.\n`;
      recs += `   → Test dynamic pricing, implement cart abandonment recovery, create urgency with limited stock, and optimize checkout flow.`;
      
      return recs;
    }
    
    return '**Recommendations:** Data-driven insights will appear here once analysis is complete.';
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `You are an e-commerce analytics expert. Analyze this ${sectionType} data and provide 3-5 actionable recommendations.

${sectionType === 'traffic' ? `Traffic Metrics:
- Total Sessions: ${metrics.totalSessions}
- Unique Users: ${metrics.uniqueUsers}
- Bounce Rate: ${metrics.bounceRate}%
- Avg Pages/Session: ${metrics.avgPagesPerSession}
- Top Source: ${metrics.topSource} (${metrics.topSourcePercent}%)
- Mobile: ${metrics.mobilePercent}%, Desktop: ${metrics.desktopPercent}%
- Returning Rate: ${metrics.returningRate}%` : ''}

${sectionType === 'conversion' ? `Conversion Metrics:
- Conversion Rate: ${metrics.conversionRate}%
- Total Orders: ${metrics.totalOrders}
- Revenue: $${metrics.revenue}
- AOV: $${metrics.aov}
- Profit Margin: ${metrics.profitMargin}%
- New Visitor Conv: ${metrics.newConversionRate}%
- Returning Conv: ${metrics.returningConversionRate}%
- Top Source: ${metrics.topSource} (${metrics.topSourceConvRate}%)` : ''}

${sectionType === 'products' ? `Product Metrics:
- Total Products: ${metrics.totalProducts}
- Total Revenue: $${metrics.totalRevenue}
- Total Orders: ${metrics.totalOrders}
- Total Refunds: ${metrics.totalRefunds}
- Avg Refund Rate: ${metrics.avgRefundRate}%
- Top Product: ${metrics.topProduct} (${metrics.topProductPercent}% of revenue, $${metrics.topProductRevenue})` : ''}

${sectionType === 'refund' ? `Refund Metrics:
- Total Refunds: $${metrics.totalRefunds}
- Refund Rate: ${metrics.refundRate}%
- Refund Count: ${metrics.refundCount}
- Avg Refund Value: $${metrics.avgRefundValue}
- Top Refunded Product: ${metrics.topRefundedProduct} ($${metrics.topRefundedAmount})` : ''}

${sectionType === 'revenue' ? `Revenue Metrics:
- Total Revenue: $${metrics.totalRevenue}
- Net Revenue: $${metrics.netRevenue}
- Total Orders: ${metrics.totalOrders}
- AOV: $${metrics.aov}
- Top Product: ${metrics.topProduct} ($${metrics.topProductRevenue})` : ''}

Key Insights:
${Object.entries(insights).map(([key, value]) => `- ${key}: ${value.message}`).join('\n')}

Provide recommendations in this exact format:
1. **[Priority Level]: [Action Title]** ([Impact Level])
   Brief explanation of the issue and why it matters.
   → Specific action step to take.

Priority Levels: Critical, High Priority, Medium Priority, Quick Win
Impact Levels: High Impact, Medium Impact, Low Impact

Focus on actionable, specific recommendations that a CEO can delegate immediately. Be concise but insightful.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        setRecommendations(data.content[0].text);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('AI Recommendations error:', err);
      
      // Use smart fallback instead of showing error
      setRecommendations(generateFallbackRecommendations(sectionType, metrics));
      
      // Show subtle error indicator but don't break the UI
      setError('Using rule-based recommendations (AI unavailable)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load fallback immediately while trying AI
    setRecommendations(generateFallbackRecommendations(sectionType, metrics));
    
    // Then try to get AI recommendations
    const timer = setTimeout(() => {
      generateRecommendations();
    }, 500);

    return () => clearTimeout(timer);
  }, [sectionType]);

  const handleRetry = () => {
    generateRecommendations();
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/5 to-blue-500/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display text-foreground">AI-Powered Recommendations</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Analyzing with Claude AI...' : error ? 'Rule-based analysis' : 'Analyzed by Claude AI'}
            </p>
          </div>
        </div>
        
        {error && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-sm text-purple-400"
          >
            <RefreshCw className="w-3 h-3" />
            Retry AI
          </button>
        )}
      </div>

      {loading && !recommendations && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="ml-3 text-sm text-muted-foreground">Analyzing your data...</span>
        </div>
      )}

      {recommendations && (
        <div className="prose prose-sm max-w-none">
          <div className="text-foreground whitespace-pre-wrap leading-relaxed">
            {recommendations.split('\n').map((line, index) => {
              // Format numbered items
              if (line.match(/^\d+\./)) {
                return (
                  <div key={index} className="mb-4 mt-4">
                    <p className="font-semibold text-foreground">{line}</p>
                  </div>
                );
              }
              // Format arrow items (action steps)
              if (line.trim().startsWith('→')) {
                return (
                  <div key={index} className="ml-6 mb-2">
                    <p className="text-sm text-blue-400">{line}</p>
                  </div>
                );
              }
              // Format explanation text
              if (line.trim() && !line.includes('**')) {
                return (
                  <div key={index} className="ml-6 mb-2">
                    <p className="text-sm text-muted-foreground">{line}</p>
                  </div>
                );
              }
              // Headers
              if (line.includes('**')) {
                return (
                  <div key={index} className="mb-2">
                    <p className="font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>
                  </div>
                );
              }
              return <div key={index} className="h-2" />;
            })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          {error 
            ? 'Recommendations are based on industry best practices and your current metrics'
            : 'Recommendations are AI-generated based on your data and industry best practices'}
        </p>
      </div>
    </div>
  );
};

export default AIRecommendations;