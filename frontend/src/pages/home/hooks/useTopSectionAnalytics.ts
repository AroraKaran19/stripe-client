import { useState, useEffect } from "react";
import { analyticsService } from "../../../services/analytics.service";
import type { AnalyticsData } from "../../../services/analytics.service";
import { homepageService } from "../../../services/homepage.service";
import { topSectionCardService } from "../../../services/top-section-card.service";
import type { TopSectionCardData } from "../../../services/top-section-card.service";
import { normalizeToUTC } from "../../../utils/dateUtils";

export const useTopSectionAnalytics = (
  topSelectedDate: Date,
  username: string | null
) => {
  const [topAnalytics, setTopAnalytics] = useState<AnalyticsData | null>(null);
  const [topLoading, setTopLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setTopLoading(true);
      try {
        // First, try to fetch from new homepage service (username-based)
        // Fetch ALL metrics at once so we have data when switching between them
        let topSectionData: TopSectionCardData | null = null;
        try {
          // Fetch all metrics in parallel
          const [
            grossVolumeRes,
            netVolumeRes,
            newCustomersRes,
            successfulPaymentsRes,
          ] = await Promise.allSettled([
            homepageService.getTopSectionMetric(
              username,
              "Gross Volume",
              topSelectedDate
            ),
            homepageService.getTopSectionMetric(
              username,
              "Net Volume",
              topSelectedDate
            ),
            homepageService.getTopSectionMetric(
              username,
              "New Customers",
              topSelectedDate
            ),
            homepageService.getTopSectionMetric(
              username,
              "Successful Payments",
              topSelectedDate
            ),
          ]);

          // Helper to parse metric data
          const parseMetricData = (result: PromiseSettledResult<any>) => {
            if (
              result.status === "fulfilled" &&
              result.value.data &&
              !Array.isArray(result.value.data) &&
              result.value.data.data
            ) {
              const metricEntry = result.value.data as any;
              const data = metricEntry.data;
              return {
                current: data.current || 0,
                previous: data.previous || 0,
                timeSeries: {
                  current: (data.timeSeries?.current || []).map((ts: any) => ({
                    timestamp: new Date(ts.timestamp),
                    value: ts.value,
                  })),
                  previous: (data.timeSeries?.previous || []).map(
                    (ts: any) => ({
                      timestamp: new Date(ts.timestamp),
                      value: ts.value,
                    })
                  ),
                },
              };
            }
            return {
              current: 0,
              previous: 0,
              timeSeries: { current: [], previous: [] },
            };
          };

          const grossVolume = parseMetricData(grossVolumeRes);
          const netVolume = parseMetricData(netVolumeRes);
          const newCustomers = parseMetricData(newCustomersRes);
          const successfulPayments = parseMetricData(successfulPaymentsRes);

          // Get date from first successful response
          const dateEntry =
            grossVolumeRes.status === "fulfilled" &&
            grossVolumeRes.value.data &&
            !Array.isArray(grossVolumeRes.value.data)
              ? (grossVolumeRes.value.data as any)
              : null;

          if (dateEntry && dateEntry.date) {
            topSectionData = {
              date: new Date(dateEntry.date),
              updatedAt: dateEntry.date,
              grossVolume,
              netVolume,
              newCustomers,
              successfulPayments,
            };
          }
        } catch (homepageErr) {
          console.log("No homepage data found, trying old service");
          // Fallback to old service
          try {
            const topSectionResponse = await topSectionCardService.getByDate(
              topSelectedDate
            );
            if (
              topSectionResponse.data &&
              !Array.isArray(topSectionResponse.data)
            ) {
              topSectionData = topSectionResponse.data as TopSectionCardData;
            }
          } catch (topSectionErr) {
            console.log(
              "No top section card data found, falling back to analytics"
            );
          }
        }

        // If we have top section card data, convert it to AnalyticsData format
        if (topSectionData) {
          // Helper function to convert TimeSeriesData to TimeSeriesPoint
          const convertTimeSeries = (
            data: { timestamp: Date; value: number }[]
          ) => {
            return data.map((item) => ({
              date: new Date(item.timestamp).toISOString(),
              value: item.value,
            }));
          };

          const analyticsData: AnalyticsData = {
            grossVolume: {
              current: topSectionData.grossVolume.current,
              previous: topSectionData.grossVolume.previous,
              change:
                topSectionData.grossVolume.current -
                topSectionData.grossVolume.previous,
              changePercent:
                topSectionData.grossVolume.previous !== 0
                  ? ((topSectionData.grossVolume.current -
                      topSectionData.grossVolume.previous) /
                      topSectionData.grossVolume.previous) *
                    100
                  : 0,
              timeSeries: {
                current: convertTimeSeries(
                  topSectionData.grossVolume.timeSeries.current
                ),
                previous: convertTimeSeries(
                  topSectionData.grossVolume.timeSeries.previous
                ),
              },
            },
            netVolume: {
              current: topSectionData.netVolume.current,
              previous: topSectionData.netVolume.previous,
              change:
                topSectionData.netVolume.current -
                topSectionData.netVolume.previous,
              changePercent:
                topSectionData.netVolume.previous !== 0
                  ? ((topSectionData.netVolume.current -
                      topSectionData.netVolume.previous) /
                      topSectionData.netVolume.previous) *
                    100
                  : 0,
              timeSeries: {
                current: convertTimeSeries(
                  topSectionData.netVolume.timeSeries.current
                ),
                previous: convertTimeSeries(
                  topSectionData.netVolume.timeSeries.previous
                ),
              },
            },
            newCustomers: {
              current: topSectionData.newCustomers.current,
              previous: topSectionData.newCustomers.previous,
              change:
                topSectionData.newCustomers.current -
                topSectionData.newCustomers.previous,
              changePercent:
                topSectionData.newCustomers.previous !== 0
                  ? ((topSectionData.newCustomers.current -
                      topSectionData.newCustomers.previous) /
                      topSectionData.newCustomers.previous) *
                    100
                  : 0,
              timeSeries: {
                current: convertTimeSeries(
                  topSectionData.newCustomers.timeSeries.current
                ),
                previous: convertTimeSeries(
                  topSectionData.newCustomers.timeSeries.previous
                ),
              },
            },
            successfulPayments: {
              current: topSectionData.successfulPayments.current,
              previous: topSectionData.successfulPayments.previous,
              change:
                topSectionData.successfulPayments.current -
                topSectionData.successfulPayments.previous,
              changePercent:
                topSectionData.successfulPayments.previous !== 0
                  ? ((topSectionData.successfulPayments.current -
                      topSectionData.successfulPayments.previous) /
                      topSectionData.successfulPayments.previous) *
                    100
                  : 0,
              timeSeries: {
                current: convertTimeSeries(
                  topSectionData.successfulPayments.timeSeries.current
                ),
                previous: convertTimeSeries(
                  topSectionData.successfulPayments.timeSeries.previous
                ),
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
  }, [topSelectedDate, username]);

  return { topAnalytics, topLoading };
};
