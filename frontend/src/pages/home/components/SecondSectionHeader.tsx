import { ChevronDownIcon, Plus, PlusCircleIcon, Settings } from "lucide-react";

const SecondSectionHeader = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mt-12">Your overview</h1>
      <div className="mt-4 w-full flex gap-4 items-center border-b border-[#e5e7eb] pb-4 overflow-x-auto min-w-0">
        <button className="flex items-center gap-1 p-1 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-[#e5e7eb] shrink-0">
          <span className="text-xs font-semibold border-r border-[#e5e7eb] pr-1">
            Date Range
          </span>
          <span className="text-xs font-semibold text-[#533afd]">
            Last 12 months
          </span>
          <ChevronDownIcon className="size-3 stroke-3 transition-transform duration-200" />
        </button>
        <button className="flex items-center gap-1 p-1 px-1.5 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-[#e5e7eb] shrink-0">
          <span className="text-xs font-semibold text-[#533afd]">Monthly</span>
          <ChevronDownIcon className="size-3 stroke-3 transition-transform duration-200" />
        </button>
        <button className="flex items-center gap-1 p-1 px-1.5 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f5f6f8] rounded-full border border-dashed border-[#e5e7eb] shrink-0">
          <PlusCircleIcon className="size-3 stroke-3 text-[rgb(53,58,68,0.5)]" />
          <span className="text-xs font-semibold">Compare</span>
          <ChevronDownIcon className="size-3 stroke-3 transition-transform duration-200" />
        </button>
        <div className="more-btns ml-auto flex gap-4 items-center">
          <button className="flex items-center gap-2 p-1 px-2 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:border-gray-400 rounded-md border border-[#e5e7eb]">
            <Plus className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Add</span>
          </button>
          <button className="flex items-center gap-2 p-1 px-2 text-[#353a44] cursor-pointer transition-all duration-200 ease-in-out hover:border-gray-400 rounded-md border border-[#e5e7eb]">
            <Settings className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Edit</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SecondSectionHeader;
