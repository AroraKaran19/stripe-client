import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Eye,
  Search,
  Filter,
  Trash2,
  Plus,
  RefreshCw,
  Edit2,
} from "lucide-react";
import { cn } from "../../utils";
import StatusBadge from "../../components/transactions/StatusBadge";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import EditTransactionModal from "../../components/transactions/EditTransactionModal";
import { transactionService } from "../../services/transaction.service";
import type { Transaction } from "../../types/transaction";

const AdminTransactionManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Succeeded", value: "succeeded" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
    { label: "Disputed", value: "disputed" },
    { label: "Uncaptured", value: "uncaptured" },
  ];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: Record<string, any> = {};

      if (selectedStatus !== "all") {
        filters.status = selectedStatus;
      }

      // Pass search query as a separate parameter
      const search = searchQuery?.trim() || undefined;

      const response = await transactionService.getAll(page, limit, filters, search);
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit, selectedStatus, searchQuery]);


  const formatCurrency = (
    amount: number | undefined,
    currency: string | undefined = "USD"
  ) => {
    if (amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTransactions(new Set(transactions.map((t) => t._id || "")));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleSelectTransaction = (id: string | undefined) => {
    if (!id) return;
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await transactionService.delete(id);
      fetchTransactions();
      setSelectedTransactions(new Set());
    } catch (err) {
      alert("Failed to delete transaction");
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedTransactions.size} transaction(s)?`
      )
    )
      return;
    try {
      await Promise.all(
        Array.from(selectedTransactions).map((id) =>
          transactionService.delete(id)
        )
      );
      fetchTransactions();
      setSelectedTransactions(new Set());
    } catch (err) {
      alert("Failed to delete transactions");
      console.error(err);
    }
  };

  const allSelected =
    transactions.length > 0 &&
    selectedTransactions.size === transactions.length;
  const someSelected =
    selectedTransactions.size > 0 &&
    selectedTransactions.size < transactions.length;

  return (
    <>
      <Helmet>
        <title>Transaction Management | Visualize & Build ltd. - Stripe Admin</title>
        <meta
          name="description"
          content="Admin panel for managing and monitoring all transactions. Create, edit, delete, and track transactions with comprehensive filtering and search capabilities."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Transaction Management | Visualize & Build ltd. - Stripe Admin"
        />
        <meta
          property="og:description"
          content="Admin panel for managing and monitoring all transactions. Create, edit, delete, and track transactions with comprehensive filtering and search capabilities."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Transaction Management | Visualize & Build ltd. - Stripe Admin"
        />
        <meta
          name="twitter:description"
          content="Admin panel for managing and monitoring all transactions. Create, edit, delete, and track transactions with comprehensive filtering and search capabilities."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="transaction management, admin panel, payment administration, transaction tracking, financial management, stripe admin"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="py-4 w-full flex flex-col gap-2">
        {/* Header */}
      <div className="w-full flex flex-col lg:flex-row">
        <h6 className="text-3xl font-bold text-gray-700">
          <span>Transaction Management</span>
        </h6>
        <div className="action-btns mt-2 lg:mt-0 lg:ml-auto flex gap-2 items-center">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 bg-[#533afd] text-white rounded-md px-2 py-1 cursor-pointer"
          >
            <Plus className="size-3 stroke-3" />
            <span className="text-sm font-semibold">New Transaction</span>
          </button>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer"
          >
            <RefreshCw className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="w-full flex flex-col md:flex-row gap-2 mt-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="Search by email, name, payment ID, description, or transaction ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd]"
            />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="pl-8 pr-6 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] appearance-none bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limit Selector */}
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd] focus:border-[#533afd] appearance-none bg-white"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>

        {/* Selected Actions */}
        {selectedTransactions.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-700">
              {selectedTransactions.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
            <button
              onClick={() => setSelectedTransactions(new Set())}
              className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <div className="bg-white rounded-md border border-gray-200 p-2">
          <div className="text-xs text-gray-500">Total Transactions</div>
          <div className="text-lg font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-2">
          <div className="text-xs text-gray-500">Selected</div>
          <div className="text-lg font-bold text-gray-900">
            {selectedTransactions.size}
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-2">
          <div className="text-xs text-gray-500">Page</div>
          <div className="text-lg font-bold text-gray-900">
            {page} / {totalPages || 1}
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-2">
          <div className="text-xs text-gray-500">Showing</div>
          <div className="text-lg font-bold text-gray-900">
            {transactions.length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-container w-full overflow-x-auto h-[550px] max-h-[550px] overflow-y-auto mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Loading transactions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={fetchTransactions}
                className="text-xs text-[#533afd] hover:underline font-medium cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">
                No transactions found
              </p>
              <p className="text-xs text-gray-400">
                {searchQuery || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new transaction"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#533afd] hover:underline mt-2 font-medium cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="transaction-selection text-left pb-2 px-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer rounded border-gray-300 text-[#533afd] focus:ring-[#533afd]"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                  />
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
                <th className="text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                  ID
                </th>
                <th className="text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className={cn(
                    "border-b border-gray-200",
                    selectedTransactions.has(transaction._id || "")
                      ? "bg-blue-50"
                      : ""
                  )}
                >
                  <td
                    className="transaction-selection text-left pb-2 px-3 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer rounded border-gray-300 text-[#533afd] focus:ring-[#533afd]"
                      checked={selectedTransactions.has(
                        transaction._id || ""
                      )}
                      onChange={() =>
                        handleSelectTransaction(transaction._id)
                      }
                    />
                  </td>
                  <td className="amount text-sm font-semibold text-left pb-2 px-3 whitespace-nowrap">
                    {formatCurrency(
                      transaction.amount,
                      transaction.currency
                    )}
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
                      <span className="text-sm text-gray-500">
                        {transaction.payment_method?.card_type || "N/A"} ••••{" "}
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
                    {transaction.owner_email ?? transaction.owner ?? "—"}
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
                  <td className="text-xs font-mono text-gray-500 text-left pb-2 px-3 whitespace-nowrap max-w-[120px] truncate">
                    {transaction._id || transaction.payment_id || "—"}
                  </td>
                  <td
                    className="text-left pb-2 px-3 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          transaction._id &&
                          navigate(`/transactions/${transaction._id}`)
                        }
                        className="p-1 text-gray-600 hover:text-[#533afd] hover:bg-[#533afd]/10 rounded transition-colors cursor-pointer"
                        title="View transaction"
                      >
                        <Eye className="size-3" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id || "")}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container w-full flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">
          {loading
            ? "Loading..."
            : total > 0
            ? `Viewing ${(page - 1) * limit + 1}-${Math.min(
                page * limit,
                total
              )} of ${total} results`
            : "No results"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
            className={cn(
              "text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-gray-300",
              {
                "text-gray-500 hover:text-gray-700": page > 1 && !loading,
                "text-gray-300 cursor-not-allowed": page === 1 || loading,
              }
            )}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page * limit >= total || loading}
            className={cn(
              "text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-gray-300",
              {
                "text-gray-500 hover:text-gray-700":
                  page * limit < total && !loading,
                "text-gray-300 cursor-not-allowed":
                  page * limit >= total || loading,
              }
            )}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchTransactions();
        }}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
          fetchTransactions();
        }}
        transaction={selectedTransaction}
        isUpdating={isUpdating}
        setIsUpdating={setIsUpdating}
      />
      </div>
    </>
  );
};

export default AdminTransactionManagementPage;
