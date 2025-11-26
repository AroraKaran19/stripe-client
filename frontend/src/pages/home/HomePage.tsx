"use client";
import { ChevronDownIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import { cn } from "../../utils";
import LineChart from "../../components/ui/charts/homepage/LineChart";
import HeroSection from "./components/HeroSection";
import SecondSectionHeader from "./components/SecondSectionHeader";
import SingleDatePicker from "../../components/ui/SingleDatePicker";
import GrossVolumeCard from "./components/GrossVolumeCard";
import NetVolumeCard from "./components/NetVolumeCard";
import PaymentsCard from "./components/PaymentsCard";
import FailedPaymentsCard from "./components/FailedPaymentsCard";
import NewCustomersCard from "./components/NewCustomersCard";
import TopCustomersCard from "./components/TopCustomersCard";
import AddSectionModal, { type SectionType } from "./components/AddSectionModal";
import { analyticsService } from "../../services/analytics.service";
import type { AnalyticsData } from "../../services/analytics.service";
import { topSectionCardService } from "../../services/top-section-card.service";
import type { TopSectionCardData } from "../../services/top-section-card.service";
import { grossVolumeCardService } from "../../services/gross-volume-card.service";
import { netVolumeCardService } from "../../services/net-volume-card.service";
import { paymentsCardService } from "../../services/payments-card.service";
import { failedPaymentsCardService } from "../../services/failed-payments-card.service";
import { newCustomersCardService } from "../../services/new-customers-card.service";
import { topCustomersCardService } from "../../services/top-customers-card.service";
import { normalizeToUTC } from "../../utils/dateUtils";
import { X } from "lucide-react";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const Homepage = () => {
  const location = useLocation();
  const [selectedMetric, setSelectedMetric] = useState("gross_volume");
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [metricDropdownPosition, setMetricDropdownPosition] = useState({ top: 0, left: 0 });
  const metricButtonRef = useRef<HTMLButtonElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);
  // Top chart: selected single day (hourly)
  const [topSelectedDate, setTopSelectedDate] = useState<Date>(new Date());
  const [compareDatePickerOpen, setCompareDatePickerOpen] = useState(false);
  const [compareDatePickerPosition, setCompareDatePickerPosition] = useState({ top: 0, left: 0 });
  const compareDateButtonRef = useRef<HTMLButtonElement>(null);
  const compareDatePickerRef = useRef<HTMLDivElement>(null);

  // Overview section analytics state (decoupled from top chart)
  const [overviewDateRange, setOverviewDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // Last 7 days
    return {
      start,
      end,
      label: "Last 7 days",
    };
  });
  const [overviewFrequency, setOverviewFrequency] = useState("daily");
  const [overviewCompareOption, setOverviewCompareOption] = useState<string | null>(null);
  const [overviewAnalytics, setOverviewAnalytics] = useState<AnalyticsData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  // Separate state for top section analytics
  const [topAnalytics, setTopAnalytics] = useState<AnalyticsData | null>(null);
  const [topLoading, setTopLoading] = useState(true);
  const [sections, setSections] = useState<SectionType[]>([
    "payments",
    "grossVolume",
    "netVolume",
    "failedPayments",
    "newCustomers",
    "topCustomers",
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedSection, setDraggedSection] = useState<SectionType | null>(null);
  const [dragOverSection, setDragOverSection] = useState<SectionType | null>(null);

  // Fetch analytics for the top section (top metric overview)
  useEffect(() => {
    const fetchAnalytics = async () => {
      setTopLoading(true);
      try {
        // First, try to fetch from top section card service
        let topSectionData: TopSectionCardData | null = null;
        try {
          const topSectionResponse = await topSectionCardService.getByDate(topSelectedDate);
          if (topSectionResponse.data && !Array.isArray(topSectionResponse.data)) {
            topSectionData = topSectionResponse.data as TopSectionCardData;
          }
        } catch (topSectionErr) {
          console.log("No top section card data found, falling back to analytics");
        }

        // If we have top section card data, convert it to AnalyticsData format
        if (topSectionData) {
          // Helper function to convert TimeSeriesData to TimeSeriesPoint
          const convertTimeSeries = (data: { timestamp: Date; value: number }[]) => {
            return data.map(item => ({
              date: new Date(item.timestamp).toISOString(),
              value: item.value
            }));
          };

          const analyticsData: AnalyticsData = {
            grossVolume: {
              current: topSectionData.grossVolume.current,
              previous: topSectionData.grossVolume.previous,
              change: topSectionData.grossVolume.current - topSectionData.grossVolume.previous,
              changePercent: topSectionData.grossVolume.previous !== 0
                ? ((topSectionData.grossVolume.current - topSectionData.grossVolume.previous) / topSectionData.grossVolume.previous) * 100
                : 0,
              timeSeries: {
                current: convertTimeSeries(topSectionData.grossVolume.timeSeries.current),
                previous: convertTimeSeries(topSectionData.grossVolume.timeSeries.previous),
              },
            },
            netVolume: {
              current: topSectionData.netVolume.current,
              previous: topSectionData.netVolume.previous,
              change: topSectionData.netVolume.current - topSectionData.netVolume.previous,
              changePercent: topSectionData.netVolume.previous !== 0
                ? ((topSectionData.netVolume.current - topSectionData.netVolume.previous) / topSectionData.netVolume.previous) * 100
                : 0,
              timeSeries: {
                current: convertTimeSeries(topSectionData.netVolume.timeSeries.current),
                previous: convertTimeSeries(topSectionData.netVolume.timeSeries.previous),
              },
            },
            newCustomers: {
              current: topSectionData.newCustomers.current,
              previous: topSectionData.newCustomers.previous,
              change: topSectionData.newCustomers.current - topSectionData.newCustomers.previous,
              changePercent: topSectionData.newCustomers.previous !== 0
                ? ((topSectionData.newCustomers.current - topSectionData.newCustomers.previous) / topSectionData.newCustomers.previous) * 100
                : 0,
              timeSeries: {
                current: convertTimeSeries(topSectionData.newCustomers.timeSeries.current),
                previous: convertTimeSeries(topSectionData.newCustomers.timeSeries.previous),
              },
            },
            payments: [], // Not needed for top section
            failedPayments: [],
            topCustomersBySpend: [],
            updatedAt: topSectionData.updatedAt,
          };
          setTopAnalytics(analyticsData);
        } else {
          // Fall back to analytics service
          const start = normalizeToUTC(topSelectedDate, false);
          const end = normalizeToUTC(topSelectedDate, true);

          const response = await analyticsService.getAnalytics(
            "custom",
            "hourly",
            start,
            end,
            "previous_period"
          );
          setTopAnalytics(response.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setTopLoading(false);
      }
    };

    fetchAnalytics();
  }, [topSelectedDate]);

  // Fetch analytics for the overview section (separate state and request)
  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        // For overview, check if single day to auto-enable hourly
        const isSingleDay =
          overviewDateRange.start.getFullYear() === overviewDateRange.end.getFullYear() &&
          overviewDateRange.start.getMonth() === overviewDateRange.end.getMonth() &&
          overviewDateRange.start.getDate() === overviewDateRange.end.getDate();

        const effectiveFrequency = isSingleDay ? "hourly" : overviewFrequency;

        // Normalize dates to UTC start/end of day
        const response = await analyticsService.getAnalytics(
          "custom",
          effectiveFrequency,
          normalizeToUTC(overviewDateRange.start, false),
          normalizeToUTC(overviewDateRange.end, true),
          overviewCompareOption || "none"
        );
        
        let analyticsData = response.data;

        // For single day: fetch manual card data with hourly breakdown
        // For date range: fetch manual card data for the entire range
        if (isSingleDay) {
          // Single day - fetch hourly data
          const selectedDate = overviewDateRange.start;
          // Fetching manual card data for single day
          
          try {
            const [grossVolumeCard, netVolumeCard, paymentsCard, failedPaymentsCard, newCustomersCard, topCustomersCard] = await Promise.allSettled([
              grossVolumeCardService.getByDate(selectedDate),
              netVolumeCardService.getByDate(selectedDate),
              paymentsCardService.getByDate(selectedDate),
              failedPaymentsCardService.getByDate(selectedDate),
              newCustomersCardService.getByDate(selectedDate),
              topCustomersCardService.getByDate(selectedDate),
            ]);

            // Manual card data fetched

            // Override with manual data if available
            if (grossVolumeCard.status === 'fulfilled' && grossVolumeCard.value.data && !Array.isArray(grossVolumeCard.value.data)) {
              const data = grossVolumeCard.value.data;
              // Overriding Gross Volume with manual data
              
              // Convert timeSeries if available
              let timeSeriesCurrent = analyticsData.grossVolume.timeSeries.current;
              if (data.timeSeries && data.timeSeries.length > 0) {
                // Create a map of existing hourly data
                const hourlyMap = new Map();
                data.timeSeries.forEach(ts => {
                  const hour = new Date(ts.timestamp).getUTCHours();
                  hourlyMap.set(hour, ts.value);
                });
                
                // Build complete hourly timeSeries for ALL 24 hours (fill missing with 0)
                timeSeriesCurrent = [];
                for (let hour = 0; hour < 24; hour++) {
                  const timestamp = new Date(Date.UTC(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    hour,
                    0, 0, 0
                  ));
                  
                  timeSeriesCurrent.push({
                    date: timestamp.toISOString(),
                    value: hourlyMap.get(hour) || 0, // Use 0 for missing hours
                  });
                }
                
                // Gross Volume timeSeries processed
              }
              
              analyticsData.grossVolume = {
                ...analyticsData.grossVolume,
                current: data.value,
                change: data.change,
                changePercent: data.changePercent,
                timeSeries: {
                  ...analyticsData.grossVolume.timeSeries,
                  current: timeSeriesCurrent,
                },
              };
            }

            if (netVolumeCard.status === 'fulfilled' && netVolumeCard.value.data && !Array.isArray(netVolumeCard.value.data)) {
              const data = netVolumeCard.value.data;
              // Overriding Net Volume with manual data
              
              // Convert timeSeries if available
              let timeSeriesCurrent = analyticsData.netVolume.timeSeries.current;
              if (data.timeSeries && data.timeSeries.length > 0) {
                // Create a map of existing hourly data
                const hourlyMap = new Map();
                data.timeSeries.forEach(ts => {
                  const hour = new Date(ts.timestamp).getUTCHours();
                  hourlyMap.set(hour, ts.value);
                });
                
                // Build complete hourly timeSeries for ALL 24 hours (fill missing with 0)
                timeSeriesCurrent = [];
                for (let hour = 0; hour < 24; hour++) {
                  const timestamp = new Date(Date.UTC(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    hour,
                    0, 0, 0
                  ));
                  
                  timeSeriesCurrent.push({
                    date: timestamp.toISOString(),
                    value: hourlyMap.get(hour) || 0,
                  });
                }
                
                // Net Volume timeSeries processed
              }
              
              analyticsData.netVolume = {
                ...analyticsData.netVolume,
                current: data.value,
                change: data.change,
                changePercent: data.changePercent,
                timeSeries: {
                  ...analyticsData.netVolume.timeSeries,
                  current: timeSeriesCurrent,
                },
              };
            }

            if (paymentsCard.status === 'fulfilled' && paymentsCard.value.data && !Array.isArray(paymentsCard.value.data)) {
              const data = paymentsCard.value.data;
              // Overriding Payments with manual data
              
              // Convert payment transactions to Transaction format
              if (data.transactions && data.transactions.length > 0) {
                analyticsData.payments = data.transactions.map((t, index) => ({
                  _id: t.id,
                  amount: t.amount,
                  currency: "USD",
                  number: `#${index + 1}`,
                  owner: "Customer",
                  owner_email: "customer@example.com",
                  fingerprint: "",
                  expires: "",
                  type: "card",
                  issuer: "Visa",
                  cvc_check: true,
                  origin: "online",
                  address: "",
                  status: t.status === "successful" ? "succeeded" : "failed",
                  activity_history: [],
                  payment_id: t.id,
                  payment_method: {
                    card_type: "Visa",
                    cart_last_four: "4242",
                  },
                  description: t.description,
                  statement_descriptor: t.description,
                  risk_evaluation: {
                    score: 0,
                    level: "low",
                  },
                  country: "US",
                  items: [],
                  createdAt: new Date(t.date),
                }));
              }
            }

            if (failedPaymentsCard.status === 'fulfilled' && failedPaymentsCard.value.data && !Array.isArray(failedPaymentsCard.value.data)) {
              const data = failedPaymentsCard.value.data;
              // Overriding Failed Payments with manual data
              
              // Convert failed payment transactions to Transaction format
              if (data.transactions && data.transactions.length > 0) {
                analyticsData.failedPayments = data.transactions.map((t, index) => ({
                  _id: t.id,
                  amount: t.amount,
                  currency: "USD",
                  number: `#${index + 1}`,
                  owner: "Customer",
                  owner_email: "customer@example.com",
                  fingerprint: "",
                  expires: "",
                  type: "card",
                  issuer: "Visa",
                  cvc_check: true,
                  origin: "online",
                  address: "",
                  status: "failed",
                  activity_history: [],
                  payment_id: t.id,
                  payment_method: {
                    card_type: "Visa",
                    cart_last_four: "4242",
                  },
                  description: t.description,
                  statement_descriptor: t.description,
                  decline_reason: t.reason,
                  risk_evaluation: {
                    score: 0,
                    level: "low",
                  },
                  country: "US",
                  items: [],
                  createdAt: new Date(t.date),
                }));
              }
            }

            if (newCustomersCard.status === 'fulfilled' && newCustomersCard.value.data && !Array.isArray(newCustomersCard.value.data)) {
              const data = newCustomersCard.value.data;
              // Overriding New Customers with manual data
              analyticsData.newCustomers = {
                ...analyticsData.newCustomers,
                current: data.count,
                change: data.change,
                changePercent: data.changePercent,
              };
            }

            if (topCustomersCard.status === 'fulfilled' && topCustomersCard.value.data && !Array.isArray(topCustomersCard.value.data)) {
              const data = topCustomersCard.value.data;
              // Overriding Top Customers with manual data
              
              // Convert top customers to analytics format
              if (data.customers && data.customers.length > 0) {
                analyticsData.topCustomersBySpend = data.customers.map(c => ({
                  customer_id: c.customerId,
                  owner_email: c.email,
                  owner: c.name,
                  totalSpend: c.totalSpend,
                  transactionCount: c.transactionCount,
                }));
              }
            }
          } catch (cardErr) {
            // Error fetching card data, using analytics data
          }
        } else {
          // Multi-day range - fetch data for all days in range
          // Fetching manual card data for date range
          
          try {
            // Fetch data for the entire range
            const [grossVolumeRange, netVolumeRange, paymentsRange, failedPaymentsRange, topCustomersRange] = await Promise.allSettled([
              grossVolumeCardService.getByDateRange(overviewDateRange.start, overviewDateRange.end),
              netVolumeCardService.getByDateRange(overviewDateRange.start, overviewDateRange.end),
              paymentsCardService.getByDateRange(overviewDateRange.start, overviewDateRange.end),
              failedPaymentsCardService.getByDateRange(overviewDateRange.start, overviewDateRange.end),
              topCustomersCardService.getByDateRange(overviewDateRange.start, overviewDateRange.end),
            ]);

            // Process Gross Volume range data
            if (grossVolumeRange.status === 'fulfilled' && grossVolumeRange.value.data) {
              const dataArray = Array.isArray(grossVolumeRange.value.data) ? grossVolumeRange.value.data : [];
              // Gross Volume range data processed
              
              // Create a map of existing data by date
              const dataMap = new Map();
              dataArray.forEach(dayData => {
                const dateKey = new Date(dayData.date).toISOString().split('T')[0];
                dataMap.set(dateKey, dayData.value);
              });
              
              // Build complete daily timeSeries for ALL days in range (fill missing with 0)
              const dailyTimeSeries = [];
              const currentDate = new Date(overviewDateRange.start);
              const endDate = new Date(overviewDateRange.end);
              
              while (currentDate <= endDate) {
                const dateKey = currentDate.toISOString().split('T')[0];
                const value = dataMap.get(dateKey) || 0; // Use 0 for missing days
                
                dailyTimeSeries.push({
                  date: new Date(currentDate).toISOString(),
                  value: value,
                });
                
                currentDate.setDate(currentDate.getDate() + 1);
              }
              
              // Calculate total for the range (only from actual data)
              const totalValue = dataArray.reduce((sum, d) => sum + d.value, 0);
              
              // Gross Volume complete timeSeries created
              
              analyticsData.grossVolume = {
                ...analyticsData.grossVolume,
                current: totalValue,
                timeSeries: {
                  ...analyticsData.grossVolume.timeSeries,
                  current: dailyTimeSeries,
                },
              };
            }

            // Process Net Volume range data
            if (netVolumeRange.status === 'fulfilled' && netVolumeRange.value.data) {
              const dataArray = Array.isArray(netVolumeRange.value.data) ? netVolumeRange.value.data : [];
              // Net Volume range data processed
              
              // Create a map of existing data by date
              const dataMap = new Map();
              dataArray.forEach(dayData => {
                const dateKey = new Date(dayData.date).toISOString().split('T')[0];
                dataMap.set(dateKey, dayData.value);
              });
              
              // Build complete daily timeSeries for ALL days in range (fill missing with 0)
              const dailyTimeSeries = [];
              const currentDate = new Date(overviewDateRange.start);
              const endDate = new Date(overviewDateRange.end);
              
              while (currentDate <= endDate) {
                const dateKey = currentDate.toISOString().split('T')[0];
                const value = dataMap.get(dateKey) || 0; // Use 0 for missing days
                
                dailyTimeSeries.push({
                  date: new Date(currentDate).toISOString(),
                  value: value,
                });
                
                currentDate.setDate(currentDate.getDate() + 1);
              }
              
              // Calculate total for the range (only from actual data)
              const totalValue = dataArray.reduce((sum, d) => sum + d.value, 0);
              
              // Net Volume complete timeSeries created
              
              analyticsData.netVolume = {
                ...analyticsData.netVolume,
                current: totalValue,
                timeSeries: {
                  ...analyticsData.netVolume.timeSeries,
                  current: dailyTimeSeries,
                },
              };
            }

            // Process Payments range data - aggregate all transactions from all days
            console.log("DEBUG - paymentsRange:", paymentsRange);
            if (paymentsRange.status === 'fulfilled' && paymentsRange.value.data && Array.isArray(paymentsRange.value.data)) {
              const dataArray = paymentsRange.value.data;
              console.log("DEBUG - Payments dataArray:", dataArray);
              console.log("DEBUG - First item transactions:", dataArray[0]?.transactions);
              
              // Aggregate all transactions from all days
              const allTransactions: any[] = [];
              dataArray.forEach(dayData => {
                console.log("DEBUG - dayData.transactions:", dayData.transactions);
                if (dayData.transactions && dayData.transactions.length > 0) {
                  console.log("DEBUG - Found", dayData.transactions.length, "transactions");
                  dayData.transactions.forEach(t => {
                    allTransactions.push({
                      _id: t.id,
                      amount: t.amount,
                      currency: "USD",
                      number: `#${allTransactions.length + 1}`,
                      owner: "Customer",
                      owner_email: "customer@example.com",
                      fingerprint: "",
                      expires: "",
                      type: "card",
                      issuer: "Visa",
                      cvc_check: true,
                      origin: "online",
                      address: "",
                      status: t.status === "successful" ? "succeeded" : "failed",
                      activity_history: [],
                      payment_id: t.id,
                      payment_method: {
                        card_type: "Visa",
                        cart_last_four: "4242",
                      },
                      description: t.description,
                      statement_descriptor: t.description,
                      risk_evaluation: {
                        score: 0,
                        level: "low",
                      },
                      country: "US",
                      items: [],
                      createdAt: new Date(t.date),
                    });
                  });
                }
              });
              
              console.log("DEBUG - Total allTransactions:", allTransactions.length);
              if (allTransactions.length > 0) {
                // Total payment transactions aggregated
                analyticsData.payments = allTransactions;
                console.log("DEBUG - Set analyticsData.payments to:", allTransactions);
              }
            }

            // Process Failed Payments range data - aggregate all transactions from all days
            if (failedPaymentsRange.status === 'fulfilled' && failedPaymentsRange.value.data && Array.isArray(failedPaymentsRange.value.data)) {
              const dataArray = failedPaymentsRange.value.data;
              
              // Aggregate all failed transactions from all days
              const allFailedTransactions: any[] = [];
              dataArray.forEach(dayData => {
                if (dayData.transactions && dayData.transactions.length > 0) {
                  dayData.transactions.forEach(t => {
                    allFailedTransactions.push({
                      _id: t.id,
                      amount: t.amount,
                      currency: "USD",
                      number: `#${allFailedTransactions.length + 1}`,
                      owner: "Customer",
                      owner_email: "customer@example.com",
                      fingerprint: "",
                      expires: "",
                      type: "card",
                      issuer: "Visa",
                      cvc_check: true,
                      origin: "online",
                      address: "",
                      status: "failed",
                      activity_history: [],
                      payment_id: t.id,
                      payment_method: {
                        card_type: "Visa",
                        cart_last_four: "4242",
                      },
                      description: t.description,
                      statement_descriptor: t.description,
                      decline_reason: t.reason,
                      risk_evaluation: {
                        score: 0,
                        level: "low",
                      },
                      country: "US",
                      items: [],
                      createdAt: new Date(t.date),
                    });
                  });
                }
              });
              
              if (allFailedTransactions.length > 0) {
                // Total failed payment transactions aggregated
                analyticsData.failedPayments = allFailedTransactions;
              }
            }

            // Process Top Customers range data - aggregate and rank by total spend
            if (topCustomersRange.status === 'fulfilled' && topCustomersRange.value.data && Array.isArray(topCustomersRange.value.data)) {
              const dataArray = topCustomersRange.value.data;
              
              // Aggregate customers across all days by customer_id/email
              const customerMap = new Map();
              dataArray.forEach(dayData => {
                if (dayData.customers && dayData.customers.length > 0) {
                  dayData.customers.forEach(c => {
                    const key = c.customerId || c.email || c.name;
                    if (customerMap.has(key)) {
                      const existing = customerMap.get(key);
                      existing.totalSpend += c.totalSpend;
                      existing.transactionCount += c.transactionCount;
                    } else {
                      customerMap.set(key, {
                        customer_id: c.customerId,
                        owner_email: c.email,
                        owner: c.name,
                        totalSpend: c.totalSpend,
                        transactionCount: c.transactionCount,
                      });
                    }
                  });
                }
              });
              
              if (customerMap.size > 0) {
                // Convert to array and sort by totalSpend descending
                const aggregatedCustomers = Array.from(customerMap.values())
                  .sort((a, b) => b.totalSpend - a.totalSpend);
                
                // Total unique customers aggregated
                analyticsData.topCustomersBySpend = aggregatedCustomers;
              }
            }
          } catch (rangeErr) {
            // Error fetching range data, using analytics data
          }
        }

        // Analytics data prepared
        console.log("DEBUG - Final analyticsData.payments:", analyticsData.payments.length, analyticsData.payments);

        setOverviewAnalytics(analyticsData);
      } catch (err) {
        setOverviewError(err instanceof Error ? err.message : "Failed to fetch analytics");
        console.error("Error fetching overview analytics:", err);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [overviewDateRange, overviewFrequency, overviewCompareOption]);

  const metricOptions = [
    { value: "gross_volume", label: "Gross volume" },
    { value: "new_customers", label: "New customers" },
    { value: "successful_payments", label: "Successful payments" },
    { value: "net_volume", label: "Net volume" },
  ];

  const getCurrentMetricValue = () => {
    if (!topAnalytics) return 0;
    switch (selectedMetric) {
      case "gross_volume":
        return topAnalytics.grossVolume.current;
      case "net_volume":
        return topAnalytics.netVolume.current;
      case "new_customers":
        return topAnalytics.newCustomers.current;
      case "successful_payments":
        return topAnalytics.payments.filter((p: any) => p.status === "succeeded").length;
      default:
        return 0;
    }
  };

  const getPreviousMetricValue = () => {
    if (!topAnalytics) return 0;
    switch (selectedMetric) {
      case "gross_volume":
        return topAnalytics.grossVolume.previous;
      case "net_volume":
        return topAnalytics.netVolume.previous;
      case "new_customers":
        return topAnalytics.newCustomers.previous;
      case "successful_payments":
        // For successful payments, we'd need previous period payments data
        // For now, return 0 or calculate from failed payments if available
        return 0;
      default:
        return 0;
    }
  };

  const getMetricTimeSeries = () => {
    if (!topAnalytics) return { current: [], previous: [] };
    switch (selectedMetric) {
      case "gross_volume":
        return topAnalytics.grossVolume.timeSeries;
      case "net_volume":
        return topAnalytics.netVolume.timeSeries;
      case "new_customers":
        return topAnalytics.newCustomers.timeSeries;
      case "successful_payments":
        // For successful payments, we'd need to generate time series from payments
        // For now, return empty or use gross volume as placeholder
        return topAnalytics.grossVolume.timeSeries;
      default:
        return { current: [], previous: [] };
    }
  };

  const formatMetricValue = (value: number) => {
    if (selectedMetric === "new_customers" || selectedMetric === "successful_payments") {
      return value.toString();
    }
    return `US$${value.toFixed(2)}`;
  };

  const formatSelectedDate = (date: Date): string => {
    // Use UTC dates for consistent comparison
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setDate(yesterdayUTC.getDate() - 1);
    
    // Normalize input date to UTC for comparison
    const dateUTC = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if it's yesterday (UTC)
    if (dateUTC.getTime() === yesterdayUTC.getTime()) {
      return "Yesterday";
    }
    
    // Check if it's today (UTC)
    if (dateUTC.getTime() === todayUTC.getTime()) {
      return "Today";
    }
    
    // Otherwise show formatted date (using local methods for consistency)
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const updateMetricDropdownPosition = () => {
    if (metricButtonRef.current) {
      const rect = metricButtonRef.current.getBoundingClientRect();
      setMetricDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const updateCompareDatePickerPosition = () => {
    if (compareDateButtonRef.current) {
      const rect = compareDateButtonRef.current.getBoundingClientRect();
      setCompareDatePickerPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        metricDropdownRef.current &&
        !metricDropdownRef.current.contains(event.target as Node) &&
        metricButtonRef.current &&
        !metricButtonRef.current.contains(event.target as Node)
      ) {
        setMetricDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (metricDropdownOpen) {
        updateMetricDropdownPosition();
      }
    };

    const handleResize = () => {
      if (metricDropdownOpen) {
        updateMetricDropdownPosition();
      }
    };

    const handleCompareDateScroll = () => {
      if (compareDatePickerOpen) {
        updateCompareDatePickerPosition();
      }
    };

    const handleCompareDateResize = () => {
      if (compareDatePickerOpen) {
        updateCompareDatePickerPosition();
      }
    };

    const handleCompareDateClickOutside = (event: MouseEvent) => {
      if (
        compareDatePickerRef.current &&
        !compareDatePickerRef.current.contains(event.target as Node) &&
        compareDateButtonRef.current &&
        !compareDateButtonRef.current.contains(event.target as Node)
      ) {
        setCompareDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleCompareDateClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("scroll", handleCompareDateScroll, true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleCompareDateResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleCompareDateClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleCompareDateScroll, true);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleCompareDateResize);
    };
  }, [metricDropdownOpen, compareDatePickerOpen]);

  const handleAddSection = (sectionId: SectionType) => {
    if (!sections.includes(sectionId)) {
      setSections([...sections, sectionId]);
    }
  };

  const handleRemoveSection = (sectionId: SectionType) => {
    setSections(sections.filter((id) => id !== sectionId));
  };

  const handleDragStart = (sectionId: SectionType) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      e.dataTransfer.dropEffect = "move";
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragEnter = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const draggedIndex = sections.indexOf(draggedSection);
    const targetIndex = sections.indexOf(targetSectionId);
    const newSections = [...sections];
    newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const renderSection = (sectionId: SectionType, index: number) => {
    if (!overviewAnalytics) return null;

    const sectionProps = {
      draggable: isEditMode,
      onDragStart: (e: React.DragEvent) => {
        if (isEditMode) {
          handleDragStart(sectionId);
          e.dataTransfer.effectAllowed = "move";
        }
      },
      onDragOver: (e: React.DragEvent) => handleDragOver(e, sectionId),
      onDragEnter: (e: React.DragEvent) => handleDragEnter(e, sectionId),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, sectionId),
      onDragEnd: handleDragEnd,
      className: cn(
        "relative transition-all h-full",
        isEditMode && "cursor-move",
        draggedSection === sectionId && "opacity-50 scale-95",
        dragOverSection === sectionId && draggedSection !== sectionId && "ring-2 ring-[#533afd]"
      ),
    };

    switch (sectionId) {
      case "payments":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <PaymentsCard payments={overviewAnalytics.payments} />
          </div>
        );
      case "grossVolume":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <GrossVolumeCard
              data={overviewAnalytics.grossVolume}
              updatedAt={overviewAnalytics.updatedAt}
            />
          </div>
        );
      case "netVolume":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NetVolumeCard
              data={overviewAnalytics.netVolume}
              updatedAt={overviewAnalytics.updatedAt}
            />
          </div>
        );
      case "failedPayments":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <FailedPaymentsCard failedPayments={overviewAnalytics.failedPayments} />
          </div>
        );
      case "newCustomers":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NewCustomersCard
              data={overviewAnalytics.newCustomers}
              updatedAt={overviewAnalytics.updatedAt}
            />
          </div>
        );
      case "topCustomers":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <TopCustomersCard topCustomers={overviewAnalytics.topCustomersBySpend} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Home | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          property="og:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          name="twitter:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="stripe dashboard, payment analytics, financial dashboard, transaction analytics, payment management"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full">
      <div className="w-full">
      <h1 className="text-3xl font-bold py-2 border-b border-[#e5e7eb]">
        {formatSelectedDate(topSelectedDate)}
      </h1>
      <div className="mt-6 w-full flex flex-col lg:flex-row gap-4 justify-between items-stretch">
        <div className="flex flex-col w-full">
            <div className="tabs flex gap-6 items-start">
              <div className="gross-volume-tab-switch flex flex-col shrink-0 relative">
              <button
                  ref={metricButtonRef}
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                  onClick={() => {
                    if (!metricDropdownOpen) {
                      updateMetricDropdownPosition();
                    }
                    setMetricDropdownOpen(!metricDropdownOpen);
                  }}
                >
                  <span className="text-sm font-normal">
                    {metricOptions.find(opt => opt.value === selectedMetric)?.label || "Gross volume"}
                  </span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                        "rotate-180": metricDropdownOpen,
                    }
                  )}
                />
              </button>
              <span className="text-xl font-normal text-[#353a44]">
                  {formatMetricValue(getCurrentMetricValue())}
              </span>
                {metricDropdownOpen &&
                  createPortal(
                    <div
                      ref={metricDropdownRef}
                      className="fixed bg-white border border-[#e5e7eb] rounded-md shadow-lg z-[10000] min-w-[180px]"
                      style={{
                        top: `${metricDropdownPosition.top}px`,
                        left: `${metricDropdownPosition.left}px`,
                      }}
                    >
                      {metricOptions.map((option) => (
                        <button
                          key={option.value}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8] transition-colors flex items-center justify-between",
                            {
                              "text-[#533afd] bg-[#f5f6f8]": selectedMetric === option.value,
                              "text-[#353a44]": selectedMetric !== option.value,
                            }
                          )}
                          onClick={() => {
                            setSelectedMetric(option.value);
                            setMetricDropdownOpen(false);
                          }}
                        >
                          <span>{option.label}</span>
                          {selectedMetric === option.value && (
                            <span className="text-[#533afd]">✓</span>
                          )}
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
            </div>
              <div className="date-tab-switch flex flex-col shrink-0 relative">
              <button
                  ref={compareDateButtonRef}
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                  onClick={() => {
                    if (!compareDatePickerOpen) {
                      updateCompareDatePickerPosition();
                    }
                    setCompareDatePickerOpen(!compareDatePickerOpen);
                    setMetricDropdownOpen(false);
                  }}
              >
                <span className="text-sm font-normal">
                    {formatSelectedDate(topSelectedDate)}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                        "rotate-180": compareDatePickerOpen,
                    }
                  )}
                />
              </button>
                <span className="text-xl font-normal text-[#353a44]">
                  {formatMetricValue(getPreviousMetricValue())}
              </span>
                {compareDatePickerOpen &&
                  createPortal(
                    <div
                      ref={compareDatePickerRef}
                      className="fixed z-[10001]"
                      style={{
                        top: `${compareDatePickerPosition.top}px`,
                        left: `${compareDatePickerPosition.left}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SingleDatePicker
                        isOpen={compareDatePickerOpen}
                        onClose={() => setCompareDatePickerOpen(false)}
                        onApply={(date) => {
                          setTopSelectedDate(date);
                          setCompareDatePickerOpen(false);
                        }}
                        currentDate={topSelectedDate}
                      />
                    </div>,
                    document.body
                  )}
            </div>
          </div>
            <LineChart 
              currentData={getMetricTimeSeries().current}
              previousData={getMetricTimeSeries().previous}
              currency={selectedMetric === "new_customers" || selectedMetric === "successful_payments" ? "" : "US$"}
              showPrevious={false}
              startDate={topSelectedDate}
              endDate={topSelectedDate}
            />
        </div>
        <HeroSection data={topAnalytics} loading={topLoading} />
      </div>
      </div>
      <SecondSectionHeader
        dateRange="" // not used in simplified version
        frequency={overviewFrequency}
        compareOption={overviewCompareOption}
        dateRangeObj={overviewDateRange}
        onDateRangeChange={(range) => {
          setOverviewDateRange(range);
          // Auto-switch to hourly for single day
          if (
            range.start.getFullYear() === range.end.getFullYear() &&
            range.start.getMonth() === range.end.getMonth() &&
            range.start.getDate() === range.end.getDate()
          ) {
            setOverviewFrequency("hourly");
          } else if (overviewFrequency === "hourly") {
            setOverviewFrequency("daily");
          }
        }}
        onFrequencyChange={setOverviewFrequency}
        onCompareChange={setOverviewCompareOption}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={() => setIsEditMode(!isEditMode)}
        isEditMode={isEditMode}
      />
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSection}
        existingSections={sections}
      />
      {overviewLoading ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-gray-500">Loading analytics...</div>
              </div>
      ) : overviewError ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-red-500">Error: {overviewError}</div>
          </div>
      ) : overviewAnalytics ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-2 bg-[#f5f6f8] rounded-md p-2 mt-2 mb-16 relative z-0" style={{ gridAutoRows: "380px", alignContent: "start" }}>
          {sections.map((sectionId, index) => renderSection(sectionId, index))}
      </div>
      ) : null}
    </div>
    </>
  );
};

export default Homepage;
