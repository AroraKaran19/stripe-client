import { X } from "lucide-react";
import { cn } from "../../../utils";

export type SectionType =
  | "payments"
  | "grossVolume"
  | "netVolume"
  | "failedPayments"
  | "newCustomers"
  | "topCustomers";

export interface SectionTemplate {
  id: SectionType;
  name: string;
  description: string;
  icon?: string;
}

const availableSections: SectionTemplate[] = [
  {
    id: "payments",
    name: "Payments",
    description: "View recent payment transactions",
  },
  {
    id: "grossVolume",
    name: "Gross Volume",
    description: "Total revenue before fees and charges",
  },
  {
    id: "netVolume",
    name: "Net Volume",
    description: "Total revenue after fees and charges",
  },
  {
    id: "failedPayments",
    name: "Failed Payments",
    description: "View failed payment transactions",
  },
  {
    id: "newCustomers",
    name: "New Customers",
    description: "Track new customer acquisitions",
  },
  {
    id: "topCustomers",
    name: "Top Customers by Spend",
    description: "View customers with highest spending",
  },
];

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sectionId: SectionType) => void;
  existingSections: SectionType[];
}

const AddSectionModal = ({
  isOpen,
  onClose,
  onAdd,
  existingSections,
}: AddSectionModalProps) => {
  if (!isOpen) return null;

  const availableToAdd = availableSections.filter(
    (section) => !existingSections.includes(section.id)
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <h2 className="text-xl font-bold text-[#353a44]">Add Section</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {availableToAdd.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">All sections have been added</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableToAdd.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onAdd(section.id);
                    onClose();
                  }}
                  className="text-left p-4 border border-[#e5e7eb] rounded-lg hover:border-[#533afd] hover:bg-[#f5f6f8] transition-all cursor-pointer group"
                >
                  <h3 className="text-sm font-semibold text-[#353a44] mb-1 group-hover:text-[#533afd]">
                    {section.name}
                  </h3>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e5e7eb]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#353a44] border border-[#e5e7eb] rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;

