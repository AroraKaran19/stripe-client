"use client";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SecondSectionHeader from "./components/SecondSectionHeader";
import TopSection from "./components/TopSection";
import OverviewSection from "./components/OverviewSection";
import AddSectionModal from "./components/AddSectionModal";
import { useUsernameFromRoute } from "../../hooks/useUsernameFromRoute";
import { useBusiness } from "../../context/BusinessContext";
import { useTopSectionAnalytics } from "./hooks/useTopSectionAnalytics";
import { useOverviewAnalytics } from "./hooks/useOverviewAnalytics";
import { useSectionManagement } from "./hooks/useSectionManagement";
import { useAvailableFrequencies } from "./hooks/useAvailableFrequencies";

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const Homepage = () => {
  const location = useLocation();
  const username = useUsernameFromRoute(); // Get username from route
  const { businessName } = useBusiness();
  const pageTitle = `Home | ${businessName} - Stripe`;
  const pageDescription = `Dashboard for ${businessName} - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics.`;

  // Top chart: selected single day (hourly)
  const [topSelectedDate, setTopSelectedDate] = useState<Date>(new Date());

  // Overview section analytics state (decoupled from top chart)
  const [overviewDateRange, setOverviewDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // Last 7 days
    return {
      start,
      end,
      label: "Last 7 days",
    };
  });
  const [overviewFrequency, setOverviewFrequency] = useState("daily");
  const [overviewCompareOption, setOverviewCompareOption] = useState<
    string | null
  >(null);

  // Use custom hooks for data fetching and management
  const { topAnalytics, topLoading } = useTopSectionAnalytics(
    topSelectedDate,
    username
  );

  const { availableFrequencies } = useAvailableFrequencies(
    overviewDateRange,
    overviewFrequency
  );

  const { overviewAnalytics, overviewLoading, overviewError } =
    useOverviewAnalytics(
      overviewDateRange,
      overviewFrequency,
      overviewCompareOption,
      username
    );

  const {
    sections,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditMode,
    setIsEditMode,
    draggedSection,
    dragOverSection,
    handleAddSection,
    handleRemoveSection,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useSectionManagement();

  // Auto-set frequency if current selection is not available
  useEffect(() => {
    const daysDiff = Math.ceil(
      (overviewDateRange.end.getTime() - overviewDateRange.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let defaultFreq = "daily";

    if (daysDiff === 0) {
      defaultFreq = "hourly";
    } else if (daysDiff < 7) {
      defaultFreq = "daily";
    } else if (daysDiff >= 28 && daysDiff < 90) {
      defaultFreq = "daily";
    } else if (daysDiff >= 90 && daysDiff < 365) {
      defaultFreq = "weekly";
    } else if (daysDiff >= 365 && daysDiff < 1095) {
      defaultFreq = "monthly";
    } else if (daysDiff >= 1095) {
      defaultFreq = "monthly";
    } else {
      defaultFreq = "daily";
    }

    if (!availableFrequencies.includes(overviewFrequency)) {
      setOverviewFrequency(defaultFreq);
    }
  }, [overviewDateRange, overviewFrequency, availableFrequencies]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={pageDescription}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={pageTitle}
        />
        <meta
          property="og:description"
          content={pageDescription}
        />
        <meta
          property="og:url"
          content={`${window.location.origin}${location.pathname}`}
        />
        <meta property="og:site_name" content={businessName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={pageTitle}
        />
        <meta
          name="twitter:description"
          content={pageDescription}
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="stripe dashboard, payment analytics, financial dashboard, transaction analytics, payment management"
        />
        <meta name="author" content={businessName} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full">
        <TopSection
          topSelectedDate={topSelectedDate}
          onDateChange={setTopSelectedDate}
          topAnalytics={topAnalytics}
          topLoading={topLoading}
        />
      <SecondSectionHeader
        dateRange="" // not used in simplified version
        frequency={overviewFrequency}
        compareOption={overviewCompareOption}
        dateRangeObj={overviewDateRange}
        availableFrequencies={availableFrequencies}
        onDateRangeChange={(range) => {
          setOverviewDateRange(range);
        }}
        onFrequencyChange={setOverviewFrequency}
        onCompareChange={setOverviewCompareOption}
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
        <OverviewSection
          overviewAnalytics={overviewAnalytics}
          overviewLoading={overviewLoading}
          overviewError={overviewError}
          sections={sections}
          isEditMode={isEditMode}
          draggedSection={draggedSection}
          dragOverSection={dragOverSection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onRemoveSection={handleRemoveSection}
        />
    </div>
    </>
  );
};

export default Homepage;
