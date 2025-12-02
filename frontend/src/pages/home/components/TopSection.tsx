import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../../utils";
import LineChart from "../../../components/ui/charts/homepage/LineChart";
import HeroSection from "./HeroSection";
import SingleDatePicker from "../../../components/ui/SingleDatePicker";
import type { AnalyticsData } from "../../../services/analytics.service";

interface TopSectionProps {
  topSelectedDate: Date;
  onDateChange: (date: Date) => void;
  topAnalytics: AnalyticsData | null;
  topLoading: boolean;
}

const metricOptions = [
  { value: "gross_volume", label: "Gross volume" },
  { value: "new_customers", label: "New customers" },
  { value: "successful_payments", label: "Successful payments" },
  { value: "net_volume", label: "Net volume" },
];

const TopSection = ({
  topSelectedDate,
  onDateChange,
  topAnalytics,
  topLoading,
}: TopSectionProps) => {
  const [selectedMetric, setSelectedMetric] = useState("gross_volume");
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [metricDropdownPosition, setMetricDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const metricButtonRef = useRef<HTMLButtonElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);
  const [compareDatePickerOpen, setCompareDatePickerOpen] = useState(false);
  const [compareDatePickerPosition, setCompareDatePickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const compareDateButtonRef = useRef<HTMLButtonElement>(null);
  const compareDatePickerRef = useRef<HTMLDivElement>(null);

  const formatSelectedDate = (date: Date): string => {
    // Use UTC dates for consistent comparison
    const today = new Date();
    const todayUTC = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setDate(yesterdayUTC.getDate() - 1);

    // Normalize input date to UTC for comparison
    const dateUTC = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    // Check if it's yesterday (UTC)
    if (dateUTC.getTime() === yesterdayUTC.getTime()) {
      return "Yesterday";
    }

    // Check if it's today (UTC)
    if (dateUTC.getTime() === todayUTC.getTime()) {
      return "Today";
    }

    // Otherwise show formatted date (using local methods for consistency)
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const getCurrentMetricValue = () => {
    if (!topAnalytics) return 0;
    switch (selectedMetric) {
      case "gross_volume":
        return topAnalytics.grossVolume.current;
      case "net_volume":
        return topAnalytics.netVolume.current;
      case "new_customers":
        return topAnalytics.newCustomers.current;
      case "successful_payments":
        return topAnalytics.successfulPayments.current;
      default:
        return 0;
    }
  };

  const getMetricTimeSeries = () => {
    if (!topAnalytics) return { current: [], previous: [] };
    switch (selectedMetric) {
      case "gross_volume":
        return topAnalytics.grossVolume.timeSeries;
      case "net_volume":
        return topAnalytics.netVolume.timeSeries;
      case "new_customers":
        return topAnalytics.newCustomers.timeSeries;
      case "successful_payments":
        return topAnalytics.successfulPayments.timeSeries;
      default:
        return { current: [], previous: [] };
    }
  };

  const formatMetricValue = (value: number) => {
    if (
      selectedMetric === "new_customers" ||
      selectedMetric === "successful_payments"
    ) {
      return value.toString();
    }
    return `US$${value.toFixed(2)}`;
  };

  const updateMetricDropdownPosition = () => {
    if (metricButtonRef.current) {
      const rect = metricButtonRef.current.getBoundingClientRect();
      setMetricDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const updateCompareDatePickerPosition = () => {
    if (compareDateButtonRef.current) {
      const rect = compareDateButtonRef.current.getBoundingClientRect();
      setCompareDatePickerPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        metricDropdownRef.current &&
        !metricDropdownRef.current.contains(event.target as Node) &&
        metricButtonRef.current &&
        !metricButtonRef.current.contains(event.target as Node)
      ) {
        setMetricDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (metricDropdownOpen) {
        updateMetricDropdownPosition();
      }
    };

    const handleResize = () => {
      if (metricDropdownOpen) {
        updateMetricDropdownPosition();
      }
    };

    const handleCompareDateScroll = () => {
      if (compareDatePickerOpen) {
        updateCompareDatePickerPosition();
      }
    };

    const handleCompareDateResize = () => {
      if (compareDatePickerOpen) {
        updateCompareDatePickerPosition();
      }
    };

    const handleCompareDateClickOutside = (event: MouseEvent) => {
      if (
        compareDatePickerRef.current &&
        !compareDatePickerRef.current.contains(event.target as Node) &&
        compareDateButtonRef.current &&
        !compareDateButtonRef.current.contains(event.target as Node)
      ) {
        setCompareDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleCompareDateClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("scroll", handleCompareDateScroll, true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleCompareDateResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleCompareDateClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleCompareDateScroll, true);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleCompareDateResize);
    };
  }, [metricDropdownOpen, compareDatePickerOpen]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold py-2 border-b border-[#e5e7eb]">
        {formatSelectedDate(topSelectedDate)}
      </h1>
      <div className="mt-6 w-full flex flex-col lg:flex-row gap-4 justify-between items-stretch">
        <div className="flex flex-col w-full">
          <div className="tabs flex gap-6 items-start">
            <div className="gross-volume-tab-switch flex flex-col shrink-0 relative">
              <button
                ref={metricButtonRef}
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                onClick={() => {
                  if (!metricDropdownOpen) {
                    updateMetricDropdownPosition();
                  }
                  setMetricDropdownOpen(!metricDropdownOpen);
                }}
              >
                <span className="text-sm font-normal">
                  {metricOptions.find((opt) => opt.value === selectedMetric)
                    ?.label || "Gross volume"}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                      "rotate-180": metricDropdownOpen,
                    }
                  )}
                />
              </button>
              <span className="text-xl font-normal text-[#353a44]">
                {formatMetricValue(getCurrentMetricValue())}
              </span>
              {metricDropdownOpen &&
                createPortal(
                  <div
                    ref={metricDropdownRef}
                    className="fixed bg-white border border-[#e5e7eb] rounded-md shadow-lg z-[10000] min-w-[180px]"
                    style={{
                      top: `${metricDropdownPosition.top}px`,
                      left: `${metricDropdownPosition.left}px`,
                    }}
                  >
                    {metricOptions.map((option) => (
                      <button
                        key={option.value}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8] transition-colors flex items-center justify-between",
                          {
                            "text-[#533afd] bg-[#f5f6f8]":
                              selectedMetric === option.value,
                            "text-[#353a44]": selectedMetric !== option.value,
                          }
                        )}
                        onClick={() => {
                          setSelectedMetric(option.value);
                          setMetricDropdownOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {selectedMetric === option.value && (
                          <span className="text-[#533afd]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
            </div>
            <div className="date-tab-switch flex flex-col shrink-0 relative">
              <button
                ref={compareDateButtonRef}
                className="flex items-center gap-1 rounded-md cursor-pointer text-gray-600"
                onClick={() => {
                  if (!compareDatePickerOpen) {
                    updateCompareDatePickerPosition();
                  }
                  setCompareDatePickerOpen(!compareDatePickerOpen);
                  setMetricDropdownOpen(false);
                }}
              >
                <span className="text-sm font-normal">
                  {formatSelectedDate(topSelectedDate)}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                      "rotate-180": compareDatePickerOpen,
                    }
                  )}
                />
              </button>
              {compareDatePickerOpen &&
                createPortal(
                  <div
                    ref={compareDatePickerRef}
                    className="fixed z-[10001]"
                    style={{
                      top: `${compareDatePickerPosition.top}px`,
                      left: `${compareDatePickerPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SingleDatePicker
                      isOpen={compareDatePickerOpen}
                      onClose={() => setCompareDatePickerOpen(false)}
                      onApply={(date) => {
                        onDateChange(date);
                        setCompareDatePickerOpen(false);
                      }}
                      currentDate={topSelectedDate}
                    />
                  </div>,
                  document.body
                )}
            </div>
          </div>
          <LineChart
            currentData={getMetricTimeSeries().current}
            previousData={getMetricTimeSeries().previous}
            currency={
              selectedMetric === "new_customers" ||
              selectedMetric === "successful_payments"
                ? ""
                : "US$"
            }
            showPrevious={false}
            startDate={topSelectedDate}
            endDate={topSelectedDate}
          />
        </div>
        <HeroSection data={topAnalytics} loading={topLoading} />
      </div>
    </div>
  );
};

export default TopSection;
