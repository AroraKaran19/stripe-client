import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserFromRoute } from "../../hooks/useUserFromRoute";
import { homepageService } from "../../services/homepage.service";

type EntryMethod = "daily" | "hourly";

interface HourlyData {
  hour: number;
  value: number;
}

const EditTopSectionPage = () => {
  const navigate = useNavigate();
  const { username } = useUserFromRoute();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>("daily");

  // For each metric: daily total or hourly breakdown (only current day, previous is auto-fetched)
  const [formData, setFormData] = useState({
    grossVolume: {
      dailyTotal: 0,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 0,
      })) as HourlyData[],
    },
    netVolume: {
      dailyTotal: 0,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 0,
      })) as HourlyData[],
    },
    newCustomers: {
      dailyTotal: 0,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 0,
      })) as HourlyData[],
    },
    successfulPayments: {
      dailyTotal: 0,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 0,
      })) as HourlyData[],
    },
  });

  // Store previous day's data (read-only, auto-fetched)
  const [previousDayData, setPreviousDayData] = useState<{
    grossVolume: HourlyData[];
    netVolume: HourlyData[];
    newCustomers: HourlyData[];
    successfulPayments: HourlyData[];
  } | null>(null);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [selectedDate, username]);

  const fetchData = async () => {
    if (!username) {
      setMessage({
        type: "error",
        text: "Username is required. Add ?user=username to the URL.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Calculate previous date
      const previousDate = new Date(selectedDate);
      previousDate.setDate(previousDate.getDate() - 1);

      // Fetch current day data
      const [
        grossVolumeRes,
        netVolumeRes,
        newCustomersRes,
        successfulPaymentsRes,
      ] = await Promise.allSettled([
        homepageService.getTopSectionMetric(
          username,
          "Gross Volume",
          selectedDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "Net Volume",
          selectedDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "New Customers",
          selectedDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "Successful Payments",
          selectedDate
        ),
      ]);

      // Fetch previous day data (for comparison)
      const [
        prevGrossVolumeRes,
        prevNetVolumeRes,
        prevNewCustomersRes,
        prevSuccessfulPaymentsRes,
      ] = await Promise.allSettled([
        homepageService.getTopSectionMetric(
          username,
          "Gross Volume",
          previousDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "Net Volume",
          previousDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "New Customers",
          previousDate
        ),
        homepageService.getTopSectionMetric(
          username,
          "Successful Payments",
          previousDate
        ),
      ]);

      const parseCurrentMetricData = (result: PromiseSettledResult<any>) => {
        if (
          result.status === "fulfilled" &&
          result.value.data &&
          result.value.data.data
        ) {
          const data = result.value.data.data;
          const currentTotal = data.current || 0;

          // Parse hourly data from timeSeries
          const currentHourly = Array.from({ length: 24 }, (_, i) => {
            const hourData = (data.timeSeries?.current || []).find(
              (ts: any) => new Date(ts.timestamp).getUTCHours() === i
            );
            return { hour: i, value: hourData?.value || 0 };
          });

          return {
            dailyTotal: currentTotal,
            hourlyData: currentHourly,
          };
        }
        return {
          dailyTotal: 0,
          hourlyData: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            value: 0,
          })),
        };
      };

      const parsePreviousMetricData = (result: PromiseSettledResult<any>) => {
        if (
          result.status === "fulfilled" &&
          result.value.data &&
          result.value.data.data
        ) {
          const data = result.value.data.data;
          // Parse hourly data from timeSeries (use current as previous day's current)
          const previousHourly = Array.from({ length: 24 }, (_, i) => {
            const hourData = (data.timeSeries?.current || []).find(
              (ts: any) => new Date(ts.timestamp).getUTCHours() === i
            );
            return { hour: i, value: hourData?.value || 0 };
          });
          return previousHourly;
        }
        return Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          value: 0,
        }));
      };

      setFormData({
        grossVolume: parseCurrentMetricData(grossVolumeRes),
        netVolume: parseCurrentMetricData(netVolumeRes),
        newCustomers: parseCurrentMetricData(newCustomersRes),
        successfulPayments: parseCurrentMetricData(successfulPaymentsRes),
      });

      setPreviousDayData({
        grossVolume: parsePreviousMetricData(prevGrossVolumeRes),
        netVolume: parsePreviousMetricData(prevNetVolumeRes),
        newCustomers: parsePreviousMetricData(prevNewCustomersRes),
        successfulPayments: parsePreviousMetricData(prevSuccessfulPaymentsRes),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert daily total to hourly data (divide equally)
  const convertDailyToHourly = (dailyTotal: number): HourlyData[] => {
    const hourlyValue = dailyTotal / 24;
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: hourlyValue,
    }));
  };

  // Generate timeSeries array from hourly data
  const generateTimeSeries = (hourlyData: HourlyData[], date: Date) => {
    return hourlyData.map((hd) => {
      const timestamp = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hd.hour,
          0,
          0,
          0
        )
      );
      return {
        timestamp,
        value: hd.value,
      };
    });
  };

  const handleSave = async () => {
    if (!username) {
      setMessage({
        type: "error",
        text: "Username is required. Add ?user=username to the URL.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      // Process each metric
      const processMetric = (
        metricData: typeof formData.grossVolume,
        previousHourlyData: HourlyData[]
      ) => {
        // Get hourly data based on entry method
        let currentHourly = metricData.hourlyData;

        if (entryMethod === "daily") {
          // Convert daily totals to hourly (divide equally)
          currentHourly = convertDailyToHourly(metricData.dailyTotal);
        }

        // Calculate totals from hourly data
        const currentTotal = currentHourly.reduce((sum, h) => sum + h.value, 0);
        const previousTotal = previousHourlyData.reduce(
          (sum, h) => sum + h.value,
          0
        );

        // Generate timeSeries
        const currentTimeSeries = generateTimeSeries(
          currentHourly,
          selectedDate
        );
        const previousDate = new Date(selectedDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousTimeSeries = generateTimeSeries(
          previousHourlyData,
          previousDate
        );

        return {
          current: currentTotal,
          previous: previousTotal,
          timeSeries: {
            current: currentTimeSeries,
            previous: previousTimeSeries,
          },
        };
      };

      if (!previousDayData) {
        setMessage({
          type: "error",
          text: "Previous day data not loaded. Please refresh the page.",
        });
        setSaving(false);
        return;
      }

      await Promise.all([
        homepageService.createOrUpdateTopSectionMetric(
          username,
          "Gross Volume",
          selectedDate,
          processMetric(formData.grossVolume, previousDayData.grossVolume),
          "Admin"
        ),
        homepageService.createOrUpdateTopSectionMetric(
          username,
          "Net Volume",
          selectedDate,
          processMetric(formData.netVolume, previousDayData.netVolume),
          "Admin"
        ),
        homepageService.createOrUpdateTopSectionMetric(
          username,
          "New Customers",
          selectedDate,
          processMetric(formData.newCustomers, previousDayData.newCustomers),
          "Admin"
        ),
        homepageService.createOrUpdateTopSectionMetric(
          username,
          "Successful Payments",
          selectedDate,
          processMetric(
            formData.successfulPayments,
            previousDayData.successfulPayments
          ),
          "Admin"
        ),
      ]);

      setMessage({ type: "success", text: "Data saved successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save data. Please try again.",
      });
      console.error("Error saving data:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateHourlyValue = (
    metric: keyof typeof formData,
    hour: number,
    value: number
  ) => {
    setFormData((prev) => {
      const metricData = prev[metric];
      const updatedHourly = metricData.hourlyData.map((h) =>
        h.hour === hour ? { ...h, value } : h
      );

      return {
        ...prev,
        [metric]: {
          ...metricData,
          hourlyData: updatedHourly,
          dailyTotal: updatedHourly.reduce((sum, h) => sum + h.value, 0),
        },
      };
    });
  };

  const renderMetricInput = (
    metricKey: keyof typeof formData,
    label: string
  ) => {
    const metricData = formData[metricKey];

    return (
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>

        {entryMethod === "daily" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Total
            </label>
            <input
              type="number"
              value={metricData.dailyTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [metricKey]: {
                    ...metricData,
                    dailyTotal: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be divided equally into 24 hours for the graph.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Hourly Values (00:00 to 23:00)
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {metricData.hourlyData.map((hd) => (
                <div key={hd.hour} className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">
                    {String(hd.hour).padStart(2, "0")}:00
                  </label>
                  <input
                    type="number"
                    value={hd.value}
                    onChange={(e) =>
                      updateHourlyValue(
                        metricKey,
                        hd.hour,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {previousDayData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Previous Day Data (Read-only, for comparison)
            </h4>
            <p className="text-xs text-gray-500">
              Total:{" "}
              {previousDayData[metricKey]
                .reduce((sum, h) => sum + h.value, 0)
                .toFixed(2)}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(`/admin/home?user=${username || ""}`)}
          className="text-sm cursor-pointer text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to Home Management
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Top Section (Hourly Chart)
          </h1>
          <p className="text-gray-600 mb-2">
            Manage the top section metrics and hourly chart data
          </p>
          {username ? (
            <p className="text-sm text-blue-600 mb-6 font-medium">
              Managing data for: <span className="font-bold">{username}</span>
            </p>
          ) : (
            <p className="text-sm text-amber-600 mb-6">
              ⚠️ No username specified. Add ?user=username to the URL to manage
              a specific user's data.
            </p>
          )}

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={formatDateString(selectedDate)}
                max={formatDateString(new Date())}
                onChange={(e) => {
                  const [year, month, day] = e.target.value
                    .split("-")
                    .map(Number);
                  setSelectedDate(new Date(year, month - 1, day));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="entryMethod"
                    value="daily"
                    checked={entryMethod === "daily"}
                    onChange={(e) =>
                      setEntryMethod(e.target.value as EntryMethod)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Daily Totals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="entryMethod"
                    value="hourly"
                    checked={entryMethod === "hourly"}
                    onChange={(e) =>
                      setEntryMethod(e.target.value as EntryMethod)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Hourly Breakdown
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {entryMethod === "daily"
                  ? "Enter daily totals. They will be divided equally into 24 hours for the graph."
                  : "Enter individual values for each hour (00:00 to 23:00)."}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              {renderMetricInput("grossVolume", "Gross Volume")}
              {renderMetricInput("netVolume", "Net Volume")}
              {renderMetricInput("newCustomers", "New Customers")}
              {renderMetricInput("successfulPayments", "Successful Payments")}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !username}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => navigate(`/admin/home?user=${username || ""}`)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTopSectionPage;
