import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newCustomersCardService } from "../../services/new-customers-card.service";
import type { NewCustomersCardData } from "../../services/new-customers-card.service";

const EditNewCustomersCardPage = () => {
  const navigate = useNavigate();
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    count: 0,
    change: 0,
    changePercent: 0,
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
      const response = await newCustomersCardService.getByDate(selectedDate);
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as NewCustomersCardData;
        setFormData({
          count: data.count,
          change: data.change,
          changePercent: data.changePercent,
          notes: data.notes || "",
          updatedBy: "Admin",
        });
      } else {
        setFormData({
          count: 0,
          change: 0,
          changePercent: 0,
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
      if (dateMode === "single") {
        await newCustomersCardService.createOrUpdate(selectedDate, formData);
        setMessage({ type: "success", text: "Data saved successfully!" });
      } else {
        // Date range mode - distribute count across all days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const countPerDay = Math.floor(formData.count / daysDiff);
        const remainder = formData.count % daysDiff;
        
        const savePromises = [];
        for (let i = 0; i < daysDiff; i++) {
          // Create a new date by adding days to start date
          const currentDate = new Date(start.getTime() + (i * 24 * 60 * 60 * 1000));
          
          // Add remainder to first day
          const dayCount = i === 0 ? countPerDay + remainder : countPerDay;
          
          const dayData = {
            count: dayCount,
            change: formData.change,
            changePercent: formData.changePercent,
            notes: formData.notes,
            updatedBy: formData.updatedBy,
          };
          
          savePromises.push(newCustomersCardService.createOrUpdate(currentDate, dayData));
        }
        
        await Promise.all(savePromises);
        setMessage({ type: "success", text: `Data saved successfully for ${daysDiff} days!` });
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
      await newCustomersCardService.delete(selectedDate);
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
            Edit New Customers Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage new customer metrics for the home page
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

          {/* Date Mode Toggle */}
          <div className="mb-6 flex items-center gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <span className="text-sm font-medium text-gray-700">Date Selection:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDateMode("single")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === "single"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Single Date
              </button>
              <button
                onClick={() => setDateMode("range")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateMode === "range"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Date Range
              </button>
            </div>
          </div>

          {dateMode === "single" ? (
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
          ) : (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="col-span-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>Note:</strong> The total count will be divided equally across {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days.
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Customer Count
                </label>
                <input
                  type="number"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData({ ...formData, count: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Auto-calculated values - displayed as read-only */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Change (Auto-calculated)
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.change > 0 ? '+' : ''}{formData.change}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Change Percent (Auto-calculated)
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.changePercent > 0 ? '+' : ''}{formData.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>

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

export default EditNewCustomersCardPage;
