export const safeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = typeof value === "string" ? parseFloat(value) : Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

// Safe date parser
export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
};

// Normalize string values (handle case variations and null values)
export const normalizeString = (value) => {
  if (!value) return null;

  const strValue = String(value).trim();

  // Check for null-like values
  const nullValues = [
    "nan",
    "null",
    "undefined",
    "none",
    "n/a",
    "na",
    "nan_ads",
  ];
  if (nullValues.includes(strValue.toLowerCase())) {
    return null;
  }

  // Return empty string as null
  if (strValue === "") return null;

  // Normalize to lowercase for consistency
  return strValue.toLowerCase();
};

// Normalize UTM source (handle variations like gsearch, Gsearch, GSEARCH)
export const normalizeUtmSource = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return "direct";

  // Map common variations to standard names
  const sourceMap = {
    gsearch: "gsearch",
    bsearch: "bsearch",
    socialbook: "socialbook",
    // Add more mappings as needed
  };

  return sourceMap[normalized] || normalized;
};

// Normalize UTM campaign
export const normalizeUtmCampaign = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return "none";

  // Map common variations
  const campaignMap = {
    nonbrand: "nonbrand",
    brand: "brand",
    // Add more mappings as needed
  };

  return campaignMap[normalized] || normalized;
};

// Normalize device type
export const normalizeDeviceType = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return "unknown";

  // Standardize device types
  const deviceMap = {
    desktop: "desktop",
    mobile: "mobile",
    tablet: "tablet",
    // Add more mappings as needed
  };

  return deviceMap[normalized] || "unknown";
};

// Clean orders data with date extraction
export const cleanOrdersData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  const sortedData = sortByDate(rawData);
  
  return sortedData
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const obj = item;
      // Keep created_at as string for consistency with sessions
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;
      
      // Extract date part from timestamp
      const createdDate = createdAt.split(' ')[0];
      
      return {
        order_id: String(obj.order_id || ''),
        created_at: createdAt,
        created_at_date: createdDate, // Add date field
        website_session_id: String(obj.website_session_id || ''),
        user_id: String(obj.user_id || ''),
        primary_product_id: String(obj.primary_product_id || ''),
        items_purchased: safeNumber(obj.items_purchased),
        price_usd: safeNumber(obj.price_usd),
        cogs_usd: safeNumber(obj.cogs_usd),
      };
    })
    .filter((item) => item !== null);
};


// Clean order items data
export const cleanOrderItemsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  const limitedData = rawData.slice(0, 500000);

  return limitedData
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const obj = item;
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;

      // Extract date part from timestamp
      const createdDate = createdAt.split(' ')[0];

      return {
        order_item_id: String(obj.order_item_id || ""),
        created_at: createdAt,
        created_at_date: createdDate, // Add date field
        order_id: String(obj.order_id || ""),
        product_id: String(obj.product_id || ""),
        is_primary_item: String(obj.is_primary_item) === "1",
        price_usd: safeNumber(obj.price_usd),
        cogs_usd: safeNumber(obj.cogs_usd),
      };
    })
    .filter((item) => item !== null);
};

// Clean refunds data
export const cleanRefundsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  // Limit to 500000 rows for safety
  const limitedData = rawData.slice(0, 500000);

  return limitedData
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const obj = item;
      // Keep created_at as string for consistency
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;

      return {
        order_item_refund_id: String(obj.order_item_refund_id || ""),
        created_at: createdAt,
        order_item_id: String(obj.order_item_id || ""),
        order_id: String(obj.order_id || ""),
        refund_amount_usd: safeNumber(obj.refund_amount_usd),
      };
    })
    .filter((item) => item !== null);
};

// Clean products data
export const cleanProductsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  // Limit to 500000 rows for safety
  const limitedData = rawData.slice(0, 500000);

  return limitedData
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const obj = item;
      // Keep created_at as string for consistency
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;

      return {
        product_id: String(obj.product_id || ""),
        created_at: createdAt,
        product_name: String(obj.product_name || "Unknown Product"),
      };
    })
    .filter((item) => item !== null);
};

// Clean sessions data with normalization
export const cleanSessionsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  // Limit to 500000 rows for safety
  const limitedData = rawData.slice(0, 500000);

  return limitedData
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const obj = item;
      // Keep as string format for consistency across all data
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;

      return {
        website_session_id: String(obj.website_session_id || ""),
        created_at: createdAt,
        user_id: String(obj.user_id || ""),
        is_repeat_session: String(obj.is_repeat_session || "0"),
        utm_source: normalizeUtmSource(obj.utm_source),
        utm_campaign: normalizeUtmCampaign(obj.utm_campaign),
        utm_content: normalizeString(obj.utm_content) || "",
        device_type: normalizeDeviceType(obj.device_type),
        http_referer: String(obj.http_referer || ""),
      };
    })
    .filter((item) => item !== null);
};

