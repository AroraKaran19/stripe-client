"use client";
import { ChevronDownIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import { cn } from "../../utils";
import LineChart from "../../components/ui/charts/homepage/LineChart";
import HeroSection from "./components/HeroSection";
import SecondSectionHeader from "./components/SecondSectionHeader";
import SingleDatePicker from "../../components/ui/SingleDatePicker";
import GrossVolumeCard from "./components/GrossVolumeCard";
import NetVolumeCard from "./components/NetVolumeCard";
import PaymentsCard from "./components/PaymentsCard";
import FailedPaymentsCard from "./components/FailedPaymentsCard";
import NewCustomersCard from "./components/NewCustomersCard";
import TopCustomersCard from "./components/TopCustomersCard";
import AddSectionModal, { type SectionType } from "./components/AddSectionModal";
import { analyticsService, type AnalyticsData } from "../../services/analytics.service";
import { X } from "lucide-react";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const Homepage = () => {
  const location = useLocation();
  const [selectedMetric, setSelectedMetric] = useState("gross_volume");
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [metricDropdownPosition, setMetricDropdownPosition] = useState({ top: 0, left: 0 });
  const metricButtonRef = useRef<HTMLButtonElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCompareDate, setSelectedCompareDate] = useState<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const [compareDatePickerOpen, setCompareDatePickerOpen] = useState(false);
  const [compareDatePickerPosition, setCompareDatePickerPosition] = useState({ top: 0, left: 0 });
  const compareDateButtonRef = useRef<HTMLButtonElement>(null);
  const compareDatePickerRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState("last_7_days");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [frequency, setFrequency] = useState("daily");
  const [compareOption, setCompareOption] = useState("previous_period");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionType[]>([
    "payments",
    "grossVolume",
    "netVolume",
    "failedPayments",
    "newCustomers",
    "topCustomers",
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedSection, setDraggedSection] = useState<SectionType | null>(null);
  const [dragOverSection, setDragOverSection] = useState<SectionType | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await analyticsService.getAnalytics(
          dateRange,
          frequency,
          customDateRange?.start,
          customDateRange?.end,
          compareOption
        );
        setAnalytics(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, frequency, customDateRange, compareOption]);

  const metricOptions = [
    { value: "gross_volume", label: "Gross volume" },
    { value: "new_customers", label: "New customers" },
    { value: "successful_payments", label: "Successful payments" },
    { value: "net_volume", label: "Net volume" },
  ];

  const getCurrentMetricValue = () => {
    if (!analytics) return 0;
    switch (selectedMetric) {
      case "gross_volume":
        return analytics.grossVolume.current;
      case "net_volume":
        return analytics.netVolume.current;
      case "new_customers":
        return analytics.newCustomers.current;
      case "successful_payments":
        return analytics.payments.filter(p => p.status === "succeeded").length;
      default:
        return 0;
    }
  };

  const getPreviousMetricValue = () => {
    if (!analytics) return 0;
    switch (selectedMetric) {
      case "gross_volume":
        return analytics.grossVolume.previous;
      case "net_volume":
        return analytics.netVolume.previous;
      case "new_customers":
        return analytics.newCustomers.previous;
      case "successful_payments":
        // For successful payments, we'd need previous period payments data
        // For now, return 0 or calculate from failed payments if available
        return 0;
      default:
        return 0;
    }
  };

  const getMetricTimeSeries = () => {
    if (!analytics) return { current: [], previous: [] };
    switch (selectedMetric) {
      case "gross_volume":
        return analytics.grossVolume.timeSeries;
      case "net_volume":
        return analytics.netVolume.timeSeries;
      case "new_customers":
        return analytics.newCustomers.timeSeries;
      case "successful_payments":
        // For successful payments, we'd need to generate time series from payments
        // For now, return empty or use gross volume as placeholder
        return analytics.grossVolume.timeSeries;
      default:
        return { current: [], previous: [] };
    }
  };

  const formatMetricValue = (value: number) => {
    if (selectedMetric === "new_customers" || selectedMetric === "successful_payments") {
      return value.toString();
    }
    return `US$${value.toFixed(2)}`;
  };

  const formatCompareDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    // Otherwise show formatted date
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
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

  const handleAddSection = (sectionId: SectionType) => {
    if (!sections.includes(sectionId)) {
      setSections([...sections, sectionId]);
    }
  };

  const handleRemoveSection = (sectionId: SectionType) => {
    setSections(sections.filter((id) => id !== sectionId));
  };

  const handleDragStart = (sectionId: SectionType) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      e.dataTransfer.dropEffect = "move";
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragEnter = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const draggedIndex = sections.indexOf(draggedSection);
    const targetIndex = sections.indexOf(targetSectionId);
    const newSections = [...sections];
    newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const renderSection = (sectionId: SectionType, index: number) => {
    if (!analytics) return null;

    const sectionProps = {
      draggable: isEditMode,
      onDragStart: (e: React.DragEvent) => {
        if (isEditMode) {
          handleDragStart(sectionId);
          e.dataTransfer.effectAllowed = "move";
        }
      },
      onDragOver: (e: React.DragEvent) => handleDragOver(e, sectionId),
      onDragEnter: (e: React.DragEvent) => handleDragEnter(e, sectionId),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, sectionId),
      onDragEnd: handleDragEnd,
      className: cn(
        "relative transition-all h-full",
        isEditMode && "cursor-move",
        draggedSection === sectionId && "opacity-50 scale-95",
        dragOverSection === sectionId && draggedSection !== sectionId && "ring-2 ring-[#533afd]"
      ),
    };

    switch (sectionId) {
      case "payments":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <PaymentsCard payments={analytics.payments} />
          </div>
        );
      case "grossVolume":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <GrossVolumeCard
              data={analytics.grossVolume}
              updatedAt={analytics.updatedAt}
            />
          </div>
        );
      case "netVolume":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NetVolumeCard
              data={analytics.netVolume}
              updatedAt={analytics.updatedAt}
            />
          </div>
        );
      case "failedPayments":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <FailedPaymentsCard failedPayments={analytics.failedPayments} />
          </div>
        );
      case "newCustomers":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NewCustomersCard
              data={analytics.newCustomers}
              updatedAt={analytics.updatedAt}
            />
          </div>
        );
      case "topCustomers":
        return (
          <div key={`${sectionId}-${index}`} {...sectionProps}>
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <TopCustomersCard topCustomers={analytics.topCustomersBySpend} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Home | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          property="og:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          name="twitter:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="stripe dashboard, payment analytics, financial dashboard, transaction analytics, payment management"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full">
      <div className="w-full">
      <h1 className="text-3xl font-bold py-2 border-b border-[#e5e7eb]">
        Today
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
                    {metricOptions.find(opt => opt.value === selectedMetric)?.label || "Gross volume"}
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
                              "text-[#533afd] bg-[#f5f6f8]": selectedMetric === option.value,
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
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                  onClick={() => {
                    if (!compareDatePickerOpen) {
                      updateCompareDatePickerPosition();
                    }
                    setCompareDatePickerOpen(!compareDatePickerOpen);
                    setMetricDropdownOpen(false);
                  }}
              >
                <span className="text-sm font-normal">
                    {formatCompareDate(selectedCompareDate)}
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
                <span className="text-xl font-normal text-[#353a44]">
                  {formatMetricValue(getPreviousMetricValue())}
              </span>
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
                          setSelectedCompareDate(date);
                          setCompareDatePickerOpen(false);
                          // TODO: Fetch analytics for the selected compare date
                        }}
                        currentDate={selectedCompareDate}
                      />
                    </div>,
                    document.body
                  )}
            </div>
          </div>
            <LineChart 
              currentData={getMetricTimeSeries().current}
              previousData={getMetricTimeSeries().previous}
              currency={selectedMetric === "new_customers" || selectedMetric === "successful_payments" ? "" : "US$"}
            />
        </div>
        <HeroSection />
      </div>
      </div>
      <SecondSectionHeader
        dateRange={dateRange}
        frequency={frequency}
        compareOption={compareOption}
        customDateRange={customDateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setCustomDateRange(undefined); // Clear custom range when predefined is selected
        }}
        onCustomDateRangeChange={(range) => {
          setCustomDateRange(range);
          setDateRange("custom"); // Set to custom to indicate custom range
        }}
        onFrequencyChange={setFrequency}
        onCompareChange={setCompareOption}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={() => setIsEditMode(!isEditMode)}
        isEditMode={isEditMode}
      />
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSection}
        existingSections={sections}
      />
      {loading ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-gray-500">Loading analytics...</div>
              </div>
      ) : error ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-red-500">Error: {error}</div>
          </div>
      ) : analytics ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-2 bg-[#f5f6f8] rounded-md p-2 mt-2 mb-16 relative z-0" style={{ gridAutoRows: "380px", alignContent: "start" }}>
          {sections.map((sectionId, index) => renderSection(sectionId, index))}
      </div>
      ) : null}
    </div>
    </>
  );
};

export default Homepage;
