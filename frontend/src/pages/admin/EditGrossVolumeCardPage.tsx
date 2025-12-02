import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserFromRoute } from "../../hooks/useUserFromRoute";
import { homepageService } from "../../services/homepage.service";

type EntryMethod = "daily" | "hourly";

interface HourlyData {
  hour: number;
  value: number;
}

const EditGrossVolumeCardPage = () => {
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

  const [formData, setFormData] = useState({
    dailyTotal: 0,
    change: 0,
    changePercent: 0,
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: 0,
    })) as HourlyData[],
  });

  // Store previous day's data (read-only, auto-fetched)
  const [previousDayData, setPreviousDayData] = useState<{
    dailyTotal: number;
    hourlyData: HourlyData[];
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

  // Sync data when switching between entry methods
  const prevEntryMethodRef = useRef<EntryMethod | null>(null);
  useEffect(() => {
    // Skip on initial mount
    if (prevEntryMethodRef.current === null) {
      prevEntryMethodRef.current = entryMethod;
      return;
    }

    // Only convert if entry method actually changed
    if (prevEntryMethodRef.current !== entryMethod) {
      if (entryMethod === "hourly") {
        // Switching to hourly: divide daily total equally across 24 hours
        setFormData((prev) => {
          if (prev.dailyTotal > 0) {
            const hourlyValue = prev.dailyTotal / 24;
            return {
              ...prev,
              hourlyData: Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                value: hourlyValue,
              })),
            };
          }
          return prev;
        });
      } else if (entryMethod === "daily") {
        // Switching to daily: calculate total from hourly data
        setFormData((prev) => {
          const total = prev.hourlyData.reduce((sum, h) => sum + h.value, 0);
          if (total > 0 || prev.dailyTotal === 0) {
            return {
              ...prev,
              dailyTotal: total,
            };
          }
          return prev;
        });
      }
      prevEntryMethodRef.current = entryMethod;
    }
  }, [entryMethod]);

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

      // Fetch current day and previous day data
      const [currentRes, previousRes] = await Promise.allSettled([
        homepageService.getCard(username, "Gross Volume Card", selectedDate),
        homepageService.getCard(username, "Gross Volume Card", previousDate),
      ]);

      // Process current day data
      if (
        currentRes.status === "fulfilled" &&
        currentRes.value.data &&
        !Array.isArray(currentRes.value.data)
      ) {
        const entry = currentRes.value.data as any;
        const data = entry.data;

        if (data) {
          // If we have timeSeries, extract hourly data
          let hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            value: 0,
          }));

          if (data.timeSeries && data.timeSeries.length > 0) {
            data.timeSeries.forEach((ts: any) => {
              const hour = new Date(ts.timestamp).getUTCHours();
              hourlyData[hour] = { hour, value: ts.value || 0 };
            });
          }

          // Calculate daily total from hourly data or use value
          const dailyTotal =
            data.value || hourlyData.reduce((sum, h) => sum + h.value, 0);

          setFormData({
            dailyTotal,
            change: data.change || 0,
            changePercent: data.changePercent || 0,
            hourlyData,
          });
        } else {
          setFormData({
            dailyTotal: 0,
            change: 0,
            changePercent: 0,
            hourlyData: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              value: 0,
            })),
          });
        }
      } else {
        setFormData({
          dailyTotal: 0,
          change: 0,
          changePercent: 0,
          hourlyData: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            value: 0,
          })),
        });
      }

      // Process previous day data
      if (
        previousRes.status === "fulfilled" &&
        previousRes.value.data &&
        !Array.isArray(previousRes.value.data)
      ) {
        const entry = previousRes.value.data as any;
        const data = entry.data;

        if (data) {
          let hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            value: 0,
          }));

          if (data.timeSeries && data.timeSeries.length > 0) {
            data.timeSeries.forEach((ts: any) => {
              const hour = new Date(ts.timestamp).getUTCHours();
              hourlyData[hour] = { hour, value: ts.value || 0 };
            });
          }

          const dailyTotal =
            data.value || hourlyData.reduce((sum, h) => sum + h.value, 0);

          setPreviousDayData({
            dailyTotal,
            hourlyData,
          });
        } else {
          setPreviousDayData({
            dailyTotal: 0,
            hourlyData: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              value: 0,
            })),
          });
        }
      } else {
        setPreviousDayData({
          dailyTotal: 0,
          hourlyData: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            value: 0,
          })),
        });
      }
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
      // Calculate values
      const dailyTotal =
        entryMethod === "daily"
          ? formData.dailyTotal
          : formData.hourlyData.reduce((sum, h) => sum + h.value, 0);

      const previousTotal = previousDayData?.dailyTotal || 0;
      const change = dailyTotal - previousTotal;
      let changePercent = 0;
      if (previousTotal === 0) {
        // If previous is 0 and current > 0, set to 100%, otherwise 0%
        changePercent = dailyTotal > 0 ? 100 : 0;
      } else {
        changePercent = (change / previousTotal) * 100;
        // Cap at 100% maximum
        changePercent = Math.min(Math.abs(changePercent), 100);
      }

      // Build timeSeries from hourly data
      const timeSeries = formData.hourlyData.map((h) => {
        const timestamp = new Date(
          Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            h.hour,
            0,
            0,
            0
          )
        );
        return {
          timestamp: timestamp.toISOString(),
          value: entryMethod === "daily" ? dailyTotal / 24 : h.value,
        };
      });

      const dataToSave = {
        value: dailyTotal,
        change,
        changePercent,
        timeSeries,
      };

      await homepageService.createOrUpdateCard(
        username,
        "Gross Volume Card",
        selectedDate,
        dataToSave,
        "Admin"
      );
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(`/admin/home?user=${username || ""}`)}
          className="text-sm cursor-pointer text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to Home Management
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Gross Volume Card
          </h1>
          <p className="text-gray-600 mb-2">
            Manage gross volume metrics and trends
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

          <div className="mb-6">
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

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* Entry Method Selection */}
              <div className="mb-6">
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

              {/* Previous Day Data (Read-only) */}
              {previousDayData && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Previous Day (
                    {formatDateString(
                      new Date(
                        new Date(selectedDate).setDate(
                          selectedDate.getDate() - 1
                        )
                      )
                    )}
                    )
                  </h3>
                  <p className="text-sm text-gray-600">
                    Total: US${previousDayData.dailyTotal.toFixed(2)} (used for
                    comparison)
                  </p>
                </div>
              )}

              {/* Daily Total Input */}
              {entryMethod === "daily" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dailyTotal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyTotal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Hourly Breakdown Input */}
              {entryMethod === "hourly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Breakdown (24 hours)
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {formData.hourlyData.map((hourData, index) => (
                      <div key={index} className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">
                          {String(index).padStart(2, "0")}:00
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={hourData.value}
                          onChange={(e) => {
                            const newHourlyData = [...formData.hourlyData];
                            newHourlyData[index] = {
                              ...newHourlyData[index],
                              value: parseFloat(e.target.value) || 0,
                            };
                            setFormData({
                              ...formData,
                              hourlyData: newHourlyData,
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total: US$
                    {formData.hourlyData
                      .reduce((sum, h) => sum + h.value, 0)
                      .toFixed(2)}
                  </p>
                </div>
              )}

              {/* Calculated Values (Read-only) */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Calculated Values (Auto-calculated from previous day)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Change</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {(
                        (entryMethod === "daily"
                          ? formData.dailyTotal
                          : formData.hourlyData.reduce(
                              (sum, h) => sum + h.value,
                              0
                            )) - (previousDayData?.dailyTotal || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Change Percent
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const currentTotal =
                          entryMethod === "daily"
                            ? formData.dailyTotal
                            : formData.hourlyData.reduce(
                                (sum, h) => sum + h.value,
                                0
                              );
                        const previousTotal = previousDayData?.dailyTotal || 0;
                        if (previousTotal === 0) {
                          return currentTotal > 0 ? "100.00" : "0.00";
                        }
                        const changePercent =
                          ((currentTotal - previousTotal) / previousTotal) *
                          100;
                        // Cap at 100% maximum
                        return Math.min(Math.abs(changePercent), 100).toFixed(
                          2
                        );
                      })()}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
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

export default EditGrossVolumeCardPage;
