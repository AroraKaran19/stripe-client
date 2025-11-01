import { useState, useEffect } from "react";
import { cn } from "../../../utils";
import type { FilterContainer } from "../TransactionPage";
import MoreFiltersContainer from "./MoreFiltersContainer";
import StatusBadge from "../../../components/transactions/StatusBadge";
import VisaIcon from "../../../assets/transaction/VisaIcon";
import { transactionService } from "../../../services/transaction.service";
import type { Transaction } from "../../../types/transaction";

const PaymentPage = ({
  filterContainer,
  activeFilter,
  setActiveFilter,
  resetFilter,
}: {
  filterContainer: FilterContainer[];
  activeFilter: FilterContainer;
  setActiveFilter: (filter: FilterContainer) => void;
  resetFilter: () => void;
}) => {
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Map filter label to status value
        const statusFilter =
          activeFilter.label === "All"
            ? undefined
            : { status: activeFilter.label.toLowerCase() };

        const response = await transactionService.getAll(
          page,
          limit,
          statusFilter
        );
        setTransactions(response.data.transactions);
      } catch (err) {
        setError("Failed to load transactions. Please try again.");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeFilter, page, limit]);

  return (
    <div className="payment-page w-full flex flex-col gap-2">
      <div className="filter-container mt-4 w-full flex gap-1 items-center overflow-x-auto">
        {filterContainer.map((filter: FilterContainer, index: number) => (
          <button
            key={index}
            className={cn(
              "border rounded-md min-w-max p-3 cursor-pointer w-full flex flex-col items-start",
              {
                "border-[#533afd] text-[#533afd] font-semibold":
                  activeFilter.label === filter.label,
                "border-gray-300 text-gray-500":
                  activeFilter.label !== filter.label,
              }
            )}
            onClick={() => setActiveFilter(filter)}
            style={{
              width: `${100 / filterContainer.length}%`,
            }}
          >
            <span className="text-sm">{filter.label}</span>
            <span className="text-sm font-bold">{filter.value}</span>
          </button>
        ))}
      </div>
      <MoreFiltersContainer
        activeFilter={activeFilter}
        activeDate={activeDate}
        setActiveDate={setActiveDate}
        resetFilter={resetFilter}
      />
      <div className="transactions-container w-full overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="transaction-selection text-left pb-2 px-3 whitespace-nowrap">
                <input type="checkbox" className="size-4" />
              </th>
              <th className="text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Amount
              </th>
              <th className="transaction-currency text-left pb-2 px-3 whitespace-nowrap"></th>
              <th className="transaction-status text-left pb-2 px-3 whitespace-nowrap"></th>
              <th className="transaction-payment-method text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Payment Method
              </th>
              <th className="transaction-description text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Description
              </th>
              <th className="transaction-customer text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Customer
              </th>
              <th className="date text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Date
              </th>
              <th className="settlement-merchant text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Settlement merchant
              </th>
              <th className="transferred-to text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Transferred to
              </th>
              <th className="refunded-date text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Refunded date
              </th>
              <th className="decline-reason text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                Decline reason
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-red-500">
                  {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b border-gray-200">
                  <td className="transaction-selection text-left pb-2 px-3 whitespace-nowrap">
                    <input type="checkbox" className="size-4" />
                  </td>
                  <td className="amount text-sm font-semibold text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.amount
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: transaction.currency || "USD",
                        }).format(transaction.amount)
                      : "—"}
                  </td>
                  <td className="transaction-currency text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.currency ?? "—"}
                  </td>
                  <td className="transaction-status text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.status ? (
                      <StatusBadge status={transaction.status} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="transaction-payment-method text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.payment_method?.cart_last_four ? (
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <VisaIcon className="size-5" /> ••••{" "}
                        {transaction.payment_method.cart_last_four}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="transaction-description text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.description ?? transaction._id ?? "—"}
                  </td>
                  <td className="transaction-customer text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.customer_id ?? "—"}
                  </td>
                  <td className="date text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : "—"}
                  </td>
                  <td className="settlement-merchant text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.statement_descriptor ?? "—"}
                  </td>
                  <td className="transferred-to text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.transferred_to ?? "—"}
                  </td>
                  <td className="refunded-date text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.refunded_date
                      ? new Date(transaction.refunded_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="decline-reason text-gray-500 text-sm text-left pb-2 px-3 whitespace-nowrap">
                    {transaction.decline_reason ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentPage;
