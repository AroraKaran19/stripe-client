import {
  ChevronDownIcon,
  ChevronsUpDown,
  PlusCircleIcon,
  Redo,
  Settings,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FilterContainer } from "../TransactionPage";
import { cn } from "../../../utils";
import ExportIcon from "../../../assets/transaction/ExportIcon";

const MoreFiltersContainer = ({
  activeFilter,
  resetFilter,
  activeDate,
  setActiveDate,
}: {
  activeFilter: FilterContainer;
  resetFilter: () => void;
  activeDate: Date | null;
  setActiveDate: (date: Date | null) => void;
}) => {
  const [dateSelectionOpen, setDateSelectionOpen] = useState(false);
  const [currencySelectionOpen, setCurrencySelectionOpen] = useState(false);
  const [dateDropdownPosition, setDateDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [currencyDropdownPosition, setCurrencyDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const currencyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dateSelectionOpen) return;

    const updatePosition = () => {
      if (dateButtonRef.current) {
        const rect = dateButtonRef.current.getBoundingClientRect();
        setDateDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideButton = dateButtonRef.current?.contains(target);
      const isInsideDropdown = dateDropdownRef.current?.contains(target);

      if (!isInsideButton && !isInsideDropdown) {
        setDateSelectionOpen(false);
      }
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateSelectionOpen]);

  useEffect(() => {
    if (!currencySelectionOpen) return;

    const updatePosition = () => {
      if (currencyButtonRef.current) {
        const rect = currencyButtonRef.current.getBoundingClientRect();
        setCurrencyDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideButton = currencyButtonRef.current?.contains(target);
      const isInsideDropdown = currencyDropdownRef.current?.contains(target);

      if (!isInsideButton && !isInsideDropdown) {
        setCurrencySelectionOpen(false);
      }
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currencySelectionOpen]);

  const handleModalOpen = (modal: "date" | "currency") => {
    if (modal === "date") {
      setDateSelectionOpen(!dateSelectionOpen);
      setCurrencySelectionOpen(false);
    } else {
      setCurrencySelectionOpen(!currencySelectionOpen);
      setDateSelectionOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="more-filters-container w-full min-w-0 flex gap-2 relative items-center overflow-x-auto pb-3 border-b border-gray-300"
    >
      <div className="relative shrink-0">
        <button
          ref={dateButtonRef}
          type="button"
          className="w-max flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
          onClick={() => handleModalOpen("date")}
        >
          <PlusCircleIcon className="size-3 text-gray-500" />
          <span className="text-xs font-semibold text-gray-500">
            Date and time
          </span>
        </button>

        {dateSelectionOpen &&
          createPortal(
            <div
              ref={dateDropdownRef}
              className="date-selection-container fixed w-[260px] flex flex-col items-start gap-2 bg-white border border-gray-300 rounded-md p-3 shadow-[0_0_10px_3px_rgba(0,0,0,0.1)] z-[9999]"
              style={{
                top: `${dateDropdownPosition.top}px`,
                left: `${dateDropdownPosition.left}px`,
              }}
            >
              <span className="font-semibold text-gray-700 text-sm">
                Filter by: date and time
              </span>
              <button className="selection-container w-full px-2 py-1 flex items-center justify-between border border-gray-300 rounded-md cursor-pointer">
                <span className="text-sm font-semibold text-gray-700">
                  is in the last
                </span>
                <ChevronsUpDown className="size-3 text-gray-500" />
              </button>
              <div className="flex gap-2 w-full items-center">
                <Redo className="size-3 text-[#533afd] transform rotate-180 scale-x-[-1]" />
                <input
                  type="text"
                  value={activeDate?.toISOString().split("T")[0]}
                  onChange={(e) => setActiveDate(new Date(e.target.value))}
                  className="w-20 text-sm px-2 py-1 border border-gray-300 rounded-md"
                />
                <button className="selection-container w-max px-2 py-1 flex items-center justify-between border border-gray-300 rounded-md cursor-pointer">
                  <span className="text-sm font-semibold text-gray-700 mr-3">
                    days
                  </span>
                  <ChevronsUpDown className="size-3 text-gray-500" />
                </button>
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Timezone:
                </span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="relative inline-block">
                    <input
                      type="radio"
                      checked
                      className="size-4 rounded-full appearance-none border border-gray-300 checked:bg-[#533afd] checked:border-[#533afd] cursor-pointer"
                    />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    PDT
                  </span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="relative inline-block">
                    <input
                      type="radio"
                      disabled
                      className="size-4 rounded-full appearance-none border border-gray-300 checked:bg-[#533afd] checked:border-[#533afd] cursor-pointer"
                    />
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    UTC
                  </span>
                </label>
              </div>
              <button className="selection-container w-full bg-[#533afd] text-white px-2 py-1 flex items-center justify-center rounded-md cursor-pointer">
                <span className="text-sm font-semibold">Apply</span>
              </button>
            </div>,
            document.body
          )}
      </div>

      <button
        type="button"
        className="w-max flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
      >
        <PlusCircleIcon className="size-3 text-gray-500" />
        <span className="text-xs font-semibold text-gray-500">Amount</span>
      </button>

      <div className="relative shrink-0">
        <button
          ref={currencyButtonRef}
          type="button"
          className="w-max flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
          onClick={() => handleModalOpen("currency")}
        >
          <PlusCircleIcon className="size-3 text-gray-500" />
          <span className="text-xs font-semibold text-gray-500">Currency</span>
        </button>

        {currencySelectionOpen &&
          createPortal(
            <div
              ref={currencyDropdownRef}
              className="currency-selection-container fixed w-[260px] flex flex-col items-start gap-2 bg-white border border-gray-300 rounded-md p-3 shadow-[0_0_10px_3px_rgba(0,0,0,0.1)] z-[9999]"
              style={{
                top: `${currencyDropdownPosition.top}px`,
                left: `${currencyDropdownPosition.left}px`,
              }}
            >
              <span className="font-semibold text-gray-700 text-sm">
                Filter by: currency
              </span>
              <button className="selection-container w-full px-2 py-1 flex items-center justify-between border border-gray-300 rounded-md cursor-pointer">
                <span className="text-sm font-semibold text-gray-700">USD</span>
                <ChevronsUpDown className="size-3 text-gray-500" />
              </button>
              <button className="selection-container w-full bg-[#533afd] text-white px-2 py-1 flex items-center justify-center rounded-md cursor-pointer">
                <span className="text-sm font-semibold">Apply</span>
              </button>
            </div>,
            document.body
          )}
      </div>

      <button
        type="button"
        className="w-max shrink-0 flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
      >
        {activeFilter.label === "All" ? (
          <PlusCircleIcon className="size-3 text-gray-500" />
        ) : (
          <XCircleIcon
            className="size-3 text-gray-500"
            onClick={() => resetFilter()}
          />
        )}
        <span
          className={cn(
            "text-xs font-semibold text-gray-700 flex items-center gap-2",
            {
              "text-gray-500": activeFilter.label === "All",
            }
          )}
        >
          <span
            className={`${
              activeFilter.label !== "All" && "pr-2 border-r border-gray-300"
            }`}
          >
            Status
          </span>{" "}
          {activeFilter.label !== "All" && (
            <span className="text-[#533afd] flex items-center gap-2">
              <span>{activeFilter.label}</span>
              <ChevronDownIcon className="size-3 text-gray-500" />
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        className="w-max shrink-0 flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
      >
        <PlusCircleIcon className="size-3 text-gray-500" />
        <span className="text-xs font-semibold text-gray-500">
          Payment method
        </span>
      </button>

      <button
        type="button"
        className="w-max shrink-0 flex items-center gap-2 px-2 py-1 border border-dashed border-gray-300 rounded-full cursor-pointer"
      >
        <PlusCircleIcon className="size-3 text-gray-500" />
        <span className="text-xs font-semibold text-gray-500">
          More filters
        </span>
      </button>

      {activeFilter.label !== "All" && (
        <button
          type="button"
          className="w-max shrink-0 cursor-pointer text-sm font-semibold text-[#533afd]"
          onClick={() => resetFilter()}
        >
          <span>Clear filters</span>
        </button>
      )}

      <div className="more-action-btns ml-auto flex items-center gap-2">
        <button
          type="button"
          className="w-max shrink-0 flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md cursor-pointer"
        >
          <ExportIcon className="size-3 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Export</span>
        </button>

        <button
          type="button"
          className="w-max shrink-0 flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md cursor-pointer"
        >
          <Settings className="size-3 text-gray-500 stroke-3" />
          <span className="text-sm font-semibold text-gray-700">
            Edit columns
          </span>
        </button>
      </div>
    </div>
  );
};

export default MoreFiltersContainer;
