import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { topSectionCardService } from "../../services/top-section-card.service";
import type { TopSectionCardData, MetricData } from "../../services/top-section-card.service";

const EditTopSectionCardPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [inputMode, setInputMode] = useState<"total" | "hourly">("total");
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  
  const emptyMetric: MetricData = {
    current: 0,
    previous: 0,
    timeSeries: {
      current: [],
      previous: [],
    },
  };

  const [formData, setFormData] = useState({
    grossVolume: emptyMetric,
    netVolume: emptyMetric,
    newCustomers: emptyMetric,
    successfulPayments: emptyMetric,
    notes: "",
    updatedBy: "Admin",
  });

  // Helper to format date as YYYY-MM-DD without timezone issues
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await topSectionCardService.getByDate(selectedDate);
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as TopSectionCardData;
        setFormData({
          grossVolume: data.grossVolume,
          netVolume: data.netVolume,
          newCustomers: data.newCustomers,
          successfulPayments: data.successfulPayments,
          notes: data.notes || "",
          updatedBy: "Admin",
        });
      } else {
        setFormData({
          grossVolume: emptyMetric,
          netVolume: emptyMetric,
          newCustomers: emptyMetric,
          successfulPayments: emptyMetric,
          notes: "",
          updatedBy: "Admin",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await topSectionCardService.createOrUpdate(selectedDate, formData);
      setMessage({ type: "success", text: "Data saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save data. Please try again." });
      console.error("Error saving data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this data?")) return;
    
    setSaving(true);
    setMessage(null);
    try {
      await topSectionCardService.delete(selectedDate);
      setMessage({ type: "success", text: "Data deleted successfully!" });
      fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete data. Please try again." });
      console.error("Error deleting data:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateHourlyValue = (metricName: keyof typeof formData, hour: number, value: number) => {
    if (metricName === "notes" || metricName === "updatedBy") return;
    
    const metric = formData[metricName] as MetricData;
    
    // Ensure we have all 24 hours
    const newTimeSeries = [];
    for (let h = 0; h < 24; h++) {
      const timestamp = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        h,
        0,
        0,
        0
      ));
      
      // Use the new value for the current hour, otherwise get existing or 0
      const hourValue = h === hour ? value : getHourlyValue(metricName, h);
      newTimeSeries.push({ timestamp, value: hourValue });
    }
    
    // Calculate total from hourly values
    const total = newTimeSeries.reduce((sum, ts) => sum + ts.value, 0);
    
    setFormData({
      ...formData,
      [metricName]: {
        ...(formData[metricName] as MetricData),
        current: total,
        timeSeries: {
          ...metric.timeSeries,
          current: newTimeSeries,
        },
      },
    });
  };

  const distributeTotal = (metricName: keyof typeof formData, total: number) => {
    if (metricName === "notes" || metricName === "updatedBy") return;
    
    const metric = formData[metricName] as MetricData;
    const baseValuePerHour = Math.floor((total * 100) / 24) / 100; // Round to 2 decimal places
    const newTimeSeries = [];
    
    // Distribute the base value to all hours (0-23)
    for (let hour = 0; hour < 24; hour++) {
      // Create UTC timestamp for the selected date at this hour
      const timestamp = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        0,
        0,
        0
      ));
      newTimeSeries.push({ timestamp, value: baseValuePerHour });
    }
    
    // Calculate the remainder and add it to the first hour to ensure exact total
    const distributedTotal = baseValuePerHour * 24;
    const remainder = Math.round((total - distributedTotal) * 100) / 100;
    if (remainder !== 0 && newTimeSeries.length > 0) {
      newTimeSeries[0].value = Math.round((newTimeSeries[0].value + remainder) * 100) / 100;
    }
    
    setFormData({
      ...formData,
      [metricName]: {
        ...(formData[metricName] as MetricData),
        current: total,
        timeSeries: {
          ...metric.timeSeries,
          current: newTimeSeries,
        },
      },
    });
  };

  const getHourlyValue = (metricName: keyof typeof formData, hour: number): number => {
    if (metricName === "notes" || metricName === "updatedBy") return 0;
    
    const metric = formData[metricName] as MetricData;
    const entry = metric.timeSeries.current.find((ts) => {
      const tsDate = new Date(ts.timestamp);
      return tsDate.getUTCHours() === hour;
    });
    
    return entry?.value || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/admin/home")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to Home Management
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Top Section (Hourly Chart)
          </h1>
          <p className="text-gray-600 mb-6">
            Manage the top section metrics and hourly chart data
          </p>

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
                const [year, month, day] = e.target.value.split('-').map(Number);
                setSelectedDate(new Date(year, month - 1, day));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6 flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-gray-700">Input Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode("total")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === "total"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Total Value (Auto-distribute)
              </button>
              <button
                onClick={() => setInputMode("hourly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === "hourly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Hourly Values (Manual)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Render each metric */}
              {(["grossVolume", "netVolume", "newCustomers", "successfulPayments"] as const).map((metricKey) => {
                const metricLabels = {
                  grossVolume: { title: "Gross Volume", unit: "$", step: "0.01" },
                  netVolume: { title: "Net Volume", unit: "$", step: "0.01" },
                  newCustomers: { title: "New Customers", unit: "", step: "1" },
                  successfulPayments: { title: "Successful Payments", unit: "", step: "1" },
                };
                const { title, unit, step } = metricLabels[metricKey];
                const isExpanded = expandedMetric === metricKey;

                return (
                  <div key={metricKey} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                      {inputMode === "hourly" && (
                        <button
                          onClick={() => setExpandedMetric(isExpanded ? null : metricKey)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {isExpanded ? "Hide Hourly Data" : "Show Hourly Data"}
                        </button>
                      )}
                    </div>

                    {inputMode === "total" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Value {unit && `(${unit})`}
                        </label>
                        <input
                          type="number"
                          step={step}
                          value={formData[metricKey].current}
                          onChange={(e) => {
                            const total = Number(e.target.value);
                            distributeTotal(metricKey, total);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter total value (will be divided across 24 hours)"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          This value will be automatically divided equally across all 24 hours ({(formData[metricKey].current / 24).toFixed(2)} per hour)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total (Calculated from hourly values)
                          </label>
                          <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                            {formData[metricKey].current.toFixed(2)} {unit}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                            <p className="text-sm font-medium text-gray-700 mb-3">Enter value for each hour:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Array.from({ length: 24 }, (_, hour) => (
                                <div key={hour}>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {hour.toString().padStart(2, "0")}:00
                                  </label>
                                  <input
                                    type="number"
                                    step={step}
                                    value={getHourlyValue(metricKey, hour)}
                                    onChange={(e) => updateHourlyValue(metricKey, hour, Number(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this data..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTopSectionCardPage;
