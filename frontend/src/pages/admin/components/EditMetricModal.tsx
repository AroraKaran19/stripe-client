import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, List, ChevronDown, ChevronUp, Plus, Calendar, Clock, User, Mail, DollarSign } from "lucide-react";
import { cn } from "../../../utils";
import { analyticsSnapshotService } from "../../../services/analytics-snapshot.service";
import type { AnalyticsSnapshot } from "../../../services/analytics-snapshot.service";
import { transactionService } from "../../../services/transaction.service";
import type { Transaction } from "../../../types/transaction";
import SingleDatePicker from "../../../components/ui/SingleDatePicker";

interface EditMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  metric: {
    metric: string;
    label: string;
    value: number;
    format: "currency" | "number" | "percentage";
    source: "calculated" | "manual";
    snapshot?: AnalyticsSnapshot;
  };
  date: Date; // This will be the start date of the range, but we'll use it to edit a specific day
  entryMethod: "daily" | "hourly";
  dateRange?: { start: Date; end: Date };
  selectedHour?: number | null;
}

const EditMetricModal = ({
  isOpen,
  onClose,
  onSave,
  metric,
  date,
  entryMethod,
  dateRange,
  selectedHour,
}: EditMetricModalProps) => {
  const [value, setValue] = useState(metric.value.toString());
  const [source, setSource] = useState<"calculated" | "manual">(
    metric.source
  );
  const [hourlyBreakdown, setHourlyBreakdown] = useState<{
    [hour: number]: number;
  }>(metric.snapshot?.hourlyBreakdown || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEntries, setShowEntries] = useState(false);
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState<Date>(new Date());
  const [newEntryDatePickerOpen, setNewEntryDatePickerOpen] = useState(false);
  const [newEntryDatePickerPosition, setNewEntryDatePickerPosition] = useState({ top: 0, left: 0 });
  const newEntryDateButtonRef = useRef<HTMLButtonElement>(null);
  const newEntryDatePickerRef = useRef<HTMLDivElement>(null);
  const [newEntryHour, setNewEntryHour] = useState<number | null>(null);
  const [newEntryValue, setNewEntryValue] = useState<string>("");
  const [creatingNewEntry, setCreatingNewEntry] = useState(false);
  
  // For new_customers, successful_payments, failed_payments: transaction creation fields
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerAmount, setNewCustomerAmount] = useState<string>("");
  
  // For successful_payments and failed_payments: payment creation fields
  const [newPaymentEmail, setNewPaymentEmail] = useState<string>("");
  const [newPaymentName, setNewPaymentName] = useState<string>("");
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>("");
  const [newPaymentDescription, setNewPaymentDescription] = useState<string>("");

  // Metrics that should show "View All Entries" button
  const metricsWithEntries = ["new_customers", "successful_payments", "failed_payments"];

  const shouldShowEntriesButton = metricsWithEntries.includes(metric.metric);

  useEffect(() => {
    if (isOpen) {
      // If hourly mode and hour is selected, show value for that specific hour
      if (entryMethod === "hourly" && selectedHour !== null && metric.snapshot?.hourlyBreakdown) {
        const hourValue = metric.snapshot.hourlyBreakdown[selectedHour];
        setValue(hourValue !== undefined && hourValue !== null ? hourValue.toString() : "0");
      } else {
        setValue(metric.value.toString());
      }
      setSource(metric.source);
      setHourlyBreakdown(metric.snapshot?.hourlyBreakdown || {});
      setError(null);
      setShowNewEntry(false);
      // Set default new entry date to the start of the date range or current date
      if (dateRange) {
        setNewEntryDate(new Date(dateRange.start));
      } else {
        setNewEntryDate(new Date(date));
      }
      setNewEntryHour(null);
      setNewEntryValue("");
      setNewCustomerEmail("");
      setNewCustomerName("");
      setNewCustomerAmount("");
      setNewPaymentEmail("");
      setNewPaymentName("");
      setNewPaymentAmount("");
      setNewPaymentDescription("");
      setNewEntryDatePickerOpen(false);
    }
  }, [isOpen, metric, entryMethod, selectedHour, dateRange, date]);

  // Update date picker position
  useEffect(() => {
    const updateNewEntryDatePickerPosition = () => {
      if (newEntryDateButtonRef.current) {
        const rect = newEntryDateButtonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pickerWidth = 280; // SingleDatePicker width
        const pickerHeight = 350; // Estimated picker height
        const spacing = 4;

        // Calculate position
        let top = rect.bottom + spacing;
        let left = rect.left;

        // Adjust if picker would go off the right edge
        if (left + pickerWidth > viewportWidth) {
          left = viewportWidth - pickerWidth - 10;
        }

        // Adjust if picker would go off the left edge
        if (left < 10) {
          left = 10;
        }

        // Adjust if picker would go off the bottom edge
        if (top + pickerHeight > viewportHeight) {
          top = rect.top - pickerHeight - spacing;
          // If it still doesn't fit above, position at top of viewport
          if (top < 10) {
            top = 10;
          }
        }

        // If it still doesn't fit, position at bottom of viewport
        if (top + pickerHeight > viewportHeight) {
          top = viewportHeight - pickerHeight - 10;
        }

        setNewEntryDatePickerPosition({
          top,
          left,
        });
      }
    };

    if (newEntryDatePickerOpen) {
      // Small delay to ensure button is rendered
      const timeoutId = setTimeout(() => {
        updateNewEntryDatePickerPosition();
      }, 0);

      const handleResize = () => {
        updateNewEntryDatePickerPosition();
      };

      const handleScroll = () => {
        updateNewEntryDatePickerPosition();
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [newEntryDatePickerOpen]);

  // Handle click outside for date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        newEntryDatePickerRef.current &&
        !newEntryDatePickerRef.current.contains(target) &&
        newEntryDateButtonRef.current &&
        !newEntryDateButtonRef.current.contains(target)
      ) {
        // Check if clicking on modal backdrop (it's a fixed div with inset-0)
        const element = target as Element;
        const isModalBackdrop = element && (
          element.classList.contains('fixed') ||
          (element.parentElement?.classList.contains('fixed') && 
           element.parentElement?.classList.contains('inset-0'))
        );
        
        // Only close if not clicking on modal backdrop
        if (!isModalBackdrop) {
          setNewEntryDatePickerOpen(false);
        }
      }
    };

    if (newEntryDatePickerOpen) {
      // Use a slight delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, true);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }
  }, [newEntryDatePickerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setError("Please enter a valid number");
        setSaving(false);
        return;
      }

      const dateStr = date.toISOString().split("T")[0];
      const normalizedDate = new Date(dateStr);

      // If hourly breakdown, use manual source and update specific hour
      const finalSource = entryMethod === "hourly" ? "manual" : source;
      
      let finalHourlyBreakdown = entryMethod === "hourly" ? { ...hourlyBreakdown } : undefined;
      
      // If editing a specific hour, update that hour in the breakdown
      if (entryMethod === "hourly" && selectedHour !== null && finalHourlyBreakdown) {
        finalHourlyBreakdown[selectedHour] = numValue;
      }

      await analyticsSnapshotService.createOrUpdate(
        normalizedDate,
        metric.metric,
        // For hourly, use the total of all hours; for daily, use the value directly
        entryMethod === "hourly" && finalHourlyBreakdown
          ? Object.values(finalHourlyBreakdown).reduce((sum, v) => sum + v, 0)
          : numValue,
        finalSource,
        finalHourlyBreakdown,
        undefined // Removed notes
      );

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metric");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove the manual override? This will revert to calculated values.")) {
      return;
    }

    try {
      const dateStr = date.toISOString().split("T")[0];
      const normalizedDate = new Date(dateStr);

      await analyticsSnapshotService.delete(normalizedDate, metric.metric);
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete metric");
    }
  };

  const updateHourlyValue = (hour: number, val: string) => {
    const numVal = parseFloat(val);
    const newBreakdown = { ...hourlyBreakdown };
    if (isNaN(numVal) || numVal === 0) {
      delete newBreakdown[hour];
    } else {
      newBreakdown[hour] = numVal;
    }
    setHourlyBreakdown(newBreakdown);

    // Update total value from hourly breakdown
    const total = Object.values(newBreakdown).reduce((sum, v) => sum + v, 0);
    setValue(total.toString());
  };

  const fetchEntries = async () => {
    if (!dateRange || !shouldShowEntriesButton) return;

    setEntriesLoading(true);
    setEntriesError(null);

    try {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      const filters: Record<string, any> = {
        date_from: startDate.toISOString(),
        date_to: endDate.toISOString(),
      };

      // Filter by status based on which metric modal is open
      if (metric.metric === "successful_payments") {
        // Show only succeeded transactions for Orders / Successful Payments
        filters.status = "succeeded";
      } else if (metric.metric === "failed_payments") {
        // Show only failed transactions for Failed Payments
        filters.status = "failed";
      } else if (metric.metric === "new_customers") {
        // Calculate previous period (same duration as current period, just before it)
        // This matches the backend analytics logic
        const duration = endDate.getTime() - startDate.getTime();
        const previousEnd = new Date(startDate.getTime() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        const previousStart = new Date(previousEnd.getTime() - duration);
        previousStart.setHours(0, 0, 0, 0);

        // Fetch transactions for current period and previous period
        const [currentRes, previousRes] = await Promise.all([
          transactionService.getAll(1, 10000, {
            date_from: startDate.toISOString(),
            date_to: endDate.toISOString(),
          }),
          transactionService.getAll(1, 10000, {
            date_from: previousStart.toISOString(),
            date_to: previousEnd.toISOString(),
          }),
        ]);

        const currentTransactions = currentRes.data.transactions;
        const previousTransactions = previousRes.data.transactions;

        // Build customer sets (matching backend logic: customer_id first, then owner_email)
        const currentCustomerSet = new Set<string>();
        currentTransactions.forEach((tx) => {
          if (tx.customer_id) {
            currentCustomerSet.add(tx.customer_id);
          } else if (tx.owner_email) {
            currentCustomerSet.add(tx.owner_email);
          }
        });

        const previousCustomerSet = new Set<string>();
        previousTransactions.forEach((tx) => {
          if (tx.customer_id) {
            previousCustomerSet.add(tx.customer_id);
          } else if (tx.owner_email) {
            previousCustomerSet.add(tx.owner_email);
          }
        });

        // New customers = customers in current period that weren't in previous period
        const newCustomerKeys = Array.from(currentCustomerSet).filter(
          (customer) => !previousCustomerSet.has(customer)
        );

        // Get transactions for new customers (first transaction per customer in current period)
        const newCustomerTransactionsMap = new Map<string, Transaction>();
        currentTransactions.forEach((tx) => {
          const customerKey = tx.customer_id || tx.owner_email || '';
          if (customerKey && newCustomerKeys.includes(customerKey)) {
            // Only keep the first transaction for each new customer
            if (!newCustomerTransactionsMap.has(customerKey)) {
              newCustomerTransactionsMap.set(customerKey, tx);
            } else {
              // If we already have a transaction, keep the earliest one
              const existing = newCustomerTransactionsMap.get(customerKey)!;
              const existingDate = new Date(existing.createdAt || existing.admin_date || new Date());
              const txDate = new Date(tx.createdAt || tx.admin_date || new Date());
              if (txDate < existingDate) {
                newCustomerTransactionsMap.set(customerKey, tx);
              }
            }
          }
        });

        const uniqueTransactions = Array.from(newCustomerTransactionsMap.values());
        setEntries(uniqueTransactions);
        setEntriesLoading(false);
        return;
      }

      // Fetch entries for successful_payments or failed_payments
      // Fetch with a high limit to get all entries in the date range
      const response = await transactionService.getAll(1, 10000, filters);
      setEntries(response.data.transactions);
    } catch (err) {
      setEntriesError(err instanceof Error ? err.message : "Failed to load entries");
      console.error("Error fetching entries:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    if (showEntries && shouldShowEntriesButton && dateRange) {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEntries, dateRange?.start, dateRange?.end]);

  const formatCurrency = (amount: number | undefined, currency: string = "USD") => {
    if (amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit {metric.label}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Date Range Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 block mb-2">
                  {dateRange ? "Date Range" : "Date"}
                </label>
                <div className="text-sm font-medium text-gray-900">
                  {dateRange
                    ? `${dateRange.start.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })} - ${dateRange.end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                </div>
              </div>
              {shouldShowEntriesButton && dateRange && (
                <button
                  type="button"
                  onClick={() => setShowEntries(!showEntries)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#533afd] bg-blue-50 border border-[#533afd] rounded-md hover:bg-blue-100 transition-colors cursor-pointer ml-4"
                >
                  <List className="size-3" />
                  <span>{showEntries ? "Hide" : "View All"} Entries</span>
                  {showEntries ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </button>
              )}
            </div>
            {entryMethod === "hourly" && selectedHour !== null && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-600">
                  Editing hourly data for <span className="font-semibold text-gray-900">{selectedHour.toString().padStart(2, "0")}:00</span>
                </span>
              </div>
            )}
            {entryMethod === "daily" && dateRange && (
              <p className="text-xs text-gray-500 mt-2">
                Values will be aggregated across the entire date range.
              </p>
            )}
          </div>

          {/* Entries List */}
          {showEntries && shouldShowEntriesButton && (
            <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  {metric.metric === "successful_payments" && "Successful Payments"}
                  {metric.metric === "failed_payments" && "Failed Payments"}
                  {metric.metric === "new_customers" && "New Customers"}
                  {entries.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({entries.length} {entries.length === 1 ? "entry" : "entries"})
                    </span>
                  )}
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {entriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#533afd] mb-2"></div>
                      <p className="text-xs text-gray-500">Loading entries...</p>
                    </div>
                  </div>
                ) : entriesError ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-red-500">{entriesError}</p>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-500">No entries found for this date range.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <div
                        key={entry._id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">
                              {entry.owner || entry.owner_email || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDate(entry.createdAt || entry.admin_date)}
                            </div>
                            {entry.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {entry.description}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-semibold text-gray-900">
                              {formatCurrency(entry.amount, entry.currency)}
                            </div>
                            <div className={cn(
                              "text-xs mt-0.5 px-2 py-0.5 rounded",
                              entry.status === "succeeded"
                                ? "bg-green-100 text-green-700"
                                : entry.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            )}>
                              {entry.status || "unknown"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Value */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Value {entryMethod === "hourly" && selectedHour !== null && `(for ${selectedHour.toString().padStart(2, "0")}:00)`}
            </label>
            <div className="relative">
              {metric.format === "currency" && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
              )}
              {metric.format === "percentage" && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              )}
              <input
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] font-medium",
                  metric.format === "currency" && "pl-8",
                  metric.format === "percentage" && "pr-8"
                )}
                placeholder="Enter value"
                required
              />
            </div>
            {entryMethod === "hourly" && selectedHour !== null && (
              <p className="text-xs text-gray-500 mt-1">
                This value will be set for the {selectedHour.toString().padStart(2, "0")}:00 hour slot
              </p>
            )}
          </div>

          {/* Source */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Data Source
            </label>
            <div className="flex gap-4">
              <label className={cn(
                "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors",
                entryMethod === "hourly" 
                  ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                  : source === "calculated"
                  ? "border-[#533afd] bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}>
                <input
                  type="radio"
                  value="calculated"
                  checked={source === "calculated"}
                  onChange={(e) =>
                    setSource(e.target.value as "calculated" | "manual")
                  }
                  className="size-4 text-[#533afd] focus:ring-[#533afd]"
                  disabled={entryMethod === "hourly"}
                />
                <span className={cn(
                  "text-sm font-medium",
                  entryMethod === "hourly" ? "text-gray-400" : "text-gray-700"
                )}>
                  Calculated
                </span>
              </label>
              <label className={cn(
                "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors",
                source === "manual"
                  ? "border-[#533afd] bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}>
                <input
                  type="radio"
                  value="manual"
                  checked={source === "manual"}
                  onChange={(e) =>
                    setSource(e.target.value as "calculated" | "manual")
                  }
                  className="size-4 text-[#533afd] focus:ring-[#533afd]"
                />
                <span className="text-sm font-medium text-gray-700">Manual Override</span>
              </label>
            </div>
            {entryMethod === "hourly" && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  ⓘ Hourly breakdown automatically creates a manual override
                </p>
              </div>
            )}
          </div>

          {/* Hourly Breakdown (if entry method is hourly) */}
          {entryMethod === "hourly" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Hourly Breakdown (optional)
                </label>
                <span className="text-xs text-gray-500">
                  Total: {(() => {
                    const total = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
                    switch (metric.format) {
                      case "currency":
                        return `$${total.toFixed(2)}`;
                      case "percentage":
                        return `${total.toFixed(2)}%`;
                      default:
                        return total.toString();
                    }
                  })()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-md bg-gray-50">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1 font-medium">
                      {i.toString().padStart(2, "0")}:00
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={hourlyBreakdown[i] || ""}
                      onChange={(e) => updateHourlyValue(i, e.target.value)}
                      className={cn(
                        "w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white",
                        selectedHour === i && "ring-2 ring-[#533afd] border-[#533afd]"
                      )}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedHour !== null 
                  ? `Editing hour ${selectedHour.toString().padStart(2, "0")}:00. Use the hourly breakdown grid above to edit all 24 hours.`
                  : "Enter values for each hour. The total will be calculated automatically."}
              </p>
            </div>
          )}

          {/* Create New Entry - Metric Specific */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="w-full flex items-center justify-between p-3 text-sm font-semibold text-[#533afd] bg-blue-50 border border-[#533afd] rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>
                  {metric.metric === "new_customers"
                    ? "Add New Customer"
                    : metric.metric === "successful_payments"
                    ? "Add Successful Payment"
                    : metric.metric === "failed_payments"
                    ? "Add Failed Payment"
                    : "Create New Entry"}
                </span>
              </div>
              {showNewEntry ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>

            {showNewEntry && (
              <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {metric.metric === "new_customers"
                    ? "Add New Customer Entry"
                    : metric.metric === "successful_payments"
                    ? "Add Successful Payment Entry"
                    : metric.metric === "failed_payments"
                    ? "Add Failed Payment Entry"
                    : `Create New ${metric.label} Entry`}
                </h4>

                {/* Custom Date Picker */}
                <div className="mb-3 relative">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    <Calendar className="size-3 inline mr-1" />
                    Select Date
                  </label>
                  <button
                    ref={newEntryDateButtonRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewEntryDatePickerOpen(!newEntryDatePickerOpen);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-gray-900">
                      {newEntryDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <ChevronDown className={cn(
                      "size-3 text-gray-500 transition-transform",
                      newEntryDatePickerOpen && "rotate-180"
                    )} />
                  </button>
                  {newEntryDatePickerOpen &&
                    createPortal(
                      <div
                        ref={newEntryDatePickerRef}
                        className="fixed z-[10003]"
                        style={{
                          top: `${newEntryDatePickerPosition.top}px`,
                          left: `${newEntryDatePickerPosition.left}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <SingleDatePicker
                          isOpen={newEntryDatePickerOpen}
                          onClose={() => setNewEntryDatePickerOpen(false)}
                          onApply={(date) => {
                            setNewEntryDate(date);
                            setNewEntryDatePickerOpen(false);
                          }}
                          currentDate={newEntryDate}
                        />
                      </div>,
                      document.body
                    )}
                </div>

                {/* Hour Selector (if hourly mode and not transaction-based metrics) */}
                {entryMethod === "hourly" && 
                 metric.metric !== "new_customers" && 
                 metric.metric !== "successful_payments" && 
                 metric.metric !== "failed_payments" && (
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      <Clock className="size-3 inline mr-1" />
                      Select Hour (optional)
                    </label>
                    <select
                      value={newEntryHour !== null ? newEntryHour.toString() : ""}
                      onChange={(e) =>
                        setNewEntryHour(
                          e.target.value === "" ? null : parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                    >
                      <option value="">Select Hour (optional)</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      If not specified, entry will be created for the entire day
                    </p>
                  </div>
                )}

                {/* New Customer Form (only for new_customers metric) */}
                {metric.metric === "new_customers" ? (
                  <>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <Mail className="size-3 inline mr-1" />
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={newCustomerEmail}
                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <User className="size-3 inline mr-1" />
                        Customer Name (optional)
                      </label>
                      <input
                        type="text"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <DollarSign className="size-3 inline mr-1" />
                        Transaction Amount (optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={newCustomerAmount}
                          onChange={(e) => setNewCustomerAmount(e.target.value)}
                          className="w-full pl-8 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                ) : metric.metric === "successful_payments" || metric.metric === "failed_payments" ? (
                  <>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <Mail className="size-3 inline mr-1" />
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={newPaymentEmail}
                        onChange={(e) => setNewPaymentEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <User className="size-3 inline mr-1" />
                        Customer Name (optional)
                      </label>
                      <input
                        type="text"
                        value={newPaymentName}
                        onChange={(e) => setNewPaymentName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        <DollarSign className="size-3 inline mr-1" />
                        Payment Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={newPaymentAmount}
                          onChange={(e) => setNewPaymentAmount(e.target.value)}
                          className="w-full pl-8 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={newPaymentDescription}
                        onChange={(e) => setNewPaymentDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                        placeholder="Payment description"
                      />
                    </div>
                  </>
                ) : (
                  /* Value Input for other metrics */
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Value
                    </label>
                    <div className="relative">
                      {metric.format === "currency" && (
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          $
                        </span>
                      )}
                      {metric.format === "percentage" && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          %
                        </span>
                      )}
                      <input
                        type="number"
                        step="any"
                        value={newEntryValue}
                        onChange={(e) => setNewEntryValue(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] font-medium bg-white",
                          metric.format === "currency" && "pl-8",
                          metric.format === "percentage" && "pr-8"
                        )}
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <button
                  type="button"
                  onClick={async () => {
                    // Validation
                    if (metric.metric === "new_customers") {
                      if (!newCustomerEmail) {
                        setError("Please provide a customer email");
                        return;
                      }
                    } else if (metric.metric === "successful_payments" || metric.metric === "failed_payments") {
                      if (!newPaymentEmail || !newPaymentAmount) {
                        setError("Please provide customer email and payment amount");
                        return;
                      }
                      const amount = parseFloat(newPaymentAmount);
                      if (isNaN(amount) || amount <= 0) {
                        setError("Please enter a valid payment amount");
                        return;
                      }
                    } else {
                      if (!newEntryDate || !newEntryValue) {
                        setError("Please provide a date and value for the new entry");
                        return;
                      }
                    }

                    setCreatingNewEntry(true);
                    setError(null);

                    try {
                      const entryDate = new Date(newEntryDate);
                      entryDate.setHours(0, 0, 0, 0);

                      if (metric.metric === "new_customers") {
                        // Create a transaction for the new customer
                        const transactionData: Partial<Transaction> = {
                          owner_email: newCustomerEmail,
                          owner: newCustomerName || newCustomerEmail.split("@")[0],
                          amount: newCustomerAmount ? parseFloat(newCustomerAmount) * 100 : 10000, // Convert to cents, default $100
                          currency: "USD",
                          status: "succeeded",
                          admin_date: entryDate,
                          payment_id: `pm_${Math.random().toString(36).substr(2, 9)}`,
                          fingerprint: `fp_${Math.random().toString(36).substr(2, 9)}`,
                          description: `New customer entry: ${newCustomerEmail}`,
                          statement_descriptor: "Visualize & Build ltd.",
                        };

                        await transactionService.create(transactionData);

                        // Reset form
                        setNewCustomerEmail("");
                        setNewCustomerName("");
                        setNewCustomerAmount("");
                      } else if (metric.metric === "successful_payments" || metric.metric === "failed_payments") {
                        // Create a transaction for successful or failed payment
                        const transactionData: Partial<Transaction> = {
                          owner_email: newPaymentEmail,
                          owner: newPaymentName || newPaymentEmail.split("@")[0],
                          amount: parseFloat(newPaymentAmount) * 100, // Convert to cents
                          currency: "USD",
                          status: metric.metric === "successful_payments" ? "succeeded" : "failed",
                          admin_date: entryDate,
                          payment_id: `pm_${Math.random().toString(36).substr(2, 9)}`,
                          fingerprint: `fp_${Math.random().toString(36).substr(2, 9)}`,
                          description: newPaymentDescription || `${metric.metric === "successful_payments" ? "Successful" : "Failed"} payment entry: ${newPaymentEmail}`,
                          statement_descriptor: "Visualize & Build ltd.",
                        };

                        await transactionService.create(transactionData);

                        // Reset form
                        setNewPaymentEmail("");
                        setNewPaymentName("");
                        setNewPaymentAmount("");
                        setNewPaymentDescription("");
                      } else {
                        // Create analytics snapshot for other metrics
                        const entryValue = parseFloat(newEntryValue);
                        if (isNaN(entryValue)) {
                          setError("Please enter a valid number");
                          setCreatingNewEntry(false);
                          return;
                        }

                        let entryHourlyBreakdown: { [hour: number]: number } | undefined;

                        if (entryMethod === "hourly" && newEntryHour !== null) {
                          entryHourlyBreakdown = { [newEntryHour]: entryValue };
                        } else if (entryMethod === "hourly") {
                          entryHourlyBreakdown = {};
                          for (let i = 0; i < 24; i++) {
                            entryHourlyBreakdown[i] = entryValue / 24;
                          }
                        }

                        await analyticsSnapshotService.createOrUpdate(
                          entryDate,
                          metric.metric,
                          entryMethod === "hourly" && entryHourlyBreakdown
                            ? Object.values(entryHourlyBreakdown).reduce(
                                (sum, v) => sum + v,
                                0
                              )
                            : entryValue,
                          "manual",
                          entryHourlyBreakdown,
                          undefined
                        );

                        // Reset form
                        setNewEntryValue("");
                        setNewEntryHour(null);
                      }

                      setShowNewEntry(false);

                      // Refresh data
                      onSave();
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to create new entry"
                      );
                    } finally {
                      setCreatingNewEntry(false);
                    }
                  }}
                  disabled={
                    creatingNewEntry ||
                    (metric.metric === "new_customers"
                      ? !newCustomerEmail
                      : metric.metric === "successful_payments" || metric.metric === "failed_payments"
                      ? !newPaymentEmail || !newPaymentAmount
                      : !newEntryDate || !newEntryValue)
                  }
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-[#533afd] rounded-md hover:bg-[#4330d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {creatingNewEntry
                    ? "Creating..."
                    : metric.metric === "new_customers"
                    ? "Add Customer"
                    : metric.metric === "successful_payments"
                    ? "Add Payment"
                    : metric.metric === "failed_payments"
                    ? "Add Payment"
                    : "Create New Entry"}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {metric.source === "manual" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Remove Manual Override
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#533afd] rounded-md hover:bg-[#4330d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditMetricModal;

