import { useState, useEffect } from "react";
import { analyticsService } from "../../../services/analytics.service";
import type { AnalyticsData } from "../../../services/analytics.service";
import { homepageService } from "../../../services/homepage.service";
import { normalizeToUTC } from "../../../utils/dateUtils";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export const useOverviewAnalytics = (
  overviewDateRange: DateRange,
  overviewFrequency: string,
  overviewCompareOption: string | null,
  username: string | null
) => {
  const [overviewAnalytics, setOverviewAnalytics] =
    useState<AnalyticsData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);

      // Get the actual username to use (fetch default if username is null)
      let targetUsername: string = username || "default";
      if (!username) {
        try {
          // Fetch default homepage to get the default username
          const defaultHomepage = await homepageService.getHomepage(null);
          if (
            defaultHomepage.data &&
            typeof defaultHomepage.data === "object" &&
            "username" in defaultHomepage.data
          ) {
            targetUsername = (defaultHomepage.data as any).username;
          }
        } catch (err) {
          // If fetching default fails, keep "default" as fallback
          console.warn(
            "Failed to fetch default homepage, using 'default' as username"
          );
        }
      }
      try {
        // Check if single day for proper frequency handling
        const isSingleDay =
          overviewDateRange.start.getFullYear() ===
            overviewDateRange.end.getFullYear() &&
          overviewDateRange.start.getMonth() ===
            overviewDateRange.end.getMonth() &&
          overviewDateRange.start.getDate() === overviewDateRange.end.getDate();

        // For hourly with multi-day range, only fetch the last day's hourly data
        let fetchStartDate = overviewDateRange.start;
        let fetchEndDate = overviewDateRange.end;

        if (overviewFrequency === "hourly" && !isSingleDay) {
          // Only fetch hourly data for the end date
          fetchStartDate = new Date(overviewDateRange.end);
          fetchStartDate.setHours(0, 0, 0, 0);
        }
        // Fetch analytics data first as a base/fallback
        // Manual data will override analytics data if it exists
        // This approach ensures we always have data even if manual data is incomplete
        const response = await analyticsService.getAnalytics(
          "custom",
          overviewFrequency,
          normalizeToUTC(fetchStartDate, false),
          normalizeToUTC(fetchEndDate, true),
          overviewCompareOption || "none"
        );

        let analyticsData = response.data;

        // For single day: fetch manual card data with hourly breakdown
        // For date range: fetch manual card data for the entire range
        if (isSingleDay) {
          // Single day - fetch hourly data
          const selectedDate = overviewDateRange.start;
          // Fetching manual card data for single day using username-based service

          try {
            const [
              grossVolumeCard,
              netVolumeCard,
              paymentsCard,
              failedPaymentsCard,
              newCustomersCard,
              topCustomersCard,
            ] = await Promise.allSettled([
              homepageService.getCard(
                targetUsername,
                "Gross Volume Card",
                selectedDate
              ),
              homepageService.getCard(
                targetUsername,
                "Net Volume Card",
                selectedDate
              ),
              homepageService.getCard(
                targetUsername,
                "Payment Card",
                selectedDate
              ),
              homepageService.getCard(
                targetUsername,
                "Failed Payments Card",
                selectedDate
              ),
              homepageService.getCard(
                targetUsername,
                "New Customers Card",
                selectedDate
              ),
              homepageService.getCard(
                targetUsername,
                "Top Customers Card",
                selectedDate
              ),
            ]);

            // Override with manual data if available (for all frequencies)
            if (
              grossVolumeCard.status === "fulfilled" &&
              grossVolumeCard.value.data &&
              !Array.isArray(grossVolumeCard.value.data)
            ) {
              const cardEntry = grossVolumeCard.value.data as any;
              const data = cardEntry?.data;
              if (data) {
                // Convert timeSeries if available (for all frequencies - graph needs hourly data)
                let timeSeriesCurrent =
                  analyticsData.grossVolume.timeSeries.current;

                // Always build timeSeries from manual data if available
                if (data.timeSeries && data.timeSeries.length > 0) {
                  // Create a map of existing hourly data
                  const hourlyMap = new Map();
                  data.timeSeries.forEach((ts: any) => {
                    const hour = new Date(ts.timestamp).getUTCHours();
                    hourlyMap.set(hour, ts.value);
                  });

                  // Build complete hourly timeSeries for ALL 24 hours (fill missing with 0)
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyMap.get(hour) || 0, // Use 0 for missing hours
                    });
                  }
                } else if (data.value) {
                  // If no timeSeries but we have a value, create timeSeries by dividing value equally across 24 hours
                  const hourlyValue = data.value / 24;
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyValue,
                    });
                  }
                }

                analyticsData.grossVolume = {
                  ...analyticsData.grossVolume,
                  current: data.value || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  timeSeries: {
                    ...analyticsData.grossVolume.timeSeries,
                    current: timeSeriesCurrent,
                  },
                };
              }
            }

            if (
              netVolumeCard.status === "fulfilled" &&
              netVolumeCard.value.data &&
              !Array.isArray(netVolumeCard.value.data)
            ) {
              const cardEntry = netVolumeCard.value.data as any;
              const data = cardEntry?.data;
              // Overriding Net Volume with manual data (for all frequencies)
              if (data) {
                // Convert timeSeries if available (for all frequencies - graph needs hourly data)
                let timeSeriesCurrent =
                  analyticsData.netVolume.timeSeries.current;

                // Always build timeSeries from manual data if available
                if (data.timeSeries && data.timeSeries.length > 0) {
                  // Create a map of existing hourly data
                  const hourlyMap = new Map();
                  data.timeSeries.forEach((ts: any) => {
                    const hour = new Date(ts.timestamp).getUTCHours();
                    hourlyMap.set(hour, ts.value);
                  });

                  // Build complete hourly timeSeries for ALL 24 hours (fill missing with 0)
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyMap.get(hour) || 0,
                    });
                  }
                } else if (data.value) {
                  // If no timeSeries but we have a value, create timeSeries by dividing value equally across 24 hours
                  const hourlyValue = data.value / 24;
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyValue,
                    });
                  }
                }

                analyticsData.netVolume = {
                  ...analyticsData.netVolume,
                  current: data.value || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  timeSeries: {
                    ...analyticsData.netVolume.timeSeries,
                    current: timeSeriesCurrent,
                  },
                };
              }
            }

            if (
              paymentsCard.status === "fulfilled" &&
              paymentsCard.value.data &&
              !Array.isArray(paymentsCard.value.data)
            ) {
              const cardEntry = paymentsCard.value.data as any;
              const data = cardEntry?.data;
              // Overriding Payments with manual data (only if data exists)
              if (data && data.transactions && data.transactions.length > 0) {
                // Convert payment transactions to Transaction format
                analyticsData.payments = data.transactions.map(
                  (t: any, index: number) => ({
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
                  })
                );
              }
            }

            if (
              failedPaymentsCard.status === "fulfilled" &&
              failedPaymentsCard.value.data &&
              !Array.isArray(failedPaymentsCard.value.data)
            ) {
              const cardEntry = failedPaymentsCard.value.data as any;
              const data = cardEntry?.data;
              // Overriding Failed Payments with manual data (only if data exists)
              if (data && data.transactions && data.transactions.length > 0) {
                // Convert failed payment transactions to Transaction format
                analyticsData.failedPayments = data.transactions.map(
                  (t: any, index: number) => ({
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
                  })
                );
              }
            }

            if (
              newCustomersCard.status === "fulfilled" &&
              newCustomersCard.value.data &&
              !Array.isArray(newCustomersCard.value.data)
            ) {
              const cardEntry = newCustomersCard.value.data as any;
              const data = cardEntry?.data;
              // Overriding New Customers with manual data (for all frequencies)
              if (data) {
                // Convert timeSeries if available (for all frequencies - graph needs hourly data)
                let timeSeriesCurrent =
                  analyticsData.newCustomers.timeSeries.current;

                // Always build timeSeries from manual data if available
                if (data.timeSeries && data.timeSeries.length > 0) {
                  // Create a map of existing hourly data
                  const hourlyMap = new Map();
                  data.timeSeries.forEach((ts: any) => {
                    const hour = new Date(ts.timestamp).getUTCHours();
                    hourlyMap.set(hour, ts.value);
                  });

                  // Build complete hourly timeSeries for ALL 24 hours (fill missing with 0)
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyMap.get(hour) || 0,
                    });
                  }
                } else if (data.count !== undefined) {
                  // If no timeSeries but we have a count, create timeSeries by dividing count equally across 24 hours
                  const hourlyValue = data.count / 24;
                  timeSeriesCurrent = [];
                  for (let hour = 0; hour < 24; hour++) {
                    const timestamp = new Date(
                      Date.UTC(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        hour,
                        0,
                        0,
                        0
                      )
                    );

                    timeSeriesCurrent.push({
                      date: timestamp.toISOString(),
                      value: hourlyValue,
                    });
                  }
                }

                analyticsData.newCustomers = {
                  ...analyticsData.newCustomers,
                  current: data.count || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  timeSeries: {
                    ...analyticsData.newCustomers.timeSeries,
                    current: timeSeriesCurrent,
                  },
                };
              }
            }

            if (
              topCustomersCard.status === "fulfilled" &&
              topCustomersCard.value.data &&
              !Array.isArray(topCustomersCard.value.data)
            ) {
              const cardEntry = topCustomersCard.value.data as any;
              const data = cardEntry?.data;
              // Overriding Top Customers with manual data (only if data exists)
              if (data && data.customers && data.customers.length > 0) {
                // Convert top customers to analytics format
                analyticsData.topCustomersBySpend = data.customers.map(
                  (c: any) => ({
                    customer_id: c.customerId,
                    owner_email: c.email,
                    owner: c.name,
                    totalSpend: c.totalSpend,
                    transactionCount: c.transactionCount,
                  })
                );
              }
            }
          } catch (cardErr) {
            // Error fetching card data, using analytics data
          }
        }
        // For multi-day ranges, we rely solely on the analytics API data

        // Normalize date strings in timeSeries to ISO format for consistent sorting and display
        // Analytics API returns dates as "2025-12-02", convert to ISO format
        const normalizeTimeSeriesDates = (timeSeries: any[]) => {
          return timeSeries.map((point: any) => {
            // If date is already in ISO format, keep it
            if (point.date && point.date.includes("T")) {
              return point;
            }
            // If date is in "YYYY-MM-DD" format, convert to ISO
            if (point.date && /^\d{4}-\d{2}-\d{2}$/.test(point.date)) {
              return {
                ...point,
                date: `${point.date}T00:00:00.000Z`,
              };
            }
            return point;
          });
        };

        // Normalize all timeSeries dates
        if (analyticsData.grossVolume?.timeSeries?.current) {
          analyticsData.grossVolume.timeSeries.current =
            normalizeTimeSeriesDates(
              analyticsData.grossVolume.timeSeries.current
            );
        }
        if (analyticsData.grossVolume?.timeSeries?.previous) {
          analyticsData.grossVolume.timeSeries.previous =
            normalizeTimeSeriesDates(
              analyticsData.grossVolume.timeSeries.previous
            );
        }
        if (analyticsData.netVolume?.timeSeries?.current) {
          analyticsData.netVolume.timeSeries.current = normalizeTimeSeriesDates(
            analyticsData.netVolume.timeSeries.current
          );
        }
        if (analyticsData.netVolume?.timeSeries?.previous) {
          analyticsData.netVolume.timeSeries.previous =
            normalizeTimeSeriesDates(
              analyticsData.netVolume.timeSeries.previous
            );
        }
        if (analyticsData.newCustomers?.timeSeries?.current) {
          analyticsData.newCustomers.timeSeries.current =
            normalizeTimeSeriesDates(
              analyticsData.newCustomers.timeSeries.current
            );
        }
        if (analyticsData.newCustomers?.timeSeries?.previous) {
          analyticsData.newCustomers.timeSeries.previous =
            normalizeTimeSeriesDates(
              analyticsData.newCustomers.timeSeries.previous
            );
        }
        if (analyticsData.successfulPayments?.timeSeries?.current) {
          analyticsData.successfulPayments.timeSeries.current =
            normalizeTimeSeriesDates(
              analyticsData.successfulPayments.timeSeries.current
            );
        }
        if (analyticsData.successfulPayments?.timeSeries?.previous) {
          analyticsData.successfulPayments.timeSeries.previous =
            normalizeTimeSeriesDates(
              analyticsData.successfulPayments.timeSeries.previous
            );
        }

        // Analytics data prepared

        setOverviewAnalytics(analyticsData);
      } catch (err) {
        setOverviewError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
        console.error("Error fetching overview analytics:", err);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [overviewDateRange, overviewFrequency, overviewCompareOption, username]);

  return { overviewAnalytics, overviewLoading, overviewError };
};
