import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils";
import { transactionService } from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
}

const EditTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  isUpdating,
  setIsUpdating,
}: EditTransactionModalProps) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        currency: transaction.currency,
        number: transaction.number,
        owner: transaction.owner,
        owner_email: transaction.owner_email,
        fingerprint: transaction.fingerprint,
        expires: transaction.expires,
        type: transaction.type,
        issuer: transaction.issuer,
        cvc_check: transaction.cvc_check,
        origin: transaction.origin,
        address: transaction.address,
        status: transaction.status,
        payment_id: transaction.payment_id,
        description: transaction.description,
        statement_descriptor: transaction.statement_descriptor,
        country: transaction.country,
        customer_id: transaction.customer_id,
        customer_phone: transaction.customer_phone,
        payment_method: transaction.payment_method,
        risk_evaluation: transaction.risk_evaluation,
        items: transaction.items || [],
        transferred_to: transaction.transferred_to,
        refunded_date: transaction.refunded_date,
        decline_reason: transaction.decline_reason,
        admin_date: transaction.admin_date,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction?._id) return;

    setIsUpdating(true);
    try {
      await transactionService.update(transaction._id, formData);
      onSuccess();
    } catch (err) {
      alert("Failed to update transaction. Please try again.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleItemAdd = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          name: "",
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate total_price when quantity or unit_price changes
    if (field === "quantity" || field === "unit_price") {
      const quantity = Number(newItems[index].quantity) || 0;
      const unitPrice = Number(newItems[index].unit_price) || 0;
      newItems[index].total_price = quantity * unitPrice;
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleItemRemove = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Edit Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currency || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status || "succeeded"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Transaction["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                >
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="disputed">Disputed</option>
                  <option value="uncaptured">Uncaptured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment ID
                </label>
                <input
                  type="text"
                  value={formData.payment_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Customer Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.owner_email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customer_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_id: e.target.value })
                  }
                  placeholder="cus_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Type *
                </label>
                <input
                  type="text"
                  value="Visa"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Four Digits *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={formData.payment_method?.cart_last_four || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_method: {
                        card_type: "Visa",
                        ...formData.payment_method,
                        cart_last_four: e.target.value,
                      },
                      number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires (MM / YYYY) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="02 / 2026"
                  value={formData.expires || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, expires: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <input
                type="text"
                value={formData.origin || ""}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transferred To
              </label>
              <input
                type="text"
                value={formData.transferred_to || ""}
                onChange={(e) =>
                  setFormData({ ...formData, transferred_to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decline Reason
              </label>
              <input
                type="text"
                value={formData.decline_reason || ""}
                onChange={(e) =>
                  setFormData({ ...formData, decline_reason: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Date
              </label>
              <input
                type="datetime-local"
                value={
                  formData.admin_date
                    ? new Date(formData.admin_date)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin_date: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refunded Date
              </label>
              <input
                type="datetime-local"
                value={
                  formData.refunded_date
                    ? new Date(formData.refunded_date)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    refunded_date: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Items</h3>
              <button
                type="button"
                onClick={handleItemAdd}
                className="text-sm text-[#533afd] hover:underline font-medium cursor-pointer"
              >
                + Add Item
              </button>
            </div>
            {formData.items?.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name || ""}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit price"
                    value={item.unit_price || ""}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "unit_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Total price"
                    value={item.total_price || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleItemRemove(index)}
                    className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white bg-[#533afd] rounded-lg hover:bg-[#4330d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              )}
            >
              {isUpdating && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isUpdating ? "Updating..." : "Update Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;

