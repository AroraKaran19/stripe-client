import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
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
import { useBusiness } from "../../context/BusinessContext";

const AdminTransactionManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessName } = useBusiness();
  const pageTitle = `Transaction Management | ${businessName} - Stripe Admin`;
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

      if (searchQuery) {
        filters.owner_email = searchQuery;
      }

      const response = await transactionService.getAll(page, limit, filters);
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Admin panel for managing and monitoring all transactions. Create, edit, delete, and track transactions with comprehensive filtering and search capabilities."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={pageTitle}
        />
        <meta
          property="og:description"
          content="Admin panel for managing and monitoring all transactions. Create, edit, delete, and track transactions with comprehensive filtering and search capabilities."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content={businessName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={pageTitle}
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
        <meta name="author" content={businessName} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full flex flex-col gap-6 p-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor all transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#533afd] rounded-lg hover:bg-[#4330d4] transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <input
              type="text"
              placeholder="Search by customer email, name, or payment ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-transparent appearance-none bg-white"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:border-transparent appearance-none bg-white"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Selected Actions */}
        {selectedTransactions.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
            <span className="text-sm text-gray-700">
              {selectedTransactions.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="size-4" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedTransactions(new Set())}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Selected</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {selectedTransactions.size}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Page</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {page} / {totalPages || 1}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Showing</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {transactions.length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#533afd] mb-4"></div>
              <p className="text-gray-500 text-sm">Loading transactions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-2 font-medium">{error}</p>
              <button
                onClick={fetchTransactions}
                className="text-sm text-[#533afd] hover:underline font-medium cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <Search className="size-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                No transactions found
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new transaction"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-[#533afd] hover:underline mt-2 font-medium cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4">
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
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Amount
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Customer
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Payment Method
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Description
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      ID
                    </th>
                    <th className="text-xs font-semibold text-gray-700 text-left py-3 px-4 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        selectedTransactions.has(transaction._id || "")
                          ? "bg-blue-50"
                          : ""
                      )}
                    >
                      <td
                        className="py-4 px-4"
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {transaction.currency || "USD"}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {transaction.status && (
                          <StatusBadge status={transaction.status} />
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.owner}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.owner_email}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.payment_method?.card_type || "N/A"} ••••{" "}
                          {transaction.payment_method?.cart_last_four ||
                            transaction.number ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-500 max-w-[120px] truncate">
                          {transaction._id || transaction.payment_id || "-"}
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              transaction._id &&
                              navigate(`/transactions/${transaction._id}`)
                            }
                            className="p-1.5 text-gray-600 hover:text-[#533afd] hover:bg-[#533afd]/10 rounded transition-colors cursor-pointer"
                            title="View transaction"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id || "")}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={cn(
                      "p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                      {
                        "hover:border-gray-400": page !== 1,
                      }
                    )}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors cursor-pointer",
                            {
                              "bg-[#533afd] text-white border-[#533afd]":
                                page === pageNum,
                              "border-gray-300 hover:bg-gray-100 text-gray-700":
                                page !== pageNum,
                            }
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={cn(
                      "p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                      {
                        "hover:border-gray-400": page !== totalPages,
                      }
                    )}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
