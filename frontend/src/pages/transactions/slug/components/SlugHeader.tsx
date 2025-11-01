import { Check, ChevronRightIcon, Ellipsis, Undo2 } from "lucide-react";
import type { Transaction } from "../../../../types";

const SlugHeader = ({
  status,
  amount,
  chargedTo,
}: {
  status: Transaction["status"];
  amount: Transaction["amount"];
  chargedTo: Transaction["owner"];
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="top flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <h6 className="text-sm font-semibold text-[#533afd] flex items-center gap-1 cursor-pointer">
            <span>Transactions</span>
            <ChevronRightIcon className="size-3 stroke-3 text-gray-500" />
          </h6>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-gray-500">
              <span className="font-bold text-black">${amount}</span> USD
            </span>
            {status === "succeeded" && (
              <div className="bg-[#eafcdd] border border-[#a8f170] px-1.5 py-px flex items-center gap-1 justify-center rounded-sm">
                <span className="text-xs text-[#217005]">Succeeded</span>
                <span>
                  <Check className="size-3 stroke-3 text-[#217005]" />
                </span>
              </div>
            )}
          </div>
          <span className="text-base text-gray-500">
            Charged to{" "}
            <span className="text-[#533afd]">{chargedTo.toUpperCase()}</span>
          </span>
        </div>
        <div className="action-btns ml-auto flex gap-2 items-stretch">
          <button className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
            <Undo2 className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Refund</span>
          </button>
          <button className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
            <Ellipsis className="size-3 stroke-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlugHeader;