// Clean pageviews data
export const cleanPageviewsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  // Limit to 500000 rows for safety
  const limitedData = rawData.slice(0, 500000);

  return limitedData
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const obj = item;
      // Keep as string format for consistency
      const createdAt = obj.created_at ? String(obj.created_at) : null;
      if (!createdAt) return null;

      return {
        website_pageview_id: String(obj.website_pageview_id || ""),
        created_at: createdAt,
        website_session_id: String(obj.website_session_id || ""),
        pageview_url: normalizeString(obj.pageview_url) || "/",
      };
    })
    .filter((item) => item !== null);
};

// Aggregate revenue by month (requires Date objects)
export const aggregateRevenueByMonth = (orders) => {
  const grouped = new Map();

  // Take first 500000 orders to prevent excessive processing
  const limitedOrders = orders.slice(0, 500000);

  limitedOrders.forEach((order) => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const existing = grouped.get(monthKey) || { revenue: 0, orders: 0 };
    grouped.set(monthKey, {
      revenue: existing.revenue + order.price_usd,
      orders: existing.orders + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Aggregate revenue by year (requires Date objects)
export const aggregateRevenueByYear = (orders) => {
  const grouped = new Map();

  // Take first 500000 orders to prevent excessive processing
  const limitedOrders = orders.slice(0, 500000);

  limitedOrders.forEach((order) => {
    const date = new Date(order.created_at);
    const year = date.getFullYear();
    const existing = grouped.get(year) || { revenue: 0, orders: 0 };
    grouped.set(year, {
      revenue: existing.revenue + order.price_usd,
      orders: existing.orders + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
};

// Calculate refund rate
export const calculateRefundRate = (orders, refunds) => {
  if (orders.length === 0) return 0;
  return (refunds.length / orders.length) * 100;
};

// Calculate total revenue
export const calculateTotalRevenue = (orders) => {
  return orders.slice(0, 500000).reduce((sum, order) => sum + order.price_usd, 0);
};

// Calculate total refunds
export const calculateTotalRefunds = (refunds) => {
  return refunds
    .slice(0, 500000)
    .reduce((sum, refund) => sum + refund.refund_amount_usd, 0);
};

// Calculate AOV (Average Order Value)
export const calculateAOV = (orders) => {
  if (orders.length === 0) return 0;
  const limitedOrders = orders.slice(0, 500000);
  return calculateTotalRevenue(limitedOrders) / limitedOrders.length;
};

// Get refunds by product
export const getRefundsByProduct = (refunds, orderItems, products) => {
  const refundOrderItemIds = new Set(
    refunds.slice(0, 500000).map((r) => r.order_item_id)
  );

  const productRefunds = new Map();

  orderItems.slice(0, 500000).forEach((item) => {
    if (refundOrderItemIds.has(item.order_item_id)) {
      const refund = refunds.find(
        (r) => r.order_item_id === item.order_item_id
      );
      const existing = productRefunds.get(item.product_id) || {
        count: 0,
        amount: 0,
      };
      productRefunds.set(item.product_id, {
        count: existing.count + 1,
        amount: existing.amount + (refund?.refund_amount_usd || 0),
      });
    }
  });

  return Array.from(productRefunds.entries()).map(([productId, data]) => {
    const product = products.find((p) => p.product_id === productId);
    return {
      product: product?.product_name || `Product ${productId}`,
      refunds: data.count,
      amount: data.amount,
    };
  });
};

// Get orders by product
export const getOrdersByProduct = (orderItems, products) => {
  const productOrders = new Map();

  orderItems
    .slice(0, 500000)
    .filter((item) => item.is_primary_item)
    .forEach((item) => {
      const existing = productOrders.get(item.product_id) || {
        count: 0,
        revenue: 0,
      };
      productOrders.set(item.product_id, {
        count: existing.count + 1,
        revenue: existing.revenue + item.price_usd,
      });
    });

  return Array.from(productOrders.entries()).map(([productId, data]) => {
    const product = products.find((p) => p.product_id === productId);
    return {
      product: product?.product_name || `Product ${productId}`,
      orders: data.count,
      revenue: data.revenue,
    };
  });
};

// Format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

// Format large numbers
export const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};


// Add this helper function at the top
export const sortByDate = (data) => {
  return [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

// Add to your existing dataCleaners.js functions


// Similarly update other cleaning functions to include created_at_date:



// Do the same for cleanRefundsData, cleanProductsData, cleanSessionsData, and cleanPageviewsData
// by adding the created_at_date field in each
