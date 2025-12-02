import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserFromRoute } from "../../hooks/useUserFromRoute";
import { homepageService } from "../../services/homepage.service";
import { Plus, Trash2 } from "lucide-react";

interface FailedPaymentTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  reason?: string;
}

const EditFailedPaymentsCardPage = () => {
  const navigate = useNavigate();
  const { username } = useUserFromRoute();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    transactions: [] as FailedPaymentTransaction[],
    count: 0,
    totalAmount: 0,
    averageAmount: 0,
  });

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
      const response = await homepageService.getCard(
        username,
        "Failed Payments Card",
        selectedDate
      );

      if (response.data && !Array.isArray(response.data)) {
        const entry = response.data as any;
        const data = entry.data;

        if (data) {
          setFormData({
            transactions: data.transactions || [],
            count: data.count || 0,
            totalAmount: data.totalAmount || 0,
            averageAmount: data.averageAmount || 0,
          });
        } else {
          setFormData({
            transactions: [],
            count: 0,
            totalAmount: 0,
            averageAmount: 0,
          });
        }
      } else {
        setFormData({
          transactions: [],
          count: 0,
          totalAmount: 0,
          averageAmount: 0,
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
      const dataToSave = {
        transactions: formData.transactions,
        count: formData.count,
        totalAmount: formData.totalAmount,
        averageAmount: formData.averageAmount,
      };

      await homepageService.createOrUpdateCard(
        username,
        "Failed Payments Card",
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

  const addTransaction = () => {
    setFormData({
      ...formData,
      transactions: [
        ...formData.transactions,
        {
          id: `tx_${Date.now()}`,
          description: "",
          date: formatDateString(selectedDate),
          amount: 0,
          reason: "",
        },
      ],
    });
  };

  const removeTransaction = (index: number) => {
    setFormData({
      ...formData,
      transactions: formData.transactions.filter((_, i) => i !== index),
    });
  };

  const updateTransaction = (
    index: number,
    field: keyof FailedPaymentTransaction,
    value: any
  ) => {
    const updated = [...formData.transactions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, transactions: updated });
  };

  const calculateStats = () => {
    const count = formData.transactions.length;
    const totalAmount = formData.transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const average = count > 0 ? totalAmount / count : 0;

    setFormData({
      ...formData,
      count,
      totalAmount,
      averageAmount: average,
    });
  };

  useEffect(() => {
    calculateStats();
  }, [formData.transactions]);

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
            Edit Failed Payments Card
          </h1>
          <p className="text-gray-600 mb-2">
            Manage failed payments data and statistics
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    value={formData.count}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount.toFixed(2)}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Amount
                  </label>
                  <input
                    type="number"
                    value={formData.averageAmount.toFixed(2)}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Failed Transactions
                  </h3>
                  <button
                    onClick={addTransaction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Transaction #{index + 1}
                        </span>
                        <button
                          onClick={() => removeTransaction(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            ID
                          </label>
                          <input
                            type="text"
                            value={transaction.id}
                            onChange={(e) =>
                              updateTransaction(index, "id", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={transaction.description}
                            onChange={(e) =>
                              updateTransaction(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Amount
                          </label>
                          <input
                            type="number"
                            value={transaction.amount}
                            onChange={(e) =>
                              updateTransaction(
                                index,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reason
                          </label>
                          <input
                            type="text"
                            value={transaction.reason || ""}
                            onChange={(e) =>
                              updateTransaction(index, "reason", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No failed transactions. Click "Add Transaction" to add
                      one.
                    </div>
                  )}
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

export default EditFailedPaymentsCardPage;
