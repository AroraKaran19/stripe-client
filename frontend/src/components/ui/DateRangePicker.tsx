import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../utils";

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: { start: Date; end: Date; label: string }) => void;
  currentRange?: { start: Date; end: Date; label: string };
  onPreview?: (range: { start: Date; end: Date; label: string }) => void;
}

const predefinedRanges = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_4_weeks", label: "Last 4 weeks" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "month_to_date", label: "Month to date" },
  { value: "quarter_to_date", label: "Quarter to date" },
  { value: "all_time", label: "All time" },
];

const DateRangePicker = ({
  isOpen,
  onClose,
  onApply,
  currentRange,
  onPreview,
}: DateRangePickerProps) => {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    currentRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(currentRange?.end || new Date());

  // Left month is always previous month, right month is always current month
  const getRightMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const getLeftMonth = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return prevMonth;
  };

  const [leftMonth, setLeftMonth] = useState(getLeftMonth());
  const [rightMonth, setRightMonth] = useState(getRightMonth());

  useEffect(() => {
    // Always set left to previous month and right to current month
    setLeftMonth(getLeftMonth());
    setRightMonth(getRightMonth());

    if (currentRange) {
      setStartDate(currentRange.start);
      setEndDate(currentRange.end);
      
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
        start = new Date(today);
        break;
      case "last_7_days":
        start = new Date(today);
        start.setDate(start.getDate() - 6); // Last 7 days includes today
        break;
      case "last_4_weeks":
        start = new Date(today);
        start.setDate(start.getDate() - 27); // Last 4 weeks includes today
        break;
      case "last_6_months":
        start = new Date(today);
        start.setMonth(start.getMonth() - 6);
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
    // Always set left to previous month and right to current month
    setLeftMonth(getLeftMonth());
    setRightMonth(getRightMonth());

    // Emit preview so the parent can show the chosen label before apply
    if (onPreview) {
      onPreview({ start, end, label: predefinedRanges.find(r => r.value === value)?.label || "" });
    }
  };

  const handleDateClick = (date: Date, _isLeftCalendar: boolean) => {
    // Disallow selecting future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() > today.getTime()) {
      return;
    }

    // First click: set as start date
    if (!startDate) {
      setStartDate(date);
      setEndDate(date);
      setSelectedRange(null);
      if (onPreview) {
        onPreview({ start: date, end: date, label: `${formatDateInput(date)} - ${formatDateInput(date)}` });
      }
      return;
    }

    // Second click: set as end date
    if (startDate && startDate.getTime() === endDate.getTime()) {
      // If second click is before start date, swap them
      if (date.getTime() < startDate.getTime()) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      setSelectedRange(null);
      if (onPreview) {
        const newStart = date.getTime() < startDate.getTime() ? date : startDate;
        const newEnd = date.getTime() < startDate.getTime() ? startDate : date;
        onPreview({ start: newStart, end: newEnd, label: `${formatDateInput(newStart)} - ${formatDateInput(newEnd)}` });
      }
      return;
    }

    // Third click or more: reset and start new selection
    setStartDate(date);
    setEndDate(date);
    setSelectedRange(null);
    if (onPreview) {
      onPreview({ start: date, end: date, label: `${formatDateInput(date)} - ${formatDateInput(date)}` });
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      const isFuture = date.getTime() > today.getTime();

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isFuture) handleDateClick(date, isLeftCalendar);
          }}
          disabled={isFuture}
          className={cn(
            "w-8 h-8 text-xs font-medium rounded-md transition-colors",
            {
              "bg-[#533afd] text-white": isSelected,
              "bg-[#533afd]/10 text-[#533afd]": inRange && !isSelected && !isFuture,
              "text-[#353a44] hover:bg-gray-100": !inRange && !isSelected && !isFuture,
              "text-gray-300 cursor-not-allowed": isFuture,
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
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (isLeftCalendar) {
      const newMonth = new Date(leftMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
      
      // Left month can go back but cannot go beyond or equal to right month
      const newRight = new Date(newMonth);
      newRight.setMonth(newRight.getMonth() + 1);
      
      // Only allow if new right month doesn't exceed current month
      if (newRight.getTime() <= currentMonth.getTime()) {
        setLeftMonth(newMonth);
        setRightMonth(newRight);
      }
    } else {
      const newMonth = new Date(rightMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
      
      // Right month cannot exceed current month
      if (newMonth.getTime() <= currentMonth.getTime()) {
        setRightMonth(newMonth);
        // Left month is always one month before right
        const newLeft = new Date(newMonth);
        newLeft.setMonth(newLeft.getMonth() - 1);
        setLeftMonth(newLeft);
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
    // Apply changes before closing to avoid any race with unmounting
    onApply({ start: startDate, end: endDate, label });
    onClose();
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
            <div className="flex gap-6 mb-6 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#353a44]">Start</span>
                <input
                  type="text"
                  value={formatDateInput(startDate)}
                  onChange={(e) => {
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (parsed.getTime() <= today.getTime()) setStartDate(parsed);
                    }
                    if (onPreview) {
                      onPreview({ start: startDate, end: endDate, label: `${formatDateInput(startDate)} - ${formatDateInput(endDate)}` });
                    }
                  }}
                  className="px-3 py-1.5 text-xs border border-[#533afd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-1 w-32 text-center font-semibold"
                  placeholder="DD / MM / YYYY"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#353a44]">End</span>
                <input
                  type="text"
                  value={formatDateInput(endDate)}
                  onChange={(e) => {
                    const parsed = parseDateInput(e.target.value);
                    if (parsed) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (parsed.getTime() <= today.getTime()) setEndDate(parsed);
                    }
                    if (onPreview) {
                      onPreview({ start: startDate, end: endDate, label: `${formatDateInput(startDate)} - ${formatDateInput(endDate)}` });
                    }
                  }}
                  className="px-3 py-1.5 text-xs border border-[#533afd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-1 w-32 text-center font-semibold"
                  placeholder="DD / MM / YYYY"
                />
              </div>
            </div>

            {/* Calendars */}
            <div className="flex gap-8">
              {/* Left Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth("prev", true)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronLeft className="size-4 text-[#353a44]" />
                  </button>
                  <h3 className="text-sm font-semibold text-[#353a44]">
                    {leftMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => navigateMonth("next", true)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronRight className="size-4 text-[#353a44]" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div
                      key={day}
                      className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar(leftMonth, true)}
                </div>
              </div>

              {/* Right Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth("prev", false)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronLeft className="size-4 text-[#353a44]" />
                  </button>
                  <h3 className="text-sm font-semibold text-[#353a44]">
                    {rightMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => navigateMonth("next", false)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronRight className="size-4 text-[#353a44]" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div
                      key={day}
                      className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar(rightMonth, false)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-xs font-semibold text-[#353a44] bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={(e) => handleApply(e)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#533afd] rounded-lg hover:bg-[#4328e8] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
  );
};

export default DateRangePicker;

