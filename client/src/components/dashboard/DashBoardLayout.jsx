"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import Sidebar from "./Sidebar";
import {
  Bell,
  Search,
  Filter,
  Calendar,
  Database,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import ChatBot from "./ChatBot";
const DashboardLayout = ({
  children,
  activeSection,
  onSectionChange,
  dateRange,
  setDateRange,
  totalDateRange,
  getCurrentDateRangeDisplay,
  isLoading,
}) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Parse totalDateRange min/max to Date objects
  const minDate = totalDateRange?.min ? new Date(totalDateRange.min) : null;
  const maxDate = totalDateRange?.max ? new Date(totalDateRange.max) : null;

  // Load date range from localStorage on mount
  useEffect(() => {
    const savedDateRange = localStorage.getItem("dashboardDateRange");

    if (savedDateRange) {
      try {
        const parsedDateRange = JSON.parse(savedDateRange);
        const loadedStartDate = new Date(parsedDateRange.startDate);
        const loadedEndDate = new Date(parsedDateRange.endDate);

        // Ensure dates are within the available data range
        const clampedStartDate =
          minDate && loadedStartDate < minDate ? minDate : loadedStartDate;
        const clampedEndDate =
          maxDate && loadedEndDate > maxDate ? maxDate : loadedEndDate;

        setStartDate(clampedStartDate);
        setEndDate(clampedEndDate);

        // Update parent component
        if (setDateRange) {
          const startDateStr = format(clampedStartDate, "yyyy-MM-dd");
          const endDateStr = format(clampedEndDate, "yyyy-MM-dd");
          setDateRange(startDateStr, endDateStr);
        }
      } catch (error) {
        console.error("Error parsing saved date range:", error);
        setDefaultDateRange();
      }
    } else {
      setDefaultDateRange();
    }
  }, []);

  // Set default date range based on available data
  const setDefaultDateRange = () => {
    let defaultStartDate, defaultEndDate;

    if (minDate && maxDate) {
      // If we have data range, set to the last 30 days of data or the whole range if less than 30 days
      const thirtyDaysAgo = subDays(maxDate, 29);
      defaultStartDate = thirtyDaysAgo > minDate ? thirtyDaysAgo : minDate;
      defaultEndDate = maxDate;
    } else {
      // Fallback to current month if no data range
      const today = new Date();
      defaultStartDate = startOfMonth(today);
      defaultEndDate = endOfMonth(today);
    }

    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    saveDateRangeToStorage(defaultStartDate, defaultEndDate);

    if (setDateRange) {
      const startDateStr = format(defaultStartDate, "yyyy-MM-dd");
      const endDateStr = format(defaultEndDate, "yyyy-MM-dd");
      setDateRange(startDateStr, endDateStr);
    }
  };

  // Save date range to localStorage
  const saveDateRangeToStorage = (start, end) => {
    const dateRangeToSave = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
    localStorage.setItem("dashboardDateRange", JSON.stringify(dateRangeToSave));
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    if (!date) return;

    // Clamp date to available data range
    const clampedStart = minDate && date < minDate ? minDate : date;
    // Ensure start date is not after end date
    const finalStartDate =
      endDate && clampedStart > endDate ? endDate : clampedStart;

    setStartDate(finalStartDate);

    // If we have both dates, save and update parent
    if (endDate) {
      saveDateRangeToStorage(finalStartDate, endDate);

      if (setDateRange) {
        const startDateStr = format(finalStartDate, "yyyy-MM-dd");
        const endDateStr = format(endDate, "yyyy-MM-dd");
        setDateRange(startDateStr, endDateStr);
      }
    }
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    if (!date) return;

    // Clamp date to available data range
    const clampedEnd = maxDate && date > maxDate ? maxDate : date;
    // Ensure end date is not before start date
    const finalEndDate =
      startDate && clampedEnd < startDate ? startDate : clampedEnd;

    setEndDate(finalEndDate);

    // If we have both dates, save and update parent
    if (startDate) {
      saveDateRangeToStorage(startDate, finalEndDate);

      if (setDateRange) {
        const startDateStr = format(startDate, "yyyy-MM-dd");
        const endDateStr = format(finalEndDate, "yyyy-MM-dd");
        setDateRange(startDateStr, endDateStr);
      }
    }
  };

  // Quick date range presets - adjusted to respect data range
  const getQuickDatePresets = () => {
    if (!maxDate) return [];

    const today = maxDate; // Use maxDate as "today" since data ends there
    const dataRangeStart = minDate || subDays(today, 365); // Default to 1 year back if no min

    const presets = [
      {
        label: "Last 7 days",
        getRange: () => {
          const startDate = subDays(today, 6);
          return {
            startDate: startDate > dataRangeStart ? startDate : dataRangeStart,
            endDate: today,
          };
        },
      },
      {
        label: "Last 30 days",
        getRange: () => {
          const startDate = subDays(today, 29);
          return {
            startDate: startDate > dataRangeStart ? startDate : dataRangeStart,
            endDate: today,
          };
        },
      },
      {
        label: "Last 90 days",
        getRange: () => {
          const startDate = subDays(today, 89);
          return {
            startDate: startDate > dataRangeStart ? startDate : dataRangeStart,
            endDate: today,
          };
        },
      },
      {
        label: "This Month",
        getRange: () => {
          const start = startOfMonth(today);
          const end = endOfMonth(today);
          return {
            startDate: start > dataRangeStart ? start : dataRangeStart,
            endDate: end > today ? today : end,
          };
        },
      },
    ];

    // Only add "Last Month" if we have data from last month
    const lastMonthStart = startOfMonth(subDays(today, 30));
    const lastMonthEnd = endOfMonth(subDays(today, 30));
    if (lastMonthEnd > dataRangeStart) {
      presets.push({
        label: "Last Month",
        getRange: () => ({
          startDate:
            lastMonthStart > dataRangeStart ? lastMonthStart : dataRangeStart,
          endDate: lastMonthEnd > today ? today : lastMonthEnd,
        }),
      });
    }

    // Add "All Time" if we have a specific data range
    if (minDate) {
      presets.push({
        label: "All Time",
        getRange: () => ({
          startDate: minDate,
          endDate: maxDate,
        }),
      });
    }

    return presets;
  };

  const applyQuickDateRange = (preset) => {
    const { startDate: presetStartDate, endDate: presetEndDate } =
      preset.getRange();

    // Ensure dates are valid
    const validStartDate =
      presetStartDate && !isNaN(presetStartDate.getTime())
        ? presetStartDate
        : minDate;
    const validEndDate =
      presetEndDate && !isNaN(presetEndDate.getTime())
        ? presetEndDate
        : maxDate;

    if (validStartDate && validEndDate) {
      setStartDate(validStartDate);
      setEndDate(validEndDate);
      saveDateRangeToStorage(validStartDate, validEndDate);

      if (setDateRange) {
        const startDateStr = format(validStartDate, "yyyy-MM-dd");
        const endDateStr = format(validEndDate, "yyyy-MM-dd");
        setDateRange(startDateStr, endDateStr);
      }
    }
  };

  // Get user initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    if (!date || isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMM dd, yyyy");
  };

  const dateRangeDisplay = getCurrentDateRangeDisplay
    ? getCurrentDateRangeDisplay()
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-72 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div> */}

              {/* Date Range Selector - Only show for non-AI sections */}
              {dateRange && activeSection !== "ask_ai" && (
                <div className="flex items-center gap-3">
                  {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">
                      Date Range:
                    </span>
                  </div> */}

                  <div className="flex items-center gap-2">
                    {/* From Date Picker */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-4">
                          From:
                        </span>
                        <DatePicker
                          selected={startDate}
                          onChange={handleStartDateChange}
                          minDate={minDate}
                          maxDate={endDate || maxDate}
                          disabled={isLoading}
                          dateFormat="MMM dd, yyyy"
                          className="pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[140px] cursor-pointer"
                          popperClassName="z-50"
                          popperPlacement="bottom-start"
                          calendarClassName="bg-card border border-border rounded-lg shadow-lg"
                          renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                          }) => (
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                              <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4 rotate-90" />
                              </button>
                              <span className="font-medium">
                                {format(date, "MMMM yyyy")}
                              </span>
                              <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4 -rotate-90" />
                              </button>
                            </div>
                          )}
                        />
                        <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* To Date Picker */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-4">
                          To:
                        </span>
                        <DatePicker
                          selected={endDate}
                          onChange={handleEndDateChange}
                          minDate={startDate || minDate}
                          maxDate={maxDate}
                          disabled={isLoading}
                          dateFormat="MMM dd, yyyy"
                          className="pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[140px] cursor-pointer"
                          popperClassName="z-50"
                          popperPlacement="bottom-start"
                          calendarClassName="bg-card border border-border rounded-lg shadow-lg"
                          renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                          }) => (
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                              <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4 rotate-90" />
                              </button>
                              <span className="font-medium">
                                {format(date, "MMMM yyyy")}
                              </span>
                              <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4 -rotate-90" />
                              </button>
                            </div>
                          )}
                        />
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Quick Date Presets Dropdown */}
                    <div className="relative group">
                      {/* <button
                        disabled={isLoading || !maxDate}
                        className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Quick Ranges
                        <ChevronDown className="w-3 h-3" />
                      </button> */}
                      <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {getQuickDatePresets().map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => applyQuickDateRange(preset)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      <span>
                        {formatDateDisplay(startDate)} to{" "}
                        {formatDateDisplay(endDate)}
                      </span>
                      {dateRangeDisplay && (
                        <>
                          <span className="mx-1">•</span>
                          <Database className="w-3 h-3" />
                          <span>
                            {activeSection === "traffic"
                              ? `${
                                  dateRangeDisplay.records?.sessions || 0
                                } sessions`
                              : `${
                                  dateRangeDisplay.records?.orders || 0
                                } orders`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-medium text-primary-foreground">
                  {user ? getInitials(user.name) : "U"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
        {/* <ChatBot /> */}
      </div>
    </div>
  );
};

export default DashboardLayout;
