import { ChevronDownIcon, Plus, PlusCircleIcon, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils";
import DateRangePicker from "../../../components/ui/DateRangePicker";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface SecondSectionHeaderProps {
  dateRange: string;
  frequency: string;
  compareOption?: string;
  customDateRange?: DateRange;
  onDateRangeChange: (range: string) => void;
  onCustomDateRangeChange: (range: DateRange) => void;
  onFrequencyChange: (freq: string) => void;
  onCompareChange?: (option: string) => void;
  onAddClick?: () => void;
  onEditClick?: () => void;
  isEditMode?: boolean;
}

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_4_weeks", label: "Last 4 weeks" },
  { value: "month_to_date", label: "Month to date" },
  { value: "quarter_to_date", label: "Quarter to date" },
  { value: "all_time", label: "All time" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
];

const compareOptions = [
  { value: "previous_period", label: "Previous period" },
  { value: "previous_week", label: "Previous week" },
  { value: "previous_month", label: "Previous month" },
  { value: "previous_year", label: "Previous year" },
  { value: "custom", label: "Custom" },
];

const SecondSectionHeader = ({
  dateRange,
  frequency,
  compareOption = "previous_period",
  customDateRange,
  onDateRangeChange,
  onCustomDateRangeChange,
  onFrequencyChange,
  onCompareChange,
  onAddClick,
  onEditClick,
  isEditMode = false,
}: SecondSectionHeaderProps) => {
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const dateRangeRef = useRef<HTMLDivElement>(null);
  const dateRangeButtonRef = useRef<HTMLButtonElement>(null);
  const frequencyRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const frequencyButtonRef = useRef<HTMLButtonElement>(null);
  const compareButtonRef = useRef<HTMLButtonElement>(null);
  const [frequencyPosition, setFrequencyPosition] = useState({ top: 0, left: 0 });
  const [comparePosition, setComparePosition] = useState({ top: 0, left: 0 });
  const [dateRangePosition, setDateRangePosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close frequency dropdown
      if (
        frequencyRef.current &&
        !frequencyRef.current?.contains(event.target as Node) &&
        frequencyButtonRef.current &&
        !frequencyButtonRef.current.contains(event.target as Node)
      ) {
        setFrequencyOpen(false);
      }
      // Close compare dropdown
      if (
        compareRef.current &&
        !compareRef.current.contains(event.target as Node) &&
        compareButtonRef.current &&
        !compareButtonRef.current.contains(event.target as Node)
      ) {
        setCompareOpen(false);
      }
      // Close date range picker
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target as Node) &&
        dateRangeButtonRef.current &&
        !dateRangeButtonRef.current.contains(event.target as Node)
      ) {
        setDateRangePickerOpen(false);
      }
    };

    const handleScroll = () => {
      if (frequencyOpen) {
        updateFrequencyPosition();
      }
      if (compareOpen) {
        updateComparePosition();
      }
      if (dateRangePickerOpen) {
        updateDateRangePosition();
      }
    };

    const handleResize = () => {
      if (frequencyOpen) {
        updateFrequencyPosition();
      }
      if (compareOpen) {
        updateComparePosition();
      }
      if (dateRangePickerOpen) {
        updateDateRangePosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [frequencyOpen, compareOpen, dateRangePickerOpen]);

  const updateFrequencyPosition = () => {
    if (frequencyButtonRef.current) {
      const rect = frequencyButtonRef.current.getBoundingClientRect();
      // getBoundingClientRect() returns viewport coordinates, which is what we need for fixed positioning
      setFrequencyPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const updateComparePosition = () => {
    if (compareButtonRef.current) {
      const rect = compareButtonRef.current.getBoundingClientRect();
      // getBoundingClientRect() returns viewport coordinates, which is what we need for fixed positioning
      setComparePosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const updateDateRangePosition = () => {
    if (dateRangeButtonRef.current) {
      const rect = dateRangeButtonRef.current.getBoundingClientRect();
      // getBoundingClientRect() returns viewport coordinates, which is what we need for fixed positioning
      setDateRangePosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const currentDateRangeLabel = customDateRange
    ? customDateRange.label
    : dateRangeOptions.find((opt) => opt.value === dateRange)?.label ||
      "Last 7 days";
  const currentFrequencyLabel =
    frequencyOptions.find((opt) => opt.value === frequency)?.label || "Daily";
  const currentCompareLabel =
    compareOptions.find((opt) => opt.value === compareOption)?.label ||
    "Previous period";

  return (
    <>
      <div className="sticky top-0 bg-white z-[200] py-4 border-b border-[#e5e7eb] shadow-sm -mx-4 px-4">
        <div className="w-full max-w-full">
          <h1 className="text-3xl font-bold mb-4">Your overview</h1>
          <div className="relative w-full flex gap-4 items-center overflow-x-auto min-w-0">
          <div className="relative shrink-0 z-[100]">
          <button
            ref={dateRangeButtonRef}
            className="flex items-center gap-1 p-1 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-[#e5e7eb] shrink-0"
            onClick={() => {
              if (!dateRangePickerOpen) {
                updateDateRangePosition();
              }
              setDateRangePickerOpen(!dateRangePickerOpen);
              setFrequencyOpen(false);
              setCompareOpen(false);
            }}
          >
            <span className="text-xs font-semibold border-r border-[#e5e7eb] pr-1">
              Date range
            </span>
            <span className="text-xs font-semibold text-[#533afd]">
              {currentDateRangeLabel}
            </span>
            <ChevronDownIcon
              className={cn("size-3 stroke-3 transition-transform duration-200", {
                "rotate-180": dateRangePickerOpen,
              })}
            />
          </button>
          {dateRangePickerOpen &&
            createPortal(
              <div
                ref={dateRangeRef}
                className="fixed bg-white rounded-lg shadow-2xl w-[700px] overflow-hidden z-[10001] border border-[#e5e7eb]"
                style={{
                  top: `${dateRangePosition.top}px`,
                  left: `${dateRangePosition.left}px`,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <DateRangePicker
                  isOpen={dateRangePickerOpen}
                  onClose={() => setDateRangePickerOpen(false)}
                  onApply={(range) => {
                    // Check if it's a predefined range by comparing with options
                    const predefinedMatch = dateRangeOptions.find(
                      (opt) => opt.label === range.label
                    );
                    if (predefinedMatch) {
                      // Use predefined range
                      onDateRangeChange(predefinedMatch.value);
                      setCustomDateRange(undefined);
                    } else {
                      // Custom range
                      onCustomDateRangeChange(range);
                    }
                    setDateRangePickerOpen(false);
                  }}
                  currentRange={customDateRange}
                />
              </div>,
              document.body
            )}
        </div>

        <div className="relative shrink-0 z-[100]">
          <button
            ref={frequencyButtonRef}
            className="flex items-center gap-1 p-1 px-1.5 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-[#e5e7eb] shrink-0"
            onClick={() => {
              if (!frequencyOpen) {
                updateFrequencyPosition();
              }
              setFrequencyOpen(!frequencyOpen);
              setDateRangePickerOpen(false);
              setCompareOpen(false);
            }}
          >
            <span className="text-xs font-semibold text-[#533afd]">
              {currentFrequencyLabel}
            </span>
            <ChevronDownIcon
              className={cn("size-3 stroke-3 transition-transform duration-200", {
                "rotate-180": frequencyOpen,
              })}
            />
          </button>
          {frequencyOpen &&
            createPortal(
              <div
                ref={frequencyRef}
                className="fixed bg-white border border-[#e5e7eb] rounded-md shadow-lg z-[10000] min-w-[100px]"
                style={{
                  top: `${frequencyPosition.top}px`,
                  left: `${frequencyPosition.left}px`,
                }}
              >
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8] transition-colors flex items-center justify-between",
                      {
                        "text-[#533afd] bg-[#f5f6f8]": frequency === option.value,
                        "text-[#353a44]": frequency !== option.value,
                      }
                    )}
                    onClick={() => {
                      onFrequencyChange(option.value);
                      setFrequencyOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {frequency === option.value && (
                      <span className="text-[#533afd]">✓</span>
                    )}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        <div className="relative shrink-0 z-[100]">
          <button
            ref={compareButtonRef}
            className="flex items-center gap-1 p-1 px-1.5 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-dashed border-[#e5e7eb] shrink-0"
            onClick={() => {
              if (!compareOpen) {
                updateComparePosition();
              }
              setCompareOpen(!compareOpen);
              setDateRangePickerOpen(false);
              setFrequencyOpen(false);
            }}
          >
            <PlusCircleIcon className="size-3 stroke-3 text-[rgb(53,58,68,0.5)]" />
            <span className="text-xs font-semibold">
              {currentCompareLabel}
            </span>
            <ChevronDownIcon
              className={cn("size-3 stroke-3 transition-transform duration-200", {
                "rotate-180": compareOpen,
              })}
            />
          </button>
          {compareOpen &&
            createPortal(
              <div
                ref={compareRef}
                className="fixed bg-white border border-[#e5e7eb] rounded-md shadow-lg z-[10000] min-w-[160px]"
                style={{
                  top: `${comparePosition.top}px`,
                  left: `${comparePosition.left}px`,
                }}
              >
                {compareOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8] transition-colors flex items-center justify-between",
                      {
                        "text-[#533afd] bg-[#f5f6f8]": compareOption === option.value,
                        "text-[#353a44]": compareOption !== option.value,
                      }
                    )}
                    onClick={() => {
                      if (onCompareChange) {
                        onCompareChange(option.value);
                      }
                      setCompareOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {compareOption === option.value && (
                      <span className="text-[#533afd]">✓</span>
                    )}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        <div className="more-btns ml-auto flex gap-4 items-center">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 p-1 px-2 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:border-gray-400 rounded-md border border-[#e5e7eb]"
          >
            <Plus className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Add</span>
          </button>
          <button
            onClick={onEditClick}
            className={cn(
              "flex items-center gap-2 p-1 px-2 cursor-pointer transition-all duration-200 ease-in-out hover:border-gray-400 rounded-md border",
              isEditMode
                ? "text-[#533afd] border-[#533afd] bg-[#f5f6f8]"
                : "text-[#353a44] border-[#e5e7eb]"
            )}
          >
            <Settings className="size-3 stroke-3" />
            <span className="text-sm font-semibold">{isEditMode ? "Done" : "Edit"}</span>
          </button>
        </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecondSectionHeader;
