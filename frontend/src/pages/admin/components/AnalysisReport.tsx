import React, { useState, useRef } from "react";
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, CreditCard, XCircle, Percent, BarChart } from "lucide-react";
import { jsPDF } from "jspdf";

interface MetricValue {
  metric: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percentage";
  source: "calculated" | "manual";
}

interface AnalysisReportProps {
  metrics: MetricValue[];
  dateRange: { start: Date; end: Date; label?: string };
  entryMethod: "daily" | "hourly";
  selectedHour: number | null;
}

const AnalysisReport = ({ metrics, dateRange, entryMethod, selectedHour }: AnalysisReportProps) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatValue = (value: number, format: string): string => {
    if (!isFinite(value)) return "0";

    switch (format) {
      case "currency":
        return `$${value.toFixed(2)}`;
      case "percentage":
        return `${value.toFixed(2)}%`;
      case "number":
      default:
        return Math.round(value).toString();
    }
  };

  const formatDateRange = (range: { start: Date; end: Date; label?: string }): string => {
    if (range.label) return range.label;
    const start = range.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const end = range.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "gross_volume":
      case "net_volume":
      case "average_order_value":
        return <DollarSign className="size-5" />;
      case "new_customers":
        return <Users className="size-5" />;
      case "successful_payments":
        return <CreditCard className="size-5" />;
      case "failed_payments":
        return <XCircle className="size-5" />;
      case "conversion_rate":
        return <Percent className="size-5" />;
      default:
        return <BarChart className="size-5" />;
    }
  };

  const generatePDF = () => {
    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 7;
      const sectionSpacing = 12;
      const cardSpacing = 8;

      // Helper function to add a new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 25) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Header Section with top border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin - 5, pageWidth - margin, margin - 5);
      
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Analytics Report", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont("helvetica", "normal");
      pdf.text("Visualize & Build ltd.", margin, yPosition);
      yPosition += 8;

      // Metadata Section in a bordered box
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition, contentWidth, 20, "FD");
      
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Period: ${formatDateRange(dateRange)}`, margin + 3, yPosition + 7);
      pdf.text(`Method: ${entryMethod === "hourly" ? `Hourly${selectedHour !== null ? ` (${selectedHour.toString().padStart(2, "0")}:00)` : ""}` : "Daily Totals"}`, margin + 3, yPosition + 12);
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin + 3, yPosition + 17);
      
      yPosition += 25;

      // Executive Summary Section
      checkNewPage(50);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Executive Summary", margin, yPosition);
      
      // Underline for section title
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      const titleWidth = pdf.getTextWidth("Executive Summary");
      pdf.line(margin, yPosition + 2, margin + titleWidth, yPosition + 2);
      yPosition += 10;

      const summaryMetrics = [
        { label: "Gross Volume", value: formatValue(metrics.find((m) => m.metric === "gross_volume")?.value || 0, "currency") },
        { label: "Successful Payments", value: formatValue(metrics.find((m) => m.metric === "successful_payments")?.value || 0, "number") },
        { label: "New Customers", value: formatValue(metrics.find((m) => m.metric === "new_customers")?.value || 0, "number") },
        { label: "Conversion Rate", value: formatValue(metrics.find((m) => m.metric === "conversion_rate")?.value || 0, "percentage") },
      ];

      // Create summary boxes in 2x2 grid
      const boxWidth = (contentWidth - cardSpacing) / 2;
      const boxHeight = 25;

      summaryMetrics.forEach((metric, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const xPos = margin + col * (boxWidth + cardSpacing);
        const yPos = yPosition + row * (boxHeight + cardSpacing);

        checkNewPage(boxHeight + 10);

        // Draw box with border
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(xPos, yPos, boxWidth, boxHeight, "FD");

        // Label
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        pdf.text(metric.label + ":", xPos + 3, yPos + 8);

        // Value
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text(metric.value, xPos + 3, yPos + 18);
      });

      yPosition += Math.ceil(summaryMetrics.length / 2) * (boxHeight + cardSpacing) + sectionSpacing;

      // Detailed Metrics Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Detailed Metrics", margin, yPosition);
      
      // Underline for section title
      const detailedTitleWidth = pdf.getTextWidth("Detailed Metrics");
      pdf.line(margin, yPosition + 2, margin + detailedTitleWidth, yPosition + 2);
      yPosition += 10;

      // Table Header
      pdf.setFillColor(245, 245, 245);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, yPosition, contentWidth, 10, "FD");
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Metric", margin + 3, yPosition + 7);
      pdf.text("Value", margin + contentWidth / 2, yPosition + 7);
      pdf.text("Source", margin + contentWidth * 0.8, yPosition + 7);
      
      yPosition += 12;

      // Table Rows
      metrics.forEach((metric, index) => {
        checkNewPage(12);
        
        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(250, 250, 250);
        }
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, yPosition, contentWidth, 12, "FD");
        
        // Metric label
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        const labelLines = pdf.splitTextToSize(metric.label, contentWidth / 2 - 5);
        pdf.text(labelLines, margin + 3, yPosition + 8);

        // Metric value
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(40, 40, 40);
        pdf.text(formatValue(metric.value, metric.format), margin + contentWidth / 2, yPosition + 8);

        // Source badge
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        const sourceText = metric.source === "manual" ? "Manual" : "Calculated";
        pdf.text(`[${sourceText}]`, margin + contentWidth * 0.8, yPosition + 8);

        yPosition += 14;
      });

      // Performance Insights Section
      checkNewPage(50);
      yPosition += 5;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Performance Insights", margin, yPosition);
      
      // Underline for section title
      const insightsTitleWidth = pdf.getTextWidth("Performance Insights");
      pdf.line(margin, yPosition + 2, margin + insightsTitleWidth, yPosition + 2);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);

      const insights = [
        `• Gross Volume of ${formatValue(metrics.find((m) => m.metric === "gross_volume")?.value || 0, "currency")} was generated during this period.`,
        `• Payment Success Rate: ${formatValue(metrics.find((m) => m.metric === "conversion_rate")?.value || 0, "percentage")} of all transactions were successful.`,
        `• Customer Acquisition: ${formatValue(metrics.find((m) => m.metric === "new_customers")?.value || 0, "number")} new customers were acquired during this period.`,
      ];

      const avgOrderValue = metrics.find((m) => m.metric === "average_order_value")?.value;
      if (avgOrderValue) {
        insights.push(`• Average Order Value: ${formatValue(avgOrderValue, "currency")} per successful transaction.`);
      }

      insights.forEach((insight) => {
        checkNewPage(12);
        const lines = pdf.splitTextToSize(insight, contentWidth - 5);
        pdf.text(lines, margin + 3, yPosition);
        yPosition += lines.length * lineHeight + 4;
      });

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont("helvetica", "normal");
        
        // Footer text
        const footerText = "This report was generated automatically by Visualize & Build ltd. Analytics Dashboard.";
        pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: "center", maxWidth: contentWidth });
        
        // Page number
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: "right" });
      }

      const fileName = `Analytics_Report_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to generate PDF: ${errorMessage}. Please check the console for details.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#533afd]/10 rounded-md">
            <FileText className="size-6 text-[#533afd]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis Report</h3>
            <p className="text-sm text-gray-500">Comprehensive analytics summary</p>
          </div>
        </div>
        <button
          onClick={generatePDF}
          disabled={generatingPDF}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#533afd] rounded-md hover:bg-[#4330d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {generatingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="size-4" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Report Content */}
      <div 
        ref={reportRef} 
        data-report-content
        className="bg-white p-6 space-y-6" 
        style={{ minHeight: "800px" }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Report</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>Period: {formatDateRange(dateRange)}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              <span>Method: {entryMethod === "hourly" ? `Hourly${selectedHour !== null ? ` (${selectedHour.toString().padStart(2, "0")}:00)` : ""}` : "Daily Totals"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Generated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Gross Volume</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatValue(metrics.find((m) => m.metric === "gross_volume")?.value || 0, "currency")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Successful Payments</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatValue(metrics.find((m) => m.metric === "successful_payments")?.value || 0, "number")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New Customers</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatValue(metrics.find((m) => m.metric === "new_customers")?.value || 0, "number")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatValue(metrics.find((m) => m.metric === "conversion_rate")?.value || 0, "percentage")}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.metric}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-gray-100 rounded-md text-gray-600 mt-1">
                    {getMetricIcon(metric.metric)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{metric.label}</h3>
                    <p className="text-2xl font-normal text-gray-900 mb-2">
                      {formatValue(metric.value, metric.format)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        metric.source === "manual"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {metric.source === "manual" ? "Manual Entry" : "Calculated"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Performance Insights</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <TrendingUp className="size-4 text-[#533afd] mt-0.5" />
              <p>
                <span className="font-semibold text-gray-900">Gross Volume:</span>{" "}
                {formatValue(metrics.find((m) => m.metric === "gross_volume")?.value || 0, "currency")} was generated during this period.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="size-4 text-[#533afd] mt-0.5" />
              <p>
                <span className="font-semibold text-gray-900">Payment Success Rate:</span>{" "}
                {formatValue(metrics.find((m) => m.metric === "conversion_rate")?.value || 0, "percentage")} of all transactions were successful.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="size-4 text-[#533afd] mt-0.5" />
              <p>
                <span className="font-semibold text-gray-900">Customer Acquisition:</span>{" "}
                {formatValue(metrics.find((m) => m.metric === "new_customers")?.value || 0, "number")} new customers were acquired during this period.
              </p>
            </div>
            {metrics.find((m) => m.metric === "average_order_value")?.value ? (
              <div className="flex items-start gap-2">
                <DollarSign className="size-4 text-[#533afd] mt-0.5" />
                <p>
                  <span className="font-semibold text-gray-900">Average Order Value:</span>{" "}
                  {formatValue(metrics.find((m) => m.metric === "average_order_value")?.value || 0, "currency")} per successful transaction.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-500 text-center">
            This report was generated automatically by Visualize & Build ltd. Analytics Dashboard.
            <br />
            For questions or support, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;

