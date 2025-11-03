import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import { ChevronDownIcon, RefreshCw, Edit2 } from "lucide-react";
import { cn } from "../../utils";
import { analyticsSnapshotService, type AnalyticsSnapshot } from "../../services/analytics-snapshot.service";
import { analyticsService } from "../../services/analytics.service";
import { transactionService } from "../../services/transaction.service";
import EditMetricModal from "./components/EditMetricModal";
import AnalysisReport from "./components/AnalysisReport";
import DateRangePicker from "../../components/ui/DateRangePicker";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface MetricCard {
  metric: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percentage";
  snapshot?: AnalyticsSnapshot;
}

const AdminHomePage = () => {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // Last 7 days
    return {
      start,
      end,
      label: "Last 7 days",
    };
  });
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [dateRangePickerPosition, setDateRangePickerPosition] = useState({ top: 0, left: 0 });
  const dateRangeButtonRef = useRef<HTMLButtonElement>(null);
  const dateRangePickerRef = useRef<HTMLDivElement>(null);
  // Entry method dropdown removed; default view uses daily totals
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [calculatedAnalytics, setCalculatedAnalytics] = useState<any>(null);
  const [transactionCounts, setTransactionCounts] = useState<{
    successful: number;
    failed: number;
    newCustomers: number;
  }>({ successful: 0, failed: 0, newCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);

  const metrics: MetricCard[] = [
    {
      metric: "gross_volume",
      label: "Gross Volume",
      value: 0,
      format: "currency",
    },
    {
      metric: "net_volume",
      label: "Net Volume",
      value: 0,
      format: "currency",
    },
    {
      metric: "new_customers",
      label: "New Customers",
      value: 0,
      format: "number",
    },
    {
      metric: "successful_payments",
      label: "Orders / Successful Payments",
      value: 0,
      format: "number",
    },
    {
      metric: "failed_payments",
      label: "Failed Payments",
      value: 0,
      format: "number",
    },
    {
      metric: "conversion_rate",
      label: "Conversion Rate",
      value: 0,
      format: "percentage",
    },
    {
      metric: "average_order_value",
      label: "Average Order Value",
      value: 0,
      format: "currency",
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Normalize dates
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      // Fetch snapshots for the date range - this will include ALL snapshots (manual entries) in the range
      const snapshotResponse = await analyticsSnapshotService.getByDateRange(
        startDate,
        endDate
      );
      setSnapshots(snapshotResponse.data);

      // Fetch calculated analytics for the date range
      const analyticsResponse = await analyticsService.getAnalytics(
        "custom",
        "daily",
        startDate,
        endDate,
        "previous_period"
      );
      setCalculatedAnalytics(analyticsResponse.data);

      // Fetch actual transaction counts for accurate metrics
      const [successfulRes, failedRes] = await Promise.all([
        transactionService.getAll(1, 1, {
          status: "succeeded",
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
        }),
        transactionService.getAll(1, 1, {
          status: "failed",
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
        }),
      ]);

      setTransactionCounts({
        successful: successfulRes.data.total || 0,
        failed: failedRes.data.total || 0,
        newCustomers: analyticsResponse.data.newCustomers?.current || 0,
      });
    } catch (err) {
      setError("Failed to load analytics data. Please try again.");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const updateDateRangePosition = () => {
    if (dateRangeButtonRef.current) {
      const rect = dateRangeButtonRef.current.getBoundingClientRect();
      setDateRangePickerPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  // Removed entry method and hour dropdown positioning

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Date range picker
      if (
        dateRangePickerRef.current &&
        !dateRangePickerRef.current.contains(event.target as Node) &&
        dateRangeButtonRef.current &&
        !dateRangeButtonRef.current.contains(event.target as Node)
      ) {
        setDateRangePickerOpen(false);
      }
      // Entry method and hour dropdown removed
    };

    const handleScroll = () => {
      if (dateRangePickerOpen) updateDateRangePosition();
      // Removed
    };

    const handleResize = () => {
      if (dateRangePickerOpen) updateDateRangePosition();
      // Removed
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [dateRangePickerOpen]);

  // Removed selected hour logic

  const getMetricValue = (metric: string): number => {
    // Filter manual snapshots for this metric within the date range
    const manualSnapshots = snapshots.filter(
      (s) => s.metric === metric && s.source === "manual"
    );

    // Get date range boundaries
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    // Create a map of dates that have manual entries (key: date string, value: snapshot)
    const manualEntryMap = new Map<string, typeof snapshots[0]>();
    manualSnapshots.forEach((s) => {
      const snapshotDate = new Date(s.date);
      snapshotDate.setHours(0, 0, 0, 0);
      const dateKey = snapshotDate.toISOString().split("T")[0];
      manualEntryMap.set(dateKey, s);
    });

    {
      // Calculate all days in the range
      const daysInRange: string[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        daysInRange.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Get calculated total for the range (used for days without manual entries)
    let calculatedTotal = 0;
    if (calculatedAnalytics) {
      switch (metric) {
        case "gross_volume":
          calculatedTotal = calculatedAnalytics.grossVolume?.current || 0;
          break;
        case "net_volume":
          calculatedTotal = calculatedAnalytics.netVolume?.current || 0;
          break;
        case "new_customers":
          calculatedTotal = calculatedAnalytics.newCustomers?.current || 0;
          break;
        case "successful_payments":
          calculatedTotal = transactionCounts.successful;
          break;
        case "failed_payments":
          calculatedTotal = transactionCounts.failed;
          break;
        case "conversion_rate":
          const totalSuccessful = transactionCounts.successful;
          const totalFailed = transactionCounts.failed;
          const totalTransactions = totalSuccessful + totalFailed;
          calculatedTotal = totalTransactions > 0 ? (totalSuccessful / totalTransactions) * 100 : 0;
          break;
        case "average_order_value":
          const grossVolume = calculatedAnalytics.grossVolume?.current || 0;
          const successfulCount = transactionCounts.successful;
          calculatedTotal = successfulCount > 0 ? grossVolume / successfulCount : 0;
          break;
      }
    }

      // Count days with and without manual entries
        const daysWithoutManual = daysInRange.filter((day) => !manualEntryMap.has(day));

      // If all days have manual entries, just sum manual values
      if (daysWithoutManual.length === 0) {
        const total = manualSnapshots.reduce((sum, s) => sum + s.value, 0);
        // For number format metrics (counts), round to nearest integer
        if (metric === "successful_payments" || metric === "failed_payments" || metric === "new_customers") {
          return Math.round(total);
        }
        return total;
      }

      // If some days have manual entries and some don't, we need to mix them
      // Calculate average per day from calculated total
      const daysCount = daysInRange.length;
      const averagePerDay = daysCount > 0 ? calculatedTotal / daysCount : 0;

      // Sum manual entries
      const manualTotal = manualSnapshots.reduce((sum, s) => sum + s.value, 0);

      // For days without manual entries, use the average per day
      const calculatedPart = averagePerDay * daysWithoutManual.length;

      // Total = manual entries + calculated values for remaining days
      // Round to avoid floating point precision issues for number format metrics
      const result = manualTotal + calculatedPart;
      
      // For number format metrics (counts), round to nearest integer
      if (metric === "successful_payments" || metric === "failed_payments" || metric === "new_customers") {
        return Math.round(result);
      }
      
      return result;
    }

    // No manual entries - use calculated value from analytics
    if (!calculatedAnalytics) return 0;

    switch (metric) {
      case "gross_volume":
        return calculatedAnalytics.grossVolume?.current || 0;
      case "net_volume":
        return calculatedAnalytics.netVolume?.current || 0;
      case "new_customers":
        return calculatedAnalytics.newCustomers?.current || 0;
        case "successful_payments":
          // Use actual transaction count instead of limited payments array
          // Return as integer to avoid floating point issues
          return Math.round(transactionCounts.successful);
        case "failed_payments":
          // Use actual transaction count instead of limited failedPayments array
          // Return as integer to avoid floating point issues
          return Math.round(transactionCounts.failed);
      case "conversion_rate":
        // Calculate conversion rate for the range using actual counts
        const totalSuccessful = transactionCounts.successful;
        const totalFailed = transactionCounts.failed;
        const totalTransactions = totalSuccessful + totalFailed;
        return totalTransactions > 0 ? (totalSuccessful / totalTransactions) * 100 : 0;
      case "average_order_value":
        // Calculate from gross volume and successful payments count
        const grossVolume = calculatedAnalytics.grossVolume?.current || 0;
        const successfulCount = transactionCounts.successful;
        return successfulCount > 0 ? grossVolume / successfulCount : 0;
      default:
        return 0;
    }
  };

  const getMetricSource = (metric: string): "calculated" | "manual" => {
    const manualSnapshots = snapshots.filter(
      (s) => s.metric === metric && s.source === "manual"
    );
    return manualSnapshots.length > 0 ? "manual" : "calculated";
  };

  const formatValue = (value: number, format: string): string => {
    // Handle NaN and Infinity
    if (!isFinite(value)) {
      return "0";
    }

    switch (format) {
      case "currency":
        // toFixed(2) already handles rounding properly
        return `$${value.toFixed(2)}`;
      case "percentage":
        // toFixed(2) already handles rounding properly
        return `${value.toFixed(2)}%`;
      case "number":
      default:
        // Round to nearest integer for number format to avoid floating point precision issues
        // This handles cases like 29.000000000000004 -> 29
        return Math.round(value).toString();
    }
  };

  const formatDateRange = (range: DateRange): string => {
    const start = range.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const end = range.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const handleSave = async () => {
    await fetchData();
  };

  const metricsWithValues = metrics.map((m) => ({
    ...m,
    value: getMetricValue(m.metric),
    snapshot: snapshots.find((s) => s.metric === m.metric),
    source: getMetricSource(m.metric),
  }));

  return (
    <>
      <Helmet>
        <title>Home Analytics Management | Visualize & Build ltd. - Stripe Admin</title>
        <meta
          name="description"
          content="Manage analytics data for the home page. Enter and edit metrics for specific dates."
        />
      </Helmet>

      <div className="py-4 w-full flex flex-col gap-2">
        {/* Header */}
        <div className="w-full flex flex-col lg:flex-row">
          <div>
            <h6 className="text-3xl font-bold text-gray-700">
              Home Analytics Management
            </h6>
            <p className="text-sm text-gray-500 mt-1">
              Manage analytics data for the home page
            </p>
          </div>
          <div className="action-btns mt-2 lg:mt-0 lg:ml-auto flex gap-2 items-center">
            <button
              onClick={fetchData}
              className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer"
            >
              <RefreshCw className="size-3 stroke-3" />
              <span className="text-sm font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Date Range Selection and Entry Method */}
        <div className="bg-white rounded-md border border-gray-200 p-4 mt-2">
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Analytics Data Entry
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Enter data for a specific date range
            </p>
          </div>

          <div className="relative w-full flex gap-4 items-center overflow-x-auto min-w-0">
            {/* Date Range Selector */}
            <div className="relative shrink-0 z-[100]">
              <button
                ref={dateRangeButtonRef}
                onClick={() => {
                    if (!dateRangePickerOpen) {
                      updateDateRangePosition();
                    }
                    setDateRangePickerOpen(!dateRangePickerOpen);
                  }}
                  className="flex items-center gap-1 p-1 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-[#e5e7eb] shrink-0"
                >
                  <span className="text-xs font-semibold border-r border-[#e5e7eb] pr-1">
                    Date range
                  </span>
                  <span className="text-xs font-semibold text-[#533afd]">
                    {dateRange.label || formatDateRange(dateRange)}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "size-3 stroke-3 transition-transform duration-200",
                      dateRangePickerOpen && "rotate-180"
                    )}
                  />
                </button>
                {dateRangePickerOpen &&
                  createPortal(
                    <div
                      ref={dateRangePickerRef}
                      className="fixed bg-white rounded-lg shadow-2xl w-[700px] overflow-hidden z-[10001] border border-gray-200"
                      style={{
                        top: `${dateRangePickerPosition.top}px`,
                        left: `${dateRangePickerPosition.left}px`,
                        maxHeight: "90vh",
                        overflowY: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DateRangePicker
                        isOpen={dateRangePickerOpen}
                        onClose={() => setDateRangePickerOpen(false)}
                        onApply={(range) => {
                          setDateRange(range);
                          setDateRangePickerOpen(false);
                        }}
                        currentRange={dateRange}
                      />
                    </div>,
                    document.body
                  )}
            </div>

            {/* Entry Method dropdown removed */}

            {/* Hour selector removed */}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#533afd] mb-4"></div>
              <p className="text-gray-500 text-sm">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={fetchData}
                className="text-xs text-[#533afd] hover:underline font-medium cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          /* Metrics Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {metricsWithValues.map((metric) => (
              <div
                key={metric.metric}
                className="bg-white rounded-md border border-gray-200 p-4 relative"
              >
                {/* Edit Button */}
                <button
                  onClick={() => setEditingMetric(metric.metric)}
                  className="absolute top-3 right-3 p-1 text-gray-600 hover:text-[#533afd] hover:bg-[#533afd]/10 rounded transition-colors cursor-pointer"
                  title="Edit metric"
                >
                  <Edit2 className="size-4" />
                </button>

                {/* Metric Label */}
                <div className="text-sm font-semibold text-gray-700 mb-3 pr-8">
                  {metric.label}
                </div>

                {/* Metric Value */}
                <div className="text-2xl font-normal text-[#353a44] mb-2">
                  {formatValue(metric.value, metric.format)}
                </div>

                {/* Date Range and Source */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDateRange(dateRange)}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        metric.source === "manual"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {metric.source === "manual" ? "Manual" : "Calculated"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Report Section */}
        {!loading && !error && (
          <AnalysisReport
            metrics={metricsWithValues}
            dateRange={dateRange}
            entryMethod={"daily"}
            selectedHour={null}
          />
        )}

        {/* Edit Metric Modal */}
        {editingMetric && (
          <EditMetricModal
            isOpen={true}
            onClose={() => setEditingMetric(null)}
            onSave={handleSave}
            metric={
              metricsWithValues.find((m) => m.metric === editingMetric)!
            }
            date={dateRange.start}
            entryMethod={"daily"}
            dateRange={dateRange}
            selectedHour={null}
          />
        )}
      </div>
    </>
  );
};

export default AdminHomePage;

