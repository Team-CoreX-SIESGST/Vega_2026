import { useState, useEffect, useMemo, useCallback } from "react";
import {
  cleanOrdersData,
  cleanOrderItemsData,
  cleanRefundsData,
  cleanProductsData,
  cleanSessionsData,
  cleanPageviewsData,
  aggregateRevenueByMonth,
  aggregateRevenueByYear,
  calculateTotalRevenue,
  calculateTotalRefunds,
  calculateRefundRate,
  calculateAOV,
  getRefundsByProduct,
  getOrdersByProduct,
  sortByDate,
} from "@/utils/dataCleaners";

// Import JSON data
import ordersRaw from "../../public/data/orders.json";
import orderItemsRaw from "../../public/data/order_items.json";
import refundsRaw from "../../public/data/order_item_refunds.json";
import productsRaw from "../../public/data/products.json";
import sessionsRaw from "../../public/data/website_sessions.json";
import pageviewsRaw from "../../public/data/website_pageviews.json";

// Helper function to extract date from created_at
const extractDate = (timestamp) => {
  if (!timestamp) return null;
  const strTimestamp = String(timestamp);
  return strTimestamp.split(" ")[0]; // Gets YYYY-MM-DD from YYYY-MM-DD HH:MM:SS
};

// Pre-sort and clean static data once
const preSortedOrders = sortByDate(ordersRaw);
const preSortedOrderItems = sortByDate(orderItemsRaw);
const preSortedRefunds = sortByDate(refundsRaw);
const preSortedProducts = sortByDate(productsRaw);
const preSortedSessions = sortByDate(sessionsRaw);
const preSortedPageviews = sortByDate(pageviewsRaw);

// Add date field to each data point
const preSortedOrdersWithDate = preSortedOrders.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

const preSortedOrderItemsWithDate = preSortedOrderItems.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

const preSortedRefundsWithDate = preSortedRefunds.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

const preSortedProductsWithDate = preSortedProducts.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

const preSortedSessionsWithDate = preSortedSessions.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

const preSortedPageviewsWithDate = preSortedPageviews.map((item) => ({
  ...item,
  created_at_date: extractDate(item.created_at),
}));

// Get date range from data
const getMinMaxDate = (data) => {
  if (!data || data.length === 0)
    return { min: "2012-01-01", max: "2012-12-31" };

  const dates = data.map((item) => item.created_at_date).filter(Boolean);
  if (dates.length === 0) return { min: "2012-01-01", max: "2012-12-31" };

  return {
    min: dates[0],
    max: dates[dates.length - 1],
  };
};

// Get available date range from all datasets
const getOverallDateRange = () => {
  const ordersRange = getMinMaxDate(preSortedOrdersWithDate);
  const sessionsRange = getMinMaxDate(preSortedSessionsWithDate);

  // Find the overall min and max dates
  const allMinDates = [ordersRange.min, sessionsRange.min].filter(Boolean);
  const allMaxDates = [ordersRange.max, sessionsRange.max].filter(Boolean);

  return {
    min: allMinDates.sort()[0],
    max: allMaxDates.sort().reverse()[0],
  };
};

