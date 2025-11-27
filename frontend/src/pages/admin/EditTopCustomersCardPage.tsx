import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { topCustomersCardService } from "../../services/top-customers-card.service";
import type { TopCustomersCardData, TopCustomer } from "../../services/top-customers-card.service";
import { X, Plus } from "lucide-react";

const EditTopCustomersCardPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    customers: [] as TopCustomer[],
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
      const response = await topCustomersCardService.getByDate(selectedDate);
      console.log("Fetched top customers data:", response);
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as TopCustomersCardData;
        console.log("Loading customers:", data.customers);
        setFormData({
          customers: data.customers || [],
          notes: data.notes || "",
          updatedBy: "Admin",
        });
      } else {
        console.log("No data found, resetting to empty");
        setFormData({
          customers: [],
          notes: "",
          updatedBy: "Admin",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFormData({
        customers: [],
        notes: "",
        updatedBy: "Admin",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await topCustomersCardService.createOrUpdate(selectedDate, formData);
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
      await topCustomersCardService.delete(selectedDate);
      setMessage({ type: "success", text: "Data deleted successfully!" });
      fetchData();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete data. Please try again." });
      console.error("Error deleting data:", error);
    } finally {
      setSaving(false);
    }
  };

  const addCustomer = () => {
    setFormData({
      ...formData,
      customers: [
        ...formData.customers,
        {
          customerId: "",
          email: "",
          name: "",
          totalSpend: 0,
          transactionCount: 0,
        },
      ],
    });
  };

  const removeCustomer = (index: number) => {
    setFormData({
      ...formData,
      customers: formData.customers.filter((_, i) => i !== index),
    });
  };

  const updateCustomer = (index: number, field: keyof TopCustomer, value: string | number) => {
    const updatedCustomers = [...formData.customers];
    updatedCustomers[index] = {
      ...updatedCustomers[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      customers: updatedCustomers,
    });
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
            Edit Top Customers Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage top customers list for the home page
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
                const newDate = new Date(year, month - 1, day, 12, 0, 0, 0);
                setSelectedDate(newDate);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Top Customers
                  </label>
                  <button
                    onClick={addCustomer}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Customer
                  </button>
                </div>

                {formData.customers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No customers added yet</p>
                    <button
                      onClick={addCustomer}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first customer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.customers.map((customer, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
                      >
                        <button
                          onClick={() => removeCustomer(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>

                        <div className="grid grid-cols-2 gap-4 pr-8">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Customer ID (Optional)
                            </label>
                            <input
                              type="text"
                              value={customer.customerId || ""}
                              onChange={(e) =>
                                updateCustomer(index, "customerId", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="CUST-001"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              value={customer.email || ""}
                              onChange={(e) =>
                                updateCustomer(index, "email", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="customer@example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Name (Optional)
                            </label>
                            <input
                              type="text"
                              value={customer.name || ""}
                              onChange={(e) =>
                                updateCustomer(index, "name", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Total Spend ($) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={customer.totalSpend}
                              onChange={(e) =>
                                updateCustomer(index, "totalSpend", Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Transaction Count *
                            </label>
                            <input
                              type="number"
                              value={customer.transactionCount}
                              onChange={(e) =>
                                updateCustomer(index, "transactionCount", Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

export default EditTopCustomersCardPage;
