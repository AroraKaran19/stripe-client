import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../utils";

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: { start: Date; end: Date; label: string }) => void;
  currentRange?: { start: Date; end: Date; label: string };
}

const predefinedRanges = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_4_weeks", label: "Last 4 weeks" },
  { value: "month_to_date", label: "Month to date" },
  { value: "quarter_to_date", label: "Quarter to date" },
  { value: "all_time", label: "All time" },
];

const DateRangePicker = ({
  isOpen,
  onClose,
  onApply,
  currentRange,
}: DateRangePickerProps) => {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    currentRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(currentRange?.end || new Date());
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(new Date()); // Always start with current month

  useEffect(() => {
    if (currentRange) {
      setStartDate(currentRange.start);
      setEndDate(currentRange.end);
      setLeftMonth(new Date(currentRange.start));
      // Right month shows current month if end date is in current month, otherwise show end date's month
      const now = new Date();
      const end = new Date(currentRange.end);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // If end date is in current month, show current month, otherwise show end date's month
      setRightMonth(endMonth.getTime() === nowMonth.getTime() ? now : end);
      
      // Check if current range matches a predefined range
      const predefinedMatch = predefinedRanges.find(
        (r) => r.label === currentRange.label
      );
      if (predefinedMatch) {
        setSelectedRange(predefinedMatch.value);
      } else {
        setSelectedRange(null);
      }
    } else {
      setSelectedRange(null);
    }
  }, [currentRange, isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Return day of week where Monday = 0, Sunday = 6
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Sunday=6, shift others
  };

  const formatDateInput = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const parseDateInput = (value: string): Date | null => {
    const parts = value.split(" / ").map((p) => parseInt(p.trim()));
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  };

  const handlePredefinedRange = (value: string) => {
    setSelectedRange(value);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    let start: Date;
    let end: Date = endOfToday;

    switch (value) {
      case "today":
        start = today;
        break;
      case "last_7_days":
        start = new Date(today);
        start.setDate(start.getDate() - 6); // Last 7 days includes today
        break;
      case "last_4_weeks":
        start = new Date(today);
        start.setDate(start.getDate() - 27); // Last 4 weeks includes today
        break;
      case "month_to_date":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "quarter_to_date":
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case "all_time":
        start = new Date(2000, 0, 1); // Very early date
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    // Set months based on the range
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setLeftMonth(new Date(start));
    // Right month shows current month if end date is in current month, otherwise show end date's month
    setRightMonth(endMonth.getTime() === nowMonth.getTime() ? now : end);
  };

  const handleDateClick = (date: Date, isLeftCalendar: boolean) => {
    if (!startDate || (startDate && endDate && startDate.getTime() !== endDate.getTime())) {
      // Starting new selection
      setStartDate(date);
      setEndDate(date);
      setSelectedRange(null);
    } else if (startDate && !endDate) {
      // Selecting end date
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelectedRange(null);
    } else {
      // Reset selection
      setStartDate(date);
      setEndDate(date);
      setSelectedRange(null);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const dateTime = date.getTime();
    const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
    return dateTime >= startTime && dateTime <= endTime;
  };

  const isDateSelected = (date: Date) => {
    if (!startDate || !endDate) return false;
    const dateStr = date.toDateString();
    return dateStr === startDate.toDateString() || dateStr === endDate.toDateString();
  };

  const renderCalendar = (monthDate: Date, isLeftCalendar: boolean) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const isSelected = isDateSelected(date);
      const inRange = isDateInRange(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date, isLeftCalendar)}
          className={cn(
            "w-8 h-8 text-xs font-medium rounded-md transition-colors",
            {
              "bg-[#533afd] text-white": isSelected,
              "bg-[#533afd]/10 text-[#533afd]": inRange && !isSelected,
              "text-[#353a44] hover:bg-gray-100": !inRange && !isSelected,
              "font-semibold": isToday && !isSelected,
            }
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next", isLeftCalendar: boolean) => {
    if (isLeftCalendar) {
      const newMonth = new Date(leftMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
      setLeftMonth(newMonth);
      // If right month becomes the same as left, advance right by one month
      if (newMonth.getMonth() === rightMonth.getMonth() && 
          newMonth.getFullYear() === rightMonth.getFullYear()) {
        const right = new Date(newMonth);
        right.setMonth(right.getMonth() + 1);
        setRightMonth(right);
      }
    } else {
      const newMonth = new Date(rightMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
      setRightMonth(newMonth);
      // If left month becomes the same as right, move left back by one month
      if (newMonth.getMonth() === leftMonth.getMonth() && 
          newMonth.getFullYear() === leftMonth.getFullYear()) {
        const left = new Date(newMonth);
        left.setMonth(left.getMonth() - 1);
        setLeftMonth(left);
      }
    }
  };

  const handleApply = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const label =
      predefinedRanges.find((r) => r.value === selectedRange)?.label ||
      `${formatDateInput(startDate)} - ${formatDateInput(endDate)}`;
    // Close modal first
    onClose();
    // Then apply the changes
    onApply({ start: startDate, end: endDate, label });
  };

  const handleClear = () => {
    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
    setSelectedRange(null);
  };

  if (!isOpen) return null;

  return (
    <div className="flex">
          {/* Left Panel - Predefined Ranges */}
          <div className="w-44 border-r border-[#e5e7eb] bg-[#f9fafb]">
            <div className="p-3">
              <div className="space-y-0.5">
                {predefinedRanges.map((range) => {
                  // Check if this range matches current selection
                  const isSelected = selectedRange === range.value || 
                    (!selectedRange && currentRange && 
                     predefinedRanges.find(r => r.label === currentRange.label)?.value === range.value);
                  
                  return (
                    <button
                      key={range.value}
                      onClick={() => handlePredefinedRange(range.value)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        {
                          "bg-[#533afd]/10 text-[#533afd]": isSelected,
                          "text-[#353a44] hover:bg-white": !isSelected,
                        }
                      )}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Calendar */}
          <div className="flex-1 p-4">
            {/* Date Inputs */}
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#353a44] mb-1">
                  Start
                </label>
                <input
                  type="text"
                  value={formatDateInput(startDate)}
                  onChange={(e) => {
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) setStartDate(parsed);
                  }}
                  className="w-full px-2 py-1.5 text-xs border border-[#533afd] rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd]"
                  placeholder="DD / MM / YYYY"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#353a44] mb-1">
                  End
                </label>
                <input
                  type="text"
                  value={formatDateInput(endDate)}
                  onChange={(e) => {
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) setEndDate(parsed);
                  }}
                  className="w-full px-2 py-1.5 text-xs border border-[#533afd] rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd]"
                  placeholder="DD / MM / YYYY"
                />
              </div>
            </div>

            {/* Calendars */}
            <div className="flex gap-4">
              {/* Left Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => navigateMonth("prev", true)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeft className="size-3" />
                  </button>
                  <h3 className="text-xs font-semibold text-[#353a44]">
                    {leftMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => navigateMonth("next", true)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRight className="size-3" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div
                      key={day}
                      className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(leftMonth, true)}
                </div>
              </div>

              {/* Right Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth("prev", false)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-[#353a44]">
                    {rightMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => navigateMonth("next", false)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div
                      key={day}
                      className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(rightMonth, false)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-semibold text-[#353a44] bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={(e) => handleApply(e)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#533afd] rounded-md hover:bg-[#4328e8] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
  );
};

export default DateRangePicker;