const useDashboardData = (activeSection = "overview") => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    // Set initial date range from overall data
    const range = getOverallDateRange();
    return { startDate: range.min, endDate: range.max };
  });

  // Get total date range for display
  const totalDateRange = useMemo(() => {
    return getOverallDateRange();
  }, []);

  // Create lookup maps for efficient filtering
  const orderLookupMaps = useMemo(() => {
    // Create maps for quick lookups
    const orderIdToSessionId = new Map();
    const sessionIdToOrderIds = new Map();

    preSortedOrdersWithDate.forEach((order) => {
      orderIdToSessionId.set(order.order_id, order.website_session_id);

      if (!sessionIdToOrderIds.has(order.website_session_id)) {
        sessionIdToOrderIds.set(order.website_session_id, new Set());
      }
      sessionIdToOrderIds.get(order.website_session_id).add(order.order_id);
    });

    return { orderIdToSessionId, sessionIdToOrderIds };
  }, []);

  // Filter data by date range
  const filterDataByDateRange = useCallback((data, startDate, endDate) => {
    return data.filter((item) => {
      const itemDate = item.created_at_date;
      if (!itemDate) return false;
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, []);

  // Clean and process data with optimization
  const processedData = useMemo(() => {
    try {
      console.time("Data processing");

      let orders, orderItems, refunds, products, sessions, pageviews;

      if (activeSection === "traffic" || activeSection === "conversion") {
        // For traffic and conversion sections, filter sessions by date
        // This ensures we get ALL sessions (both converting and non-converting)
        // which is necessary for accurate conversion rate calculations
        const filteredSessions = filterDataByDateRange(
          preSortedSessionsWithDate,
          dateRange.startDate,
          dateRange.endDate
        ).slice(0, 500000); // Limit to 500000 rows

        // Get session IDs from filtered sessions
        const sessionIds = new Set(
          filteredSessions.map((s) => s.website_session_id)
        );

        // Get orders for these sessions using the lookup map
        const orderIds = new Set();
        sessionIds.forEach((sessionId) => {
          const ordersForSession =
            orderLookupMaps.sessionIdToOrderIds.get(sessionId);
          if (ordersForSession) {
            ordersForSession.forEach((orderId) => orderIds.add(orderId));
          }
        });

        // Filter related data efficiently
        const ordersFiltered = preSortedOrdersWithDate.filter((order) =>
          orderIds.has(order.order_id)
        );
        const orderItemsFiltered = preSortedOrderItemsWithDate.filter((item) =>
          orderIds.has(item.order_id)
        );
        const refundsFiltered = preSortedRefundsWithDate.filter((refund) =>
          orderIds.has(refund.order_id)
        );
        const pageviewsFiltered = preSortedPageviewsWithDate.filter((pv) =>
          sessionIds.has(pv.website_session_id)
        );

        orders = cleanOrdersData(ordersFiltered);
        orderItems = cleanOrderItemsData(orderItemsFiltered);
        refunds = cleanRefundsData(refundsFiltered);
        products = cleanProductsData(preSortedProductsWithDate);
        sessions = cleanSessionsData(filteredSessions);
        pageviews = cleanPageviewsData(pageviewsFiltered);
      } else {
        // For other sections, filter orders by date
        const filteredOrders = filterDataByDateRange(
          preSortedOrdersWithDate,
          dateRange.startDate,
          dateRange.endDate
        ).slice(0, 500000); // Limit to 500000 rows

        // Get order IDs and session IDs from filtered orders
        const orderIds = new Set(filteredOrders.map((o) => o.order_id));
        const sessionIds = new Set(
          filteredOrders.map((o) => o.website_session_id)
        );

        // Filter related data efficiently
        const orderItemsFiltered = preSortedOrderItemsWithDate.filter((item) =>
          orderIds.has(item.order_id)
        );
        const refundsFiltered = preSortedRefundsWithDate.filter((refund) =>
          orderIds.has(refund.order_id)
        );
        const sessionsFiltered = preSortedSessionsWithDate.filter((session) =>
          sessionIds.has(session.website_session_id)
        );
        const pageviewsFiltered = preSortedPageviewsWithDate.filter((pv) =>
          sessionIds.has(pv.website_session_id)
        );

        orders = cleanOrdersData(filteredOrders);
        orderItems = cleanOrderItemsData(orderItemsFiltered);
        refunds = cleanRefundsData(refundsFiltered);
        products = cleanProductsData(preSortedProductsWithDate);
        sessions = cleanSessionsData(sessionsFiltered);
        pageviews = cleanPageviewsData(pageviewsFiltered);
      }

      console.timeEnd("Data processing");
      console.log("Data processed successfully:", {
        orders: orders.length,
        orderItems: orderItems.length,
        refunds: refunds.length,
        products: products.length,
        sessions: sessions.length,
        pageviews: pageviews.length,
      });

      return { orders, orderItems, refunds, products, sessions, pageviews };
    } catch (err) {
      console.error("Error processing data:", err);
      setError(err.message || "Failed to process data");
      return {
        orders: [],
        orderItems: [],
        refunds: [],
        products: [],
        sessions: [],
        pageviews: [],
      };
    }
  }, [dateRange, activeSection, orderLookupMaps, filterDataByDateRange]);

  const { orders, orderItems, refunds, products, sessions, pageviews } =
    processedData;

  // Calculate metrics
  const metrics = useMemo(() => {
    try {
      const totalRevenue = calculateTotalRevenue(orders);
      const totalRefunds = calculateTotalRefunds(refunds);
      const refundRate = calculateRefundRate(orders, refunds);
      const aov = calculateAOV(orders);

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalRefunds,
        refundRate,
        aov,
        netRevenue: totalRevenue - totalRefunds,
        totalSessions: sessions.length,
        totalPageviews: pageviews.length,
        totalProducts: products.length,
      };
    } catch (err) {
      console.error("Error calculating metrics:", err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalRefunds: 0,
        refundRate: 0,
        aov: 0,
        netRevenue: 0,
        totalSessions: 0,
        totalPageviews: 0,
        totalProducts: 0,
      };
    }
  }, [orders, refunds, sessions, pageviews, products.length]);

  // Aggregate data for charts - memoized separately
  const revenueByMonth = useMemo(() => {
    return aggregateRevenueByMonth(orders);
  }, [orders]);

  const revenueByYear = useMemo(() => {
    return aggregateRevenueByYear(orders);
  }, [orders]);

  const refundsByProduct = useMemo(() => {
    return getRefundsByProduct(refunds, orderItems, products);
  }, [refunds, orderItems, products]);

  const ordersByProduct = useMemo(() => {
    return getOrdersByProduct(orderItems, products);
  }, [orderItems, products]);

  // Handle section changes
  useEffect(() => {
    setIsLoading(true);
    // Reset to overall date range when section changes
    requestAnimationFrame(() => {
      const range = getOverallDateRange();
      setDateRange({ startDate: range.min, endDate: range.max });
      setIsLoading(false);
    });
  }, [activeSection]);

  // Handle date range changes
  const handleDateRangeChange = (startDate, endDate) => {
    setIsLoading(true);
    requestAnimationFrame(() => {
      setDateRange({ startDate, endDate });
      setIsLoading(false);
    });
  };

  // Get current date range display text
  const getCurrentDateRangeDisplay = useCallback(() => {
    return {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      totalStartDate: totalDateRange.min,
      totalEndDate: totalDateRange.max,
      records: {
        orders: orders.length,
        sessions: sessions.length,
        refunds: refunds.length,
      },
    };
  }, [
    dateRange,
    totalDateRange,
    orders.length,
    sessions.length,
    refunds.length,
  ]);

  return {
    // Raw cleaned data
    orders,
    orderItems,
    refunds,
    products,
    sessions,
    pageviews,

    // Calculated metrics
    metrics,

    // Aggregated data for charts
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,

    // State
    isLoading,
    error,

    // Date range controls
    dateRange,
    setDateRange: handleDateRangeChange,
    totalDateRange,
    getCurrentDateRangeDisplay,
  };
};

export default useDashboardData;
