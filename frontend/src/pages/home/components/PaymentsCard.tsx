import type { Transaction } from "../../../types/transaction";
import { Link } from "react-router-dom";

interface PaymentsCardProps {
  payments: Transaction[];
}

const PaymentsCard = ({ payments }: PaymentsCardProps) => {
  const formatAmount = (amount: number, currency: string = "US$") => {
    return `${currency}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-md p-3 overflow-hidden">
      <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold mb-2 flex-shrink-0">
        <span>Payments</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: "calc(100% - 40px)" }}>
        {payments.length === 0 ? (
          <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-md">
            <span className="text-sm text-gray-500">No data</span>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.slice(0, 8).map((payment) => (
              <Link
                key={payment._id}
                to={`/transactions/${payment._id}`}
                className="block p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#353a44] truncate">
                      {payment.description || payment.payment_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(payment.admin_date || payment.createdAt)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#353a44] ml-2">
                    {formatAmount(payment.amount || 0, payment.currency || "US$")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsCard;