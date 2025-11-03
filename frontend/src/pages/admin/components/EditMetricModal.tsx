import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, List, ChevronDown, ChevronUp, Plus, Calendar, User, Mail, DollarSign } from "lucide-react";
import { cn } from "../../../utils";
import { getUTCStartOfDay } from "../../../utils/dateUtils";
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
  snapshots?: AnalyticsSnapshot[];
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
  snapshots = [],
}: EditMetricModalProps) => {
  const [value, setValue] = useState(metric.value.toString());
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
  const [newEntryMode, setNewEntryMode] = useState<"daily" | "hourly">("daily");
  const [editMode, setEditMode] = useState<"daily" | "hourly">("daily");
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [editDatePickerOpen, setEditDatePickerOpen] = useState(false);
  const editDateButtonRef = useRef<HTMLButtonElement>(null);
  const editDatePickerRef = useRef<HTMLDivElement>(null);
  const [editDatePickerPosition, setEditDatePickerPosition] = useState({ top: 0, left: 0 });
  
  // For new_customers, successful_payments, failed_payments: transaction creation fields
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerAmount, setNewCustomerAmount] = useState<string>("");
  
  // For successful_payments and failed_payments: payment creation fields
  const [newPaymentEmail, setNewPaymentEmail] = useState<string>("");
  const [newPaymentName, setNewPaymentName] = useState<string>("");
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>("");
  const [newPaymentDescription, setNewPaymentDescription] = useState<string>("");

  // For editing individual entries
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<Partial<Transaction>>({});
  const [updatingEntry, setUpdatingEntry] = useState(false);

  // Metrics that should show "View All Entries" button
  const metricsWithEntries = ["new_customers", "successful_payments", "failed_payments"];

  const shouldShowEntriesButton = metricsWithEntries.includes(metric.metric);

  // Check if metric requires user information (transaction-based)
  const isTransactionMetric = 
    metric.metric === "new_customers" ||
    metric.metric === "successful_payments" ||
    metric.metric === "failed_payments";

  useEffect(() => {
    if (isOpen) {
      // If hourly mode and hour is selected, show value for that specific hour
      if (entryMethod === "hourly" && selectedHour !== null && metric.snapshot?.hourlyBreakdown) {
        const hourValue = metric.snapshot.hourlyBreakdown[selectedHour as number];
        setValue(hourValue !== undefined && hourValue !== null ? hourValue.toString() : "0");
      } else {
        setValue(metric.value.toString());
      }

      // Initialize edit date to today for numbers-only metrics, or date range start for others
      let initialEditDate: Date;
      if (!isTransactionMetric) {
        // For numbers-only metrics: always default to today
        initialEditDate = new Date();
        setEditDate(initialEditDate);
        // Initialize newEntryValue to current metric value
        setNewEntryValue(metric.value.toString());
      } else {
        // For transaction metrics: use date range start (though not used in their form)
        if (dateRange) {
          initialEditDate = new Date(dateRange.start);
          setEditDate(initialEditDate);
        } else {
          initialEditDate = new Date(date);
          setEditDate(initialEditDate);
        }
      }

      // For numbers-only metrics, load hourly breakdown from database for the initial date
      // This ensures we have fresh data from database, not stale local state
      if (!isTransactionMetric) {
        const loadInitialData = async () => {
          try {
            const normalizedDate = getUTCStartOfDay(initialEditDate);
            const snapshotResponse = await analyticsSnapshotService.getByDate(
              normalizedDate,
              metric.metric
            );
            const snapshot = snapshotResponse.data.find(
              (s) => s.metric === metric.metric
            );
            setHourlyBreakdown(snapshot?.hourlyBreakdown || {});
          } catch (err) {
            console.warn("Could not load initial data from database:", err);
            setHourlyBreakdown({});
          }
        };
        loadInitialData();
      } else {
        // For transaction metrics, initialize from metric snapshot (already loaded from database)
        setHourlyBreakdown(metric.snapshot?.hourlyBreakdown || {});
      }
      
      // Initialize new entry date to today
      setNewEntryDate(new Date());

      // For transaction metrics, auto-show "Create New Entry"
      // For other metrics, hide it initially
      if (isTransactionMetric) {
        setShowNewEntry(true);
        setNewEntryMode("daily");
      } else {
        setShowNewEntry(false);
        setNewEntryMode("daily");
      }

      // Reset new entry form fields
      setNewEntryHour(null);
      setNewCustomerEmail("");
      setNewCustomerName("");
      setNewCustomerAmount("");
      setNewPaymentEmail("");
      setNewPaymentName("");
      setNewPaymentAmount("");
      setNewPaymentDescription("");
      setNewEntryDatePickerOpen(false);

      // Clear error messages
      setError(null);
    }
  }, [isOpen, metric, date, dateRange, isTransactionMetric, snapshots]);

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

  // Update edit date picker position
  useEffect(() => {
    const updateEditDatePickerPosition = () => {
      if (editDateButtonRef.current) {
        const rect = editDateButtonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pickerWidth = 280;
        const pickerHeight = 350;
        const spacing = 4;

        let top = rect.bottom + spacing;
        let left = rect.left;

        if (left + pickerWidth > viewportWidth) {
          left = viewportWidth - pickerWidth - 10;
        }

        if (left < 10) {
          left = 10;
        }

        if (top + pickerHeight > viewportHeight) {
          top = rect.top - pickerHeight - spacing;
          if (top < 10) {
            top = 10;
          }
        }

        if (top + pickerHeight > viewportHeight) {
          top = viewportHeight - pickerHeight - 10;
        }

        setEditDatePickerPosition({
          top,
          left,
        });
      }
    };

    if (editDatePickerOpen) {
      const timeoutId = setTimeout(() => {
        updateEditDatePickerPosition();
      }, 0);

      const handleResize = () => {
        updateEditDatePickerPosition();
      };

      const handleScroll = () => {
        updateEditDatePickerPosition();
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [editDatePickerOpen]);

  // Update hourly breakdown when selected date changes in Create New Entry
  useEffect(() => {
    const loadNewEntryDataFromDatabase = async () => {
      if (!isTransactionMetric && showNewEntry) {
        try {
          const normalizedDate = getUTCStartOfDay(newEntryDate);
          
          // Fetch snapshot from database for the selected date
          const snapshotResponse = await analyticsSnapshotService.getByDate(
            normalizedDate,
            metric.metric
          );
          const selectedSnapshot = snapshotResponse.data.find(
            (s) => s.metric === metric.metric
          );

          if (selectedSnapshot && selectedSnapshot.hourlyBreakdown) {
            // Display hourly data from database for this date
            setHourlyBreakdown(selectedSnapshot.hourlyBreakdown);
          } else {
            // Clear hourly data if no snapshot exists in database
            setHourlyBreakdown({});
          }
        } catch (err) {
          console.warn("Could not load new entry data from database:", err);
          setHourlyBreakdown({});
        }
      }
    };

    loadNewEntryDataFromDatabase();
  }, [newEntryDate, showNewEntry, metric.metric, isTransactionMetric]);

  // Load existing data when editDate changes (for edit mode in direct form)
  // Fetch fresh data from database instead of using local snapshots
  useEffect(() => {
    const loadEditDataFromDatabase = async () => {
      if (!isTransactionMetric && !showNewEntry) {
        try {
          const normalizedDate = getUTCStartOfDay(editDate);
          
          // Fetch snapshot from database for the selected edit date
          const snapshotResponse = await analyticsSnapshotService.getByDate(
            normalizedDate,
            metric.metric
          );
          const existingSnapshot = snapshotResponse.data.find(
            (s) => s.metric === metric.metric
          );

          if (existingSnapshot) {
            // Load existing value and hourly breakdown from database for DISPLAY ONLY
            // User will ADD to this, not replace it
            setHourlyBreakdown(existingSnapshot.hourlyBreakdown || {});
            // Clear input so user can enter the amount to ADD
            setNewEntryValue("");
          } else {
            // No existing snapshot in database - start fresh
            setNewEntryValue("");
            setHourlyBreakdown({});
          }
        } catch (err) {
          console.warn("Could not load edit data from database:", err);
          // On error, start fresh
          setNewEntryValue("");
          setHourlyBreakdown({});
        }
      }
    };

    loadEditDataFromDatabase();
  }, [editDate, showNewEntry, metric.metric, isTransactionMetric]);

  // Update newEntryValue when newEntryMode changes or hourly breakdown changes (for numbers-only metrics)
  useEffect(() => {
    if (!isTransactionMetric && showNewEntry) {
      if (newEntryMode === "hourly" && Object.keys(hourlyBreakdown).length > 0) {
        // Calculate total from hourly breakdown
        const total = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
        setNewEntryValue(total.toString());
      } else if (newEntryMode === "daily") {
        // Keep daily value as is
        // (no change needed)
      }
    }
  }, [newEntryMode, hourlyBreakdown, isTransactionMetric, showNewEntry]);

  // Load existing hourly data when switching to hourly edit mode
  // Fetch fresh data from database instead of using local snapshots prop
  useEffect(() => {
    const loadHourlyDataFromDatabase = async () => {
      if (!isTransactionMetric && editMode === "hourly") {
        try {
          const normalizedDate = getUTCStartOfDay(editDate);
          
          // Fetch existing snapshot DIRECTLY from database
          const snapshotResponse = await analyticsSnapshotService.getByDate(
            normalizedDate,
            metric.metric
          );
          const snapshot = snapshotResponse.data.find(
            (s) => s.metric === metric.metric
          );
          
          // Pre-populate hourly grid with existing data from database
          // Ensure all 24 hours are present, filling missing ones with 0
          const normalizedBreakdown: { [hour: number]: number } = {};
          for (let i = 0; i < 24; i++) {
            normalizedBreakdown[i] = 0;
          }
          
          if (snapshot?.hourlyBreakdown) {
            // Merge existing data from database into normalized breakdown
            Object.entries(snapshot.hourlyBreakdown).forEach(([hour, value]) => {
              const hourNum = parseInt(hour);
              if (hourNum >= 0 && hourNum < 24) {
                normalizedBreakdown[hourNum] = value || 0;
              }
            });
          }
          
          setHourlyBreakdown(normalizedBreakdown);
        } catch (err) {
          console.warn("Could not load hourly data from database, using empty values:", err);
          // On error, use empty breakdown
          const emptyBreakdown: { [hour: number]: number } = {};
          for (let i = 0; i < 24; i++) {
            emptyBreakdown[i] = 0;
          }
          setHourlyBreakdown(emptyBreakdown);
        }
      }
    };

    loadHourlyDataFromDatabase();
  }, [editMode, editDate, metric.metric, isTransactionMetric]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate based on edit mode for numbers-only metrics
      if (!isTransactionMetric) {
        if (editMode === "daily") {
          // Daily mode: validate newEntryValue
          const numValue = parseFloat(newEntryValue);
          if (isNaN(numValue) || numValue === 0) {
            setError("Please enter a valid number to add");
            setSaving(false);
            return;
          }
        } else {
          // Hourly mode: validate that at least one hour has a value
          const hasValues = Object.values(hourlyBreakdown).some((v) => v > 0);
          if (!hasValues) {
            setError("Please enter at least one hourly value");
            setSaving(false);
            return;
          }
        }
      } else {
        // Transaction metrics: validate value
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue === 0) {
          setError("Please enter a valid amount");
          setSaving(false);
          return;
        }
      }

      // Get the correct numValue based on mode
      let numValue = 0;
      if (!isTransactionMetric) {
        if (editMode === "daily") {
          numValue = parseFloat(newEntryValue);
        } else {
          // Hourly mode: sum of all hourly values that need to be ADDED
          numValue = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
        }
      } else {
        numValue = parseFloat(value);
      }

      const normalizedDate = getUTCStartOfDay(editDate);

      // Fetch existing snapshot DIRECTLY from database (not from local state)
      // This ensures we're working with the latest database data
      let existingSnapshot: AnalyticsSnapshot | undefined;
      try {
        const snapshotResponse = await analyticsSnapshotService.getByDate(
          normalizedDate,
          metric.metric
        );
        existingSnapshot = snapshotResponse.data.find(
          (s) => s.metric === metric.metric
        );
      } catch (err) {
        console.warn("Could not fetch existing snapshot, proceeding with new entry:", err);
      }

      // For manual edits, always use "manual" as source
      const finalSource = "manual";

      // Calculate final values by ADDING to existing data from database
      let totalValue: number;
      let breakdownToSave: { [hour: number]: number } | undefined;

      if (editMode === "daily") {
        // For daily mode: send ONLY the amount to ADD (not the final total)
        // Backend will add this to existing values
        const hourlyAddition = numValue / 24;
        breakdownToSave = {};
        
        // Send only the hourly addition (backend will add to existing)
        for (let i = 0; i < 24; i++) {
          breakdownToSave[i] = hourlyAddition;
        }
        
        // Send only the amount to add (backend will add to existing total)
        totalValue = numValue;
      } else {
        // Hourly mode: hourlyBreakdown contains the FINAL values user edited
        // We need to calculate the difference based on database values
        breakdownToSave = {};
        
        // Get existing hourly breakdown from database
        const existingHourly = existingSnapshot?.hourlyBreakdown || {};
        let totalAddition = 0;
        
        for (let i = 0; i < 24; i++) {
          const newValue = hourlyBreakdown[i] || 0;
          const existingValue = existingHourly[i] || 0;
          const difference = newValue - existingValue;
          
          // Send the difference to backend (backend will add this to existing database value)
          if (difference !== 0) {
            breakdownToSave[i] = difference;
          }
          totalAddition += difference;
        }
        
        // Total value to send: ONLY the total addition (backend will add to existing)
        totalValue = totalAddition;
      }

      // Save to database via API
      await analyticsSnapshotService.createOrUpdate(
        normalizedDate,
        metric.metric,
        totalValue,
        finalSource,
        breakdownToSave,
        undefined
      );

      // After successful save, close the modal
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
      setSaving(true);
      setError(null);
      
      const normalizedDate = getUTCStartOfDay(editDate);

      // Delete from database via API
      await analyticsSnapshotService.delete(normalizedDate, metric.metric);
      
      // Call onSave to refresh parent data from database
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete metric");
    } finally {
      setSaving(false);
    }
  };

  const updateHourlyValue = (hour: number, val: string) => {
    const numVal = parseFloat(val);
    const newBreakdown = { ...hourlyBreakdown };
    if (isNaN(numVal) || numVal < 0) {
      // If empty or negative, set to 0
      newBreakdown[hour] = 0;
    } else {
      newBreakdown[hour] = numVal;
    }
    setHourlyBreakdown(newBreakdown);

    // Update total value from hourly breakdown
    const total = Object.values(newBreakdown).reduce((sum, v) => sum + v, 0);
    setNewEntryValue(total.toString());
  };

  const fetchEntries = async () => {
    if (!shouldShowEntriesButton) return;

    setEntriesLoading(true);
    setEntriesError(null);

    try {
      // For transaction metrics, fetch entries for the selected date in the modal (newEntryDate)
      // For numbers-only metrics (shouldn't reach here), use dateRange
      const startDate = isTransactionMetric ? new Date(newEntryDate) : new Date(dateRange!.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = isTransactionMetric ? new Date(newEntryDate) : new Date(dateRange!.end);
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
        // For new customers on a specific date, fetch transactions from that date
        // and compare with previous day
        const previousStart = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousStart.setHours(0, 0, 0, 0);
        const previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);

        // Fetch transactions for selected date and previous day
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

        // New customers = customers in current date that weren't in previous date
        const newCustomerKeys = Array.from(currentCustomerSet).filter(
          (customer) => !previousCustomerSet.has(customer)
        );

        // Get transactions for new customers (first transaction per customer in current date)
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

      // Fetch entries for successful_payments or failed_payments for the selected date
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
    if (showEntries && shouldShowEntriesButton) {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEntries, newEntryDate, isTransactionMetric]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
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

          {/* NUMBERS-ONLY METRICS: Direct Edit Form */}
          {!isTransactionMetric && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Edit {metric.label} for Specific Date
              </h3>

              {/* Select Date Picker */}
              <div className="mb-4 relative">
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  <Calendar className="size-3 inline mr-1" />
                  Select Date
                </label>
                <button
                  ref={editDateButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditDatePickerOpen(!editDatePickerOpen);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-[#533afd] bg-white text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="text-gray-900 font-medium">
                    {editDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <ChevronDown className={cn(
                    "size-4 text-gray-500 transition-transform",
                    editDatePickerOpen && "rotate-180"
                  )} />
                </button>
                {editDatePickerOpen &&
                  createPortal(
                    <div
                      ref={editDatePickerRef}
                      className="fixed z-[10003]"
                      style={{
                        top: `${editDatePickerPosition.top}px`,
                        left: `${editDatePickerPosition.left}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <SingleDatePicker
                        isOpen={editDatePickerOpen}
                        onClose={() => setEditDatePickerOpen(false)}
                        onApply={(date) => {
                          setEditDate(date);
                          setEditDatePickerOpen(false);
                        }}
                        currentDate={editDate}
                      />
                    </div>,
                    document.body
                  )}
              </div>

              {/* Edit Mode Toggle */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-2">Edit Mode</label>
                <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setEditMode("daily")}
                    className={cn(
                      "px-4 py-2 text-xs font-medium transition-colors",
                      editMode === "daily"
                        ? "bg-[#533afd] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode("hourly")}
                    className={cn(
                      "px-4 py-2 text-xs font-medium border-l border-gray-300 transition-colors",
                      editMode === "hourly"
                        ? "bg-[#533afd] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Hourly
                  </button>
                </div>
              </div>

              {/* Daily Mode: Single Value Input */}
              {editMode === "daily" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 block mb-2">
                    Amount to Add (Daily)
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
                      placeholder="Enter amount to add"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This amount will be divided by 24 and added to each hour
                  </p>
                </div>
              )}

              {/* Hourly Mode: 24-Hour Grid */}
              {editMode === "hourly" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">
                      Hourly Breakdown
                    </label>
                    <span className="text-xs text-gray-500 font-medium">
                      Total: {(() => {
                        const total = Object.values(hourlyBreakdown).reduce((sum, v) => sum + v, 0);
                        switch (metric.format) {
                          case "currency":
                            return `$${total.toFixed(2)}`;
                          case "percentage":
                            return `${total.toFixed(2)}%`;
                          default:
                            return Math.round(total).toString();
                        }
                      })()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-md bg-white">
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
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRANSACTION-BASED METRICS: Create New Entry Section */}
          {isTransactionMetric && (
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
                        setError("Please provide customer email");
                        return;
                      }
                      // Email validation
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(newCustomerEmail)) {
                        setError("Please provide a valid email address");
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
                        // Create a transaction for new customer
                        const transactionData: Partial<Transaction> = {
                          owner_email: newCustomerEmail,
                          owner: newCustomerName || newCustomerEmail.split("@")[0],
                          amount: newCustomerAmount ? parseFloat(newCustomerAmount) * 100 : 0,
                          currency: "USD",
                          status: "succeeded",
                          admin_date: (() => {
                            const d = new Date(entryDate);
                            if (newEntryMode === "hourly" && newEntryHour !== null) {
                              d.setHours(newEntryHour, 0, 0, 0);
                            }
                            return d;
                          })(),
                          payment_id: `pm_${Math.random().toString(36).substr(2, 9)}`,
                          fingerprint: `fp_${Math.random().toString(36).substr(2, 9)}`,
                          description: `New customer entry: ${newCustomerEmail}`,
                          statement_descriptor: "Visualize & Build ltd.",
                        };

                        await transactionService.create(transactionData);

                        // Refresh entries list
                        await fetchEntries();

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
                    admin_date: (() => {
                      const d = new Date(entryDate);
                      if (newEntryMode === "hourly" && newEntryHour !== null) {
                        d.setHours(newEntryHour, 0, 0, 0);
                      }
                      return d;
                    })(),
                          payment_id: `pm_${Math.random().toString(36).substr(2, 9)}`,
                          fingerprint: `fp_${Math.random().toString(36).substr(2, 9)}`,
                          description: newPaymentDescription || `${metric.metric === "successful_payments" ? "Successful" : "Failed"} payment entry: ${newPaymentEmail}`,
                          statement_descriptor: "Visualize & Build ltd.",
                        };

                        await transactionService.create(transactionData);

                        // Refresh entries list
                        await fetchEntries();

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
                  if (newEntryMode === "hourly") {
                    if (newEntryHour !== null) {
                      entryHourlyBreakdown = { [newEntryHour]: entryValue };
                    } else {
                      entryHourlyBreakdown = {};
                      for (let i = 0; i < 24; i++) {
                        entryHourlyBreakdown[i] = entryValue / 24;
                      }
                    }
                  }

                        await analyticsSnapshotService.createOrUpdate(
                          entryDate,
                          metric.metric,
                    newEntryMode === "hourly" && entryHourlyBreakdown
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

                      // Refresh parent data and close
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
                    (metric.metric === "successful_payments" || metric.metric === "failed_payments"
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
          )}

          {/* View All Entries - For transaction-based metrics */}
          {shouldShowEntriesButton && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowEntries(!showEntries)}
                className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <List className="size-4" />
                  <span>View All Entries for {newEntryDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}</span>
                </div>
                {showEntries ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>

              {showEntries && (
                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                  {entriesLoading && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Loading entries...</p>
                    </div>
                  )}
                  {entriesError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                      <p className="text-sm text-red-600">{entriesError}</p>
                    </div>
                  )}
                  {!entriesLoading && entries.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        No entries found for {newEntryDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {!entriesLoading && entries.length > 0 && (
                    <div className="space-y-2">
                      {entries.map((entry, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gray-200 rounded-md bg-gray-50 transition-colors"
                        >
                          {editingEntryId === entry._id ? (
                            // Edit form
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  <Mail className="size-3 inline mr-1" />
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={editingEntryData.owner_email || ""}
                                  onChange={(e) =>
                                    setEditingEntryData({
                                      ...editingEntryData,
                                      owner_email: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                                  placeholder="email@example.com"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  <User className="size-3 inline mr-1" />
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={editingEntryData.owner || ""}
                                  onChange={(e) =>
                                    setEditingEntryData({
                                      ...editingEntryData,
                                      owner: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                                  placeholder="John Doe"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  <DollarSign className="size-3 inline mr-1" />
                                  Amount
                                </label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      editingEntryData.amount
                                        ? (editingEntryData.amount / 100).toFixed(2)
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setEditingEntryData({
                                        ...editingEntryData,
                                        amount: parseFloat(e.target.value) * 100,
                                      })
                                    }
                                    className="w-full pl-6 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={editingEntryData.description || ""}
                                  onChange={(e) =>
                                    setEditingEntryData({
                                      ...editingEntryData,
                                      description: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] bg-white"
                                  placeholder="Optional description"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (entry._id) {
                                      setUpdatingEntry(true);
                                      try {
                                        await transactionService.update(entry._id, {
                                          owner_email: editingEntryData.owner_email,
                                          owner: editingEntryData.owner,
                                          amount: editingEntryData.amount,
                                          description: editingEntryData.description,
                                        });
                                        // Update entries list
                                        setEntries(
                                          entries.map((e) =>
                                            e._id === entry._id
                                              ? { ...e, ...editingEntryData }
                                              : e
                                          )
                                        );
                                        setEditingEntryId(null);
                                        setEditingEntryData({});
                                        onSave(); // Refresh parent data
                                      } catch (err) {
                                        setError(
                                          err instanceof Error
                                            ? err.message
                                            : "Failed to update entry"
                                        );
                                      } finally {
                                        setUpdatingEntry(false);
                                      }
                                    }
                                  }}
                                  disabled={updatingEntry}
                                  className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-[#533afd] rounded hover:bg-[#4330d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  {updatingEntry ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEntryId(null);
                                    setEditingEntryData({});
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-gray-500 font-medium">Email</p>
                                  <p className="text-gray-900">{entry.owner_email || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 font-medium">Name</p>
                                  <p className="text-gray-900">{entry.owner || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 font-medium">Amount</p>
                                  <p className="text-gray-900 font-medium">
                                    ${(entry.amount ? entry.amount / 100 : 0).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 font-medium">Date</p>
                                  <p className="text-gray-900">
                                    {formatDate(entry.admin_date || entry.createdAt)}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-500 font-medium">Description</p>
                                  <p className="text-gray-900">{entry.description || "-"}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEntryId(entry._id || null);
                                    setEditingEntryData(entry);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (entry._id && confirm("Delete this entry?")) {
                                      try {
                                        await transactionService.delete(entry._id);
                                        setEntries(entries.filter((e) => e._id !== entry._id));
                                        onSave(); // Refresh parent data
                                      } catch (err) {
                                        setError(
                                          err instanceof Error
                                            ? err.message
                                            : "Failed to delete entry"
                                        );
                                      }
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                disabled={saving || isTransactionMetric}
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

