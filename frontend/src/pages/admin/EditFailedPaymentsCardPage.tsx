import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { failedPaymentsCardService } from "../../services/failed-payments-card.service";
import type { FailedPaymentsCardData, FailedPaymentTransaction } from "../../services/failed-payments-card.service";

const EditFailedPaymentsCardPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [transactions, setTransactions] = useState<FailedPaymentTransaction[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await failedPaymentsCardService.getByDate(selectedDate);
      if (response.data && !Array.isArray(response.data)) {
        const data = response.data as FailedPaymentsCardData;
        setTransactions(data.transactions || []);
        setNotes(data.notes || "");
      } else {
        setTransactions([]);
        setNotes("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = () => {
    const newTransaction: FailedPaymentTransaction = {
      id: Date.now().toString(),
      description: "Failed Payment",
      date: selectedDate.toISOString().split('T')[0],
      amount: 0,
      reason: "",
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, field: keyof FailedPaymentTransaction, value: any) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const calculateStats = () => {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
    
    return {
      count: transactions.length,
      totalAmount: totalAmount,
      averageAmount: avgAmount,
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
      await failedPaymentsCardService.createOrUpdate(selectedDate, dataToSave);
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
      await failedPaymentsCardService.delete(selectedDate);
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
            Edit Failed Payments Card
          </h1>
          <p className="text-gray-600 mb-6">
            Manage failed payments data for the home page
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
                  <h3 className="text-lg font-semibold text-gray-900">Failed Payment Transactions</h3>
                  <button
                    onClick={addTransaction}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    + Add Failed Payment
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No failed payments yet. Click "Add Failed Payment" to create one.
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={transaction.description}
                              onChange={(e) => updateTransaction(transaction.id, "description", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Failed Payment"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={transaction.date}
                              max={new Date().toISOString().split("T")[0]}
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

                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Failure Reason
                            </label>
                            <input
                              type="text"
                              value={transaction.reason || ""}
                              onChange={(e) => updateTransaction(transaction.id, "reason", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Insufficient funds"
                            />
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-xs text-gray-600">Total Failed</span>
                      <span className="text-lg font-semibold text-red-600">{calculateStats().count}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600">Total Amount</span>
                      <span className="text-lg font-semibold text-gray-900">${calculateStats().totalAmount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600">Avg Amount</span>
                      <span className="text-lg font-semibold text-gray-900">${calculateStats().averageAmount.toFixed(2)}</span>
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

export default EditFailedPaymentsCardPage;
