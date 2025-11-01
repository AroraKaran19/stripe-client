import { useState } from "react";
import { cn } from "../../../utils";
import type { FilterContainer } from "../TransactionPage";
import MoreFiltersContainer from "./MoreFiltersContainer";

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

  return (
    <div className="payment-page w-full flex flex-col gap-2">
      <div className="filter-container mt-4 w-full flex gap-1 items-center">
        {filterContainer.map((filter: FilterContainer, index: number) => (
          <button
            key={index}
            className={cn(
              "border rounded-md p-3 cursor-pointer w-full flex flex-col items-start",
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
        resetFilter={resetFilter}
      />
    </div>
  );
};

export default PaymentPage;
