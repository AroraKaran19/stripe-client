import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { grossVolumeCardService } from "../../services/gross-volume-card.service";
import type { GrossVolumeCardData, TimeSeriesData } from "../../services/gross-volume-card.service";

const EditGrossVolumeCardPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [inputMode, setInputMode] = useState<"total" | "hourly">("total");
  const [expandedHourly, setExpandedHourly] = useState(false);
  const [formData, setFormData] = useState({
    value: 0,
    change: 0,
    changePercent: 0,
    timeSeries: [] as TimeSeriesData[],
    notes: "",
    updatedBy: "Admin",
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await grossVolumeCardService.getByDate(selectedDate);
      console.log("Fetched Gross Volume data:", response.data);
      
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as GrossVolumeCardData;
        console.log("TimeSeries from API:", data.timeSeries);
        
        setFormData({
          value: data.value,
          change: data.change,
          changePercent: data.changePercent,
          timeSeries: data.timeSeries || [],
          notes: data.notes || "",
          updatedBy: "Admin",
        });
      } else {
        setFormData({
          value: 0,
          change: 0,
          changePercent: 0,
          timeSeries: [],
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

  const distributeTotal = (total: number) => {
    const baseValuePerHour = Math.floor((total * 100) / 24) / 100;
    const newTimeSeries: TimeSeriesData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        0, 0, 0
      ));
      newTimeSeries.push({ timestamp, value: baseValuePerHour });
    }
    
    const distributedTotal = baseValuePerHour * 24;
    const remainder = Math.round((total - distributedTotal) * 100) / 100;
    if (remainder !== 0 && newTimeSeries.length > 0) {
      newTimeSeries[0].value = Math.round((newTimeSeries[0].value + remainder) * 100) / 100;
    }
    
    setFormData({
      ...formData,
      value: total,
      timeSeries: newTimeSeries,
    });
  };

  const updateHourlyValue = (hour: number, value: number) => {
    // Ensure we have all 24 hours
    const newTimeSeries: TimeSeriesData[] = [];
    
    for (let h = 0; h < 24; h++) {
      const timestamp = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        h,
        0, 0, 0
      ));
      
      const hourValue = h === hour ? value : getHourlyValue(h);
      newTimeSeries.push({ timestamp, value: hourValue });
    }
    
    const total = newTimeSeries.reduce((sum, ts) => sum + ts.value, 0);
    
    setFormData({
      ...formData,
      value: total,
      timeSeries: newTimeSeries,
    });
  };

  const getHourlyValue = (hour: number): number => {
    const entry = formData.timeSeries.find(ts => {
      const tsDate = new Date(ts.timestamp);
      return tsDate.getUTCHours() === hour;
    });
    return entry?.value || 0;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      console.log("Saving Gross Volume data:", {
        value: formData.value,
        timeSeriesCount: formData.timeSeries.length,
        timeSeries: formData.timeSeries,
      });
      
      await grossVolumeCardService.createOrUpdate(selectedDate, formData);
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
      await grossVolumeCardService.delete(selectedDate);
      setMessage({ type: "success", text: "Data deleted successfully!" });
      fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete data. Please try again." });
      console.error("Error deleting data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/home")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to Home Management
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Gross Volume Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage gross volume metrics for the home page
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
              value={selectedDate.toISOString().split("T")[0]}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
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
            <div className="space-y-6">
              {inputMode === "total" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => distributeTotal(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total value (will be divided across 24 hours)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This value will be automatically divided equally across all 24 hours ({(formData.value / 24).toFixed(2)} per hour)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total (Calculated from hourly values)
                      </label>
                      <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                        ${formData.value.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedHourly(!expandedHourly)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedHourly ? "Hide Hourly Data" : "Show Hourly Data"}
                    </button>
                  </div>

                  {expandedHourly && (
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
                              step="0.01"
                              value={getHourlyValue(hour)}
                              onChange={(e) => updateHourlyValue(hour, Number(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

export default EditGrossVolumeCardPage;
