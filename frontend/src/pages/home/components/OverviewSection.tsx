import { X } from "lucide-react";
import { cn } from "../../../utils";
import GrossVolumeCard from "./GrossVolumeCard";
import NetVolumeCard from "./NetVolumeCard";
import PaymentsCard from "./PaymentsCard";
import FailedPaymentsCard from "./FailedPaymentsCard";
import NewCustomersCard from "./NewCustomersCard";
import TopCustomersCard from "./TopCustomersCard";
import type { AnalyticsData } from "../../../services/analytics.service";
import type { SectionType } from "./AddSectionModal";

interface OverviewSectionProps {
  overviewAnalytics: AnalyticsData | null;
  overviewLoading: boolean;
  overviewError: string | null;
  sections: SectionType[];
  isEditMode: boolean;
  draggedSection: SectionType | null;
  dragOverSection: SectionType | null;
  onDragStart: (sectionId: SectionType) => void;
  onDragOver: (e: React.DragEvent, targetSectionId: SectionType) => void;
  onDragEnter: (e: React.DragEvent, targetSectionId: SectionType) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetSectionId: SectionType) => void;
  onDragEnd: () => void;
  onRemoveSection: (sectionId: SectionType) => void;
}

const OverviewSection = ({
  overviewAnalytics,
  overviewLoading,
  overviewError,
  sections,
  isEditMode,
  draggedSection,
  dragOverSection,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRemoveSection,
}: OverviewSectionProps) => {
  const renderSection = (sectionId: SectionType, index: number) => {
    if (!overviewAnalytics) return null;

    const sectionProps = {
      draggable: isEditMode,
      onDragStart: (e: React.DragEvent) => {
        if (isEditMode) {
          onDragStart(sectionId);
          e.dataTransfer.effectAllowed = "move";
        }
      },
      onDragOver: (e: React.DragEvent) => onDragOver(e, sectionId),
      onDragEnter: (e: React.DragEvent) => onDragEnter(e, sectionId),
      onDragLeave: onDragLeave,
      onDrop: (e: React.DragEvent) => onDrop(e, sectionId),
      onDragEnd: onDragEnd,
      className: cn(
        "relative transition-all h-full",
        isEditMode && "cursor-move",
        draggedSection === sectionId && "opacity-50 scale-95",
        dragOverSection === sectionId &&
          draggedSection !== sectionId &&
          "ring-2 ring-[#533afd]"
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <PaymentsCard payments={overviewAnalytics.payments} />
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <GrossVolumeCard
              data={overviewAnalytics.grossVolume}
              updatedAt={overviewAnalytics.updatedAt}
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NetVolumeCard
              data={overviewAnalytics.netVolume}
              updatedAt={overviewAnalytics.updatedAt}
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <FailedPaymentsCard
              failedPayments={overviewAnalytics.failedPayments}
            />
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <NewCustomersCard
              data={overviewAnalytics.newCustomers}
              updatedAt={overviewAnalytics.updatedAt}
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
                    onRemoveSection(sectionId);
                  }}
                  className="p-1.5 bg-white border border-[#e5e7eb] rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <X className="size-3 text-gray-600" />
                </button>
              </div>
            )}
            <TopCustomersCard
              topCustomers={overviewAnalytics.topCustomersBySpend}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (overviewLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-red-500">Error: {overviewError}</div>
      </div>
    );
  }

  if (!overviewAnalytics) {
    return null;
  }

  return (
    <div
      className="w-full grid grid-cols-1 lg:grid-cols-3 gap-2 bg-[#f5f6f8] rounded-md p-2 mt-2 mb-16 relative z-0"
      style={{ gridAutoRows: "380px", alignContent: "start" }}
    >
      {sections.map((sectionId, index) => renderSection(sectionId, index))}
    </div>
  );
};

export default OverviewSection;
