import { ChevronDownIcon } from "lucide-react";
import { cloneElement, useState, useRef, useEffect } from "react";
import InfoIcon from "../../../assets/home/InfoIcon";
import type { AnalyticsData } from "../../../services/analytics.service";
import { cn } from "../../../utils";

interface TopCustomersCardProps {
  topCustomers: AnalyticsData["topCustomersBySpend"];
}

const timeFilterOptions = [
  { value: "all_time", label: "All time" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_12_months", label: "Last 12 months" },
];

const TopCustomersCard = ({ topCustomers }: TopCustomersCardProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all_time");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAmount = (amount: number) => {
    return `US$${amount.toFixed(2)}`;
  };

  const currentFilterLabel =
    timeFilterOptions.find((opt) => opt.value === selectedFilter)?.label ||
    "All time";

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-md p-3 overflow-hidden">
      <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold mb-2 flex-shrink-0">
        <span>Top customers by spend</span>
        <span className="text-xs text-gray-500">
          {cloneElement(<InfoIcon />, {
            className: "size-3 stroke-3",
          })}
        </span>
        <div className="relative ml-auto" ref={filterRef}>
          <button
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#353a44] hover:bg-gray-50 rounded-md transition-colors"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            {currentFilterLabel}
            <ChevronDownIcon className="size-3 stroke-3" />
          </button>
          {filterOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#e5e7eb] rounded-md shadow-lg z-50 min-w-[140px]">
              {timeFilterOptions.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8] transition-colors",
                    {
                      "text-[#533afd] bg-[#f5f6f8]": selectedFilter === option.value,
                      "text-[#353a44]": selectedFilter !== option.value,
                    }
                  )}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setFilterOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: "calc(100% - 60px)" }}>
        {topCustomers.length === 0 ? (
          <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-md">
            <span className="text-sm text-gray-500">No data</span>
          </div>
        ) : (
          <div className="space-y-2">
            {topCustomers.slice(0, 8).map((customer, index) => (
              <div
                key={customer.customer_id || customer.owner_email || index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#353a44] truncate">
                    {customer.owner || customer.owner_email || customer.customer_id || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customer.transactionCount} transaction
                    {customer.transactionCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#353a44] ml-2">
                  {formatAmount(customer.totalSpend)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCustomersCard;

