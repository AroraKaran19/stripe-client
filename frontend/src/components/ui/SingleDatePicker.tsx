import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../utils";

interface SingleDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (date: Date) => void;
  currentDate?: Date;
}

const SingleDatePicker = ({
  isOpen,
  onClose,
  onApply,
  currentDate,
}: SingleDatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    currentDate || new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const [displayMonth, setDisplayMonth] = useState<Date>(
    new Date() // Always start with current month
  );

  useEffect(() => {
    if (currentDate) {
      setSelectedDate(currentDate);
      // Always show current month, but navigate to the selected date's month if needed
      const now = new Date();
      const selectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Only change display month if it's not the current month
      if (selectedMonth.getTime() !== currentMonth.getTime()) {
        setDisplayMonth(selectedMonth);
      } else {
        setDisplayMonth(now);
      }
    } else {
      // Reset to current month when opened
      setDisplayMonth(new Date());
    }
  }, [currentDate, isOpen]);

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    const dateStr = date.toDateString();
    return dateStr === selectedDate.toDateString();
  };

  const renderCalendar = (monthDate: Date) => {
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
      const isToday = date.toDateString() === new Date().toDateString();
      const isFuture = date.getTime() > today.getTime();

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isFuture) handleDateClick(date);
          }}
          disabled={isFuture}
          className={cn(
            "w-8 h-8 text-xs font-medium rounded-md transition-colors",
            {
              "bg-[#533afd] text-white": isSelected,
              "text-[#353a44] hover:bg-gray-100": !isSelected && !isFuture,
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

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(displayMonth);
    const delta = direction === "next" ? 1 : -1;
    newMonth.setMonth(newMonth.getMonth() + delta);
    // Prevent navigating to months after the current month
    const now = new Date();
    const candidate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (candidate.getTime() > currentMonth.getTime()) {
      setDisplayMonth(currentMonth);
    } else {
      setDisplayMonth(newMonth);
    }
  };

  const handleApply = () => {
    onApply(selectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-2xl w-[280px] overflow-hidden border border-[#e5e7eb]">
      {/* Header with Date Input */}
      <div className="p-4 border-b border-[#e5e7eb]">
        <label className="block text-xs font-semibold text-[#353a44] mb-2">
          Selected Date
        </label>
        <input
          type="text"
          value={formatDateInput(selectedDate)}
          onChange={(e) => {
            const parsed = parseDateInput(e.target.value);
            if (parsed) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              // Clamp to today if future
              const safe = parsed.getTime() > today.getTime() ? today : parsed;
              setSelectedDate(safe);
              setDisplayMonth(safe);
            }
          }}
          className="w-full px-2 py-1.5 text-xs border border-[#533afd] rounded-md focus:outline-none focus:ring-1 focus:ring-[#533afd]"
          placeholder="DD / MM / YYYY"
        />
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="size-3" />
          </button>
          <h3 className="text-xs font-semibold text-[#353a44]">
            {displayMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
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
          {renderCalendar(displayMonth)}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              const today = new Date();
              setSelectedDate(today);
              setDisplayMonth(today);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-[#533afd] bg-[#533afd]/10 rounded-md hover:bg-[#533afd]/20 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#533afd] rounded-md hover:bg-[#4328e8] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleDatePicker;

