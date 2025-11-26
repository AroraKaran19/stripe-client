"use client";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Save, RotateCcw } from "lucide-react";
import { cn } from "../../utils";

interface TopSectionConfig {
  compareOption: "previous_period";
  metricOptions: string[];
  defaultMetric: string;
}

interface BottomSectionConfig {
  defaultFrequency: "daily" | "hourly";
  defaultCompareOption: "previous_period" | "year_over_year" | "none";
  defaultDateRange: "last_7_days" | "last_30_days" | "last_4_weeks" | "custom";
  visibleSections: string[];
  availableSections: string[];
}

const ManagePage = () => {
  // Top Section State
  const [topConfig, setTopConfig] = useState<TopSectionConfig>({
    compareOption: "previous_period",
    metricOptions: [
      "gross_volume",
      "net_volume",
      "new_customers",
      "successful_payments",
    ],
    defaultMetric: "gross_volume",
  });

  // Bottom Section State
  const [bottomConfig, setBottomConfig] = useState<BottomSectionConfig>({
    defaultFrequency: "daily",
    defaultCompareOption: "previous_period",
    defaultDateRange: "last_7_days",
    visibleSections: [
      "payments",
      "grossVolume",
      "netVolume",
      "failedPayments",
      "newCustomers",
      "topCustomers",
    ],
    availableSections: [
      "payments",
      "grossVolume",
      "netVolume",
      "failedPayments",
      "newCustomers",
      "topCustomers",
    ],
  });

  const [activeTab, setActiveTab] = useState<"top" | "bottom">("top");
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveTopConfig = () => {
    localStorage.setItem("topSectionConfig", JSON.stringify(topConfig));
    setSaveMessage("Top section configuration saved!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSaveBottomConfig = () => {
    localStorage.setItem("bottomSectionConfig", JSON.stringify(bottomConfig));
    setSaveMessage("Bottom section configuration saved!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleResetTopConfig = () => {
    setTopConfig({
      compareOption: "previous_period",
      metricOptions: [
        "gross_volume",
        "net_volume",
        "new_customers",
        "successful_payments",
      ],
      defaultMetric: "gross_volume",
    });
    localStorage.removeItem("topSectionConfig");
    setSaveMessage("Top section configuration reset!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleResetBottomConfig = () => {
    setBottomConfig({
      defaultFrequency: "daily",
      defaultCompareOption: "previous_period",
      defaultDateRange: "last_7_days",
      visibleSections: [
        "payments",
        "grossVolume",
        "netVolume",
        "failedPayments",
        "newCustomers",
        "topCustomers",
      ],
      availableSections: [
        "payments",
        "grossVolume",
        "netVolume",
        "failedPayments",
        "newCustomers",
        "topCustomers",
      ],
    });
    localStorage.removeItem("bottomSectionConfig");
    setSaveMessage("Bottom section configuration reset!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const toggleBottomSection = (section: string) => {
    setBottomConfig((prev) => ({
      ...prev,
      visibleSections: prev.visibleSections.includes(section)
        ? prev.visibleSections.filter((s) => s !== section)
        : [...prev.visibleSections, section],
    }));
  };

  return (
    <>
      <Helmet>
        <title>Manage Home Page | Stripe Dashboard</title>
        <meta
          name="description"
          content="Manage top and bottom section configurations for the home page"
        />
      </Helmet>

      <div className="w-full min-h-screen bg-[#f5f6f8] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#353a44] mb-2">
              Manage Home Page
            </h1>
            <p className="text-gray-600">
              Configure top and bottom section settings independently
            </p>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{saveMessage}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-[#e5e7eb]">
            <button
              onClick={() => setActiveTab("top")}
              className={cn(
                "px-6 py-3 font-semibold text-sm transition-colors",
                activeTab === "top"
                  ? "text-[#533afd] border-b-2 border-[#533afd]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Top Section (Today)
            </button>
            <button
              onClick={() => setActiveTab("bottom")}
              className={cn(
                "px-6 py-3 font-semibold text-sm transition-colors",
                activeTab === "bottom"
                  ? "text-[#533afd] border-b-2 border-[#533afd]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Bottom Section (Overview)
            </button>
          </div>

          {/* Top Section Configuration */}
          {activeTab === "top" && (
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#353a44] mb-6">
                  Top Section Configuration
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure settings for the top section (today's metrics with
                  hourly breakdown)
                </p>
              </div>

              {/* Default Metric */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Default Metric
                </label>
                <select
                  value={topConfig.defaultMetric}
                  onChange={(e) =>
                    setTopConfig((prev) => ({
                      ...prev,
                      defaultMetric: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                >
                  <option value="gross_volume">Gross Volume</option>
                  <option value="net_volume">Net Volume</option>
                  <option value="new_customers">New Customers</option>
                  <option value="successful_payments">
                    Successful Payments
                  </option>
                </select>
                <p className="text-xs text-gray-500">
                  The metric displayed by default when the page loads
                </p>
              </div>

              {/* Available Metrics */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Available Metrics
                </label>
                <div className="space-y-2">
                  {topConfig.metricOptions.map((metric) => (
                    <label
                      key={metric}
                      className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-lg hover:bg-[#f5f6f8] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-[#353a44]">
                        {metric === "gross_volume" && "Gross Volume"}
                        {metric === "net_volume" && "Net Volume"}
                        {metric === "new_customers" && "New Customers"}
                        {metric === "successful_payments" &&
                          "Successful Payments"}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  All metrics are always available in the dropdown selector
                </p>
              </div>

              {/* Comparison Setting */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Comparison Option
                </label>
                <div className="p-4 bg-[#f5f6f8] rounded-lg border border-[#e5e7eb]">
                  <p className="text-sm text-[#353a44] font-medium">
                    Previous Period
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Top section always compares with the previous day
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={handleSaveTopConfig}
                  className="flex items-center gap-2 px-6 py-2 bg-[#533afd] text-white rounded-lg hover:bg-[#4329d6] transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
                <button
                  onClick={handleResetTopConfig}
                  className="flex items-center gap-2 px-6 py-2 border border-[#e5e7eb] text-gray-700 rounded-lg hover:bg-[#f5f6f8] transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          )}

          {/* Bottom Section Configuration */}
          {activeTab === "bottom" && (
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#353a44] mb-6">
                  Bottom Section Configuration
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure settings for the bottom section (overview metrics
                  with customizable cards)
                </p>
              </div>

              {/* Default Frequency */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Default Frequency
                </label>
                <select
                  value={bottomConfig.defaultFrequency}
                  onChange={(e) =>
                    setBottomConfig((prev) => ({
                      ...prev,
                      defaultFrequency: e.target.value as "daily" | "hourly",
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                >
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
                <p className="text-xs text-gray-500">
                  The frequency used for data aggregation by default
                </p>
              </div>

              {/* Default Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Default Date Range
                </label>
                <select
                  value={bottomConfig.defaultDateRange}
                  onChange={(e) =>
                    setBottomConfig((prev) => ({
                      ...prev,
                      defaultDateRange: e.target.value as
                        | "last_7_days"
                        | "last_30_days"
                        | "last_4_weeks"
                        | "custom",
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                >
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_4_weeks">Last 4 Weeks</option>
                  <option value="custom">Custom Range</option>
                </select>
                <p className="text-xs text-gray-500">
                  The default date range when the page loads
                </p>
              </div>

              {/* Default Comparison Option */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Default Comparison Option
                </label>
                <select
                  value={bottomConfig.defaultCompareOption}
                  onChange={(e) =>
                    setBottomConfig((prev) => ({
                      ...prev,
                      defaultCompareOption: e.target.value as
                        | "previous_period"
                        | "year_over_year"
                        | "none",
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#533afd]"
                >
                  <option value="previous_period">Previous Period</option>
                  <option value="year_over_year">Year over Year</option>
                  <option value="none">No Comparison</option>
                </select>
                <p className="text-xs text-gray-500">
                  The default comparison option for metrics
                </p>
              </div>

              {/* Visible Sections */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#353a44]">
                  Visible Sections
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Toggle which card sections are visible by default
                </p>
                <div className="space-y-2">
                  {bottomConfig.availableSections.map((section) => (
                    <label
                      key={section}
                      className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-lg hover:bg-[#f5f6f8] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={bottomConfig.visibleSections.includes(
                          section
                        )}
                        onChange={() => toggleBottomSection(section)}
                        className="w-4 h-4 rounded border-[#e5e7eb] text-[#533afd] focus:ring-[#533afd]"
                      />
                      <span className="text-sm text-[#353a44] font-medium">
                        {section === "payments" && "Payments"}
                        {section === "grossVolume" && "Gross Volume"}
                        {section === "netVolume" && "Net Volume"}
                        {section === "failedPayments" && "Failed Payments"}
                        {section === "newCustomers" && "New Customers"}
                        {section === "topCustomers" && "Top Customers"}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {bottomConfig.visibleSections.length} of{" "}
                  {bottomConfig.availableSections.length} sections visible
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={handleSaveBottomConfig}
                  className="flex items-center gap-2 px-6 py-2 bg-[#533afd] text-white rounded-lg hover:bg-[#4329d6] transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
                <button
                  onClick={handleResetBottomConfig}
                  className="flex items-center gap-2 px-6 py-2 border border-[#e5e7eb] text-gray-700 rounded-lg hover:bg-[#f5f6f8] transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagePage;
