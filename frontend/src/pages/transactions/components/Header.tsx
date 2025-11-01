import { ChartColumnIncreasing, Plus } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full flex">
      <h6 className="text-3xl font-bold text-gray-700">
        <span>Transactions</span>
      </h6>
      <div className="action-btns ml-auto flex gap-2 items-center">
        <button className="flex items-center gap-1 bg-[#533afd] text-white rounded-md px-2 py-1 cursor-pointer">
          <Plus className="size-3 stroke-3" />
          <span className="text-sm font-semibold">Create payment</span>
        </button>
        <button className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
          <ChartColumnIncreasing className="size-3 stroke-3" />
          <span className="text-sm font-semibold">Analyse</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
