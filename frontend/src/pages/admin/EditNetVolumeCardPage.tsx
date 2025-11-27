import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { netVolumeCardService } from "../../services/net-volume-card.service";
import type { NetVolumeCardData, TimeSeriesData } from "../../services/net-volume-card.service";

interface DailyValue {
  date: string;
  value: number;
}

const EditNetVolumeCardPage = () => {
  const navigate = useNavigate();
  
  // Date mode: single day or date range
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Input mode: total or hourly (for single day), total or daily (for date range)
  const [inputMode, setInputMode] = useState<"total" | "hourly" | "daily">("total");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Form data
  const [totalValue, setTotalValue] = useState(0);
  const [hourlyValues, setHourlyValues] = useState<number[]>(Array(24).fill(0));
  const [dailyValues, setDailyValues] = useState<DailyValue[]>([]);
  const [notes, setNotes] = useState("");
  
  const [expandedHourly, setExpandedHourly] = useState(false);

  // Calculate days in range
  const getDaysInRange = () => {
    if (dateMode === "single") return 1;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Helper to format date as YYYY-MM-DD without timezone issues
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize daily values when date range changes
  useEffect(() => {
    if (dateMode === "range") {
      const days = getDaysInRange();
      const newDailyValues: DailyValue[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateString(date);
        
        // Keep existing value if it exists
        const existing = dailyValues.find(d => d.date === dateStr);
        newDailyValues.push({
          date: dateStr,
          value: existing?.value || 0
        });
      }
      
      setDailyValues(newDailyValues);
    }
  }, [dateMode, startDate, endDate]);

  // Fetch data for single day
  useEffect(() => {
    if (dateMode === "single") {
      fetchData();
    }
  }, [selectedDate, dateMode]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await netVolumeCardService.getByDate(selectedDate);
      
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as NetVolumeCardData;
        
        // Extract hourly values from timeSeries
        const newHourlyValues = Array(24).fill(0);
        if (data.timeSeries && data.timeSeries.length > 0) {
          data.timeSeries.forEach(ts => {
            const date = new Date(ts.timestamp);
            const hour = date.getUTCHours();
            if (hour >= 0 && hour < 24) {
              newHourlyValues[hour] = ts.value || 0;
            }
          });
        }
        
        setTotalValue(data.value || 0);
        setHourlyValues(newHourlyValues);
        setNotes(data.notes || "");
      } else {
        setTotalValue(0);
        setHourlyValues(Array(24).fill(0));
        setNotes("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // SINGLE DAY - TOTAL MODE: Distribute total across 24 hours
  const handleTotalValueChange = (value: number) => {
    setTotalValue(value);
    
    if (dateMode === "single") {
      // Divide equally across 24 hours
      const valuePerHour = value / 24;
      const newHourlyValues = Array(24).fill(valuePerHour);
      setHourlyValues(newHourlyValues);
    }
  };

  // SINGLE DAY - HOURLY MODE: Update individual hour
  const handleHourlyValueChange = (hour: number, value: number) => {
    const newHourlyValues = [...hourlyValues];
    newHourlyValues[hour] = value;
    setHourlyValues(newHourlyValues);
    
    // Recalculate total
    const newTotal = newHourlyValues.reduce((sum, val) => sum + val, 0);
    setTotalValue(newTotal);
  };

  // DATE RANGE - TOTAL MODE: Distribute total across all days, then hours
  const handleRangeTotalValueChange = (value: number) => {
    setTotalValue(value);
    
    const days = getDaysInRange();
    const valuePerDay = value / days;
    
    const newDailyValues = dailyValues.map(d => ({
      ...d,
      value: valuePerDay
    }));
    
    setDailyValues(newDailyValues);
  };

  // DATE RANGE - DAILY MODE: Update individual day
  const handleDailyValueChange = (date: string, value: number) => {
    const newDailyValues = dailyValues.map(d =>
      d.date === date ? { ...d, value } : d
    );
    setDailyValues(newDailyValues);
    
    // Recalculate total
    const newTotal = newDailyValues.reduce((sum, d) => sum + d.value, 0);
    setTotalValue(newTotal);
  };

  // Create timeSeries for a single day
  // Takes a date string in YYYY-MM-DD format to avoid any timezone confusion
  const createTimeSeriesForDay = (date: Date, dayValue: number, hourlyDistribution?: number[]): TimeSeriesData[] => {
    const timeSeries: TimeSeriesData[] = [];
    
    // Use provided hourly distribution or divide equally
    const values = hourlyDistribution || Array(24).fill(dayValue / 24);
    
    // Get the date string in YYYY-MM-DD format
    const dateStr = formatDateString(date);
    
    // Create UTC timestamps for each hour of the selected date
    for (let hour = 0; hour < 24; hour++) {
      // Create timestamp: YYYY-MM-DD HH:00:00 UTC
      const timestamp = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00.000Z`);
      
      timeSeries.push({
        timestamp,
        value: values[hour]
      });
    }
    
    return timeSeries;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      if (dateMode === "single") {
        // SINGLE DAY MODE
        const timeSeries = createTimeSeriesForDay(selectedDate, totalValue, hourlyValues);
        
        const dataToSave = {
          value: totalValue,
          change: 0,
          changePercent: 0,
          timeSeries,
          notes,
          updatedBy: "Admin",
        };
        
        await netVolumeCardService.createOrUpdate(selectedDate, dataToSave);
        setMessage({ type: "success", text: "Data saved successfully!" });
        
      } else {
        // DATE RANGE MODE
        const savePromises = dailyValues.map(async (dayData) => {
          const date = new Date(dayData.date);
          
          // Create timeSeries for this day (divide day value across 24 hours)
          const timeSeries = createTimeSeriesForDay(date, dayData.value);
          
          const dataToSave = {
            value: dayData.value,
            change: 0,
            changePercent: 0,
            timeSeries,
            notes,
            updatedBy: "Admin",
          };
          
          return netVolumeCardService.createOrUpdate(date, dataToSave);
        });
        
        await Promise.all(savePromises);
        setMessage({ 
          type: "success", 
          text: `Data saved successfully for ${dailyValues.length} days!` 
        });
      }
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
      if (dateMode === "single") {
        await netVolumeCardService.delete(selectedDate);
        setMessage({ type: "success", text: "Data deleted successfully!" });
        fetchData();
      } else {
        const deletePromises = dailyValues.map(dayData => 
          netVolumeCardService.delete(new Date(dayData.date))
        );
        await Promise.all(deletePromises);
        setMessage({ type: "success", text: `Data deleted for ${dailyValues.length} days!` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete data. Please try again." });
      console.error("Error deleting data:", error);
    } finally {
      setSaving(false);
    }
  };

  // Get input mode options based on date mode
  const getInputModeOptions = () => {
    if (dateMode === "single") {
      return [
        { value: "total", label: "Total Value (Auto-distribute to hours)" },
        { value: "hourly", label: "Hourly Values (Manual)" }
      ];
    } else {
      return [
        { value: "total", label: "Total Value (Auto-distribute to days & hours)" },
        { value: "daily", label: "Daily Values (Manual per day)" }
      ];
    }
  };

  // Reset input mode when date mode changes
  useEffect(() => {
    setInputMode("total");
  }, [dateMode]);

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
            Edit Net Volume Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage net volume metrics for the home page
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

          {/* STEP 1: Date Mode Selection */}
          <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Step 1: Choose Date Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDateMode("single")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === "single"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                📅 Single Day
              </button>
              <button
                onClick={() => setDateMode("range")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === "range"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                📆 Date Range
              </button>
            </div>
          </div>

          {/* STEP 2: Date Selection */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Step 2: Select Date{dateMode === "range" ? " Range" : ""}
            </label>
            
            {dateMode === "single" ? (
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
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formatDateString(startDate)}
                    max={formatDateString(new Date())}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      setStartDate(new Date(year, month - 1, day));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formatDateString(endDate)}
                    max={formatDateString(new Date())}
                    min={formatDateString(startDate)}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      setEndDate(new Date(year, month - 1, day));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 text-sm text-blue-700 bg-blue-100 p-3 rounded">
                  📊 Selected: <strong>{getDaysInRange()} days</strong>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Input Mode Selection */}
          <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Step 3: Choose Input Mode
            </label>
            <div className="flex gap-2">
              {getInputModeOptions().map(option => (
                <button
                  key={option.value}
                  onClick={() => setInputMode(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === option.value
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Explanation */}
            <div className="mt-3 text-xs text-gray-600 bg-white p-3 rounded border border-green-200">
              {dateMode === "single" && inputMode === "total" && (
                <p>💡 Enter total value → Will be divided equally across 24 hours</p>
              )}
              {dateMode === "single" && inputMode === "hourly" && (
                <p>💡 Enter value for each hour manually (00:00 - 23:00)</p>
              )}
              {dateMode === "range" && inputMode === "total" && (
                <p>💡 Enter total value → Will be divided across {getDaysInRange()} days → Each day divided across 24 hours</p>
              )}
              {dateMode === "range" && inputMode === "daily" && (
                <p>💡 Enter value for each day manually → Each day's value will be divided across 24 hours</p>
              )}
            </div>
          </div>

          {/* STEP 4: Value Input */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SINGLE DAY - TOTAL MODE */}
              {dateMode === "single" && inputMode === "total" && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => handleTotalValueChange(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total value"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    📊 Per hour: <strong>${(totalValue / 24).toFixed(2)}</strong>
                  </p>
                </div>
              )}

              {/* SINGLE DAY - HOURLY MODE */}
              {dateMode === "single" && inputMode === "hourly" && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total (Calculated)
                      </label>
                      <div className="text-2xl font-bold text-gray-900">
                        ${totalValue.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedHourly(!expandedHourly)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {expandedHourly ? "Hide Hours" : "Show All Hours"}
                    </button>
                  </div>

                  {expandedHourly && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                      {hourlyValues.map((value, hour) => (
                        <div key={hour} className="bg-white p-2 rounded border border-gray-200">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {hour.toString().padStart(2, "0")}:00
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={value}
                            onChange={(e) => handleHourlyValueChange(hour, Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DATE RANGE - TOTAL MODE */}
              {dateMode === "range" && inputMode === "total" && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Value for Entire Range ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => handleRangeTotalValueChange(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total value for entire range"
                  />
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>📊 Per day: <strong>${(totalValue / getDaysInRange()).toFixed(2)}</strong></p>
                    <p>⏰ Per hour (per day): <strong>${(totalValue / getDaysInRange() / 24).toFixed(2)}</strong></p>
                  </div>
                </div>
              )}

              {/* DATE RANGE - DAILY MODE */}
              {dateMode === "range" && inputMode === "daily" && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total (Calculated)
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      ${totalValue.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">Enter value for each day:</p>
                    {dailyValues.map((dayData) => (
                      <div key={dayData.date} className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 w-32">
                          {new Date(dayData.date + 'T00:00:00').toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={dayData.value}
                          onChange={(e) => handleDailyValueChange(dayData.date, Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <span className="text-xs text-gray-500 w-24">
                          ${(dayData.value / 24).toFixed(2)}/hr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this data..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditNetVolumeCardPage;
