import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paymentsCardService } from "../../services/payments-card.service";
import type { PaymentsCardData, PaymentTransaction } from "../../services/payments-card.service";

const EditPaymentsCardPage = () => {
  const navigate = useNavigate();
  // Initialize with today at noon to avoid timezone issues
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [notes, setNotes] = useState("");

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
      console.log("📅 Selected Date Object:", selectedDate);
      console.log("📅 Formatted Date String:", formatDateString(selectedDate));
      console.log("📅 Date components:", {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate()
      });
      
      const response = await paymentsCardService.getByDate(selectedDate);
      console.log("Fetched payments data:", response);
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as PaymentsCardData;
        console.log("Loading transactions:", data.transactions);
        setTransactions(data.transactions || []);
        setNotes(data.notes || "");
      } else {
        console.log("No data found, resetting to empty");
        setTransactions([]);
        setNotes("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTransactions([]);
      setNotes("");
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = () => {
    const newTransaction: PaymentTransaction = {
      id: Date.now().toString(),
      description: "Product Purchase",
      date: formatDateString(selectedDate),
      amount: 0,
      status: "successful",
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, field: keyof PaymentTransaction, value: any) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const calculateStats = () => {
    const successful = transactions.filter(t => t.status === "successful");
    const failed = transactions.filter(t => t.status === "failed");
    const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = successful.length > 0 ? totalAmount / successful.length : 0;
    
    return {
      totalPayments: transactions.length,
      successfulPayments: successful.length,
      failedPayments: failed.length,
      averagePaymentAmount: avgAmount,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const stats = calculateStats();
      const dataToSave = {
        transactions,
        ...stats,
        notes,
        updatedBy: "Admin",
      };
      await paymentsCardService.createOrUpdate(selectedDate, dataToSave);
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
      await paymentsCardService.delete(selectedDate);
      setMessage({ type: "success", text: "Data deleted successfully!" });
      fetchData(); // Refresh to show empty form
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
            Edit Payments Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage payments data for the home page
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
                const newDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon to avoid timezone issues
                console.log("📅 Date picker changed to:", e.target.value, "→", newDate);
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
              {/* Transaction List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Transactions</h3>
                  <button
                    onClick={addTransaction}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    + Add Transaction
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No transactions yet. Click "Add Transaction" to create one.
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={transaction.description}
                              onChange={(e) => updateTransaction(transaction.id, "description", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Product Purchase"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={transaction.date}
                              max={formatDateString(new Date())}
                              onChange={(e) => updateTransaction(transaction.id, "date", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Amount ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={transaction.amount}
                              onChange={(e) => updateTransaction(transaction.id, "amount", Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Status
                            </label>
                            <select
                              value={transaction.status}
                              onChange={(e) => updateTransaction(transaction.id, "status", e.target.value as "successful" | "failed")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="successful">Successful</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>

                          <div className="col-span-1 flex items-end">
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="w-full px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Delete transaction"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Auto-calculated Stats */}
              {transactions.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto-calculated Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="block text-xs text-gray-600">Total Payments</span>
                      <span className="text-lg font-semibold text-gray-900">{calculateStats().totalPayments}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600">Successful</span>
                      <span className="text-lg font-semibold text-green-600">{calculateStats().successfulPayments}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600">Failed</span>
                      <span className="text-lg font-semibold text-red-600">{calculateStats().failedPayments}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600">Avg Amount</span>
                      <span className="text-lg font-semibold text-gray-900">${calculateStats().averagePaymentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

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

export default EditPaymentsCardPage;
