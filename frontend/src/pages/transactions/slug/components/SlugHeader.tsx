import {
  Check,
  ChevronRightIcon,
  ClipboardCopy,
  Edit2,
  Ellipsis,
  Undo2,
} from "lucide-react";
import type { Transaction } from "../../../../types";
import VisaIcon from "../../../../assets/transaction/VisaIcon";
import { cn } from "../../../../utils";

const SlugHeader = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="w-full flex flex-col">
      <div className="top flex items-center gap-2 flex-col lg:flex-row">
        <div className="flex flex-col gap-1 w-full lg:w-auto">
          <h6 className="text-sm font-semibold text-[#533afd] flex items-center gap-1 cursor-pointer">
            <span>Transactions</span>
            <ChevronRightIcon className="size-3 stroke-3 text-gray-500" />
          </h6>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-gray-500">
              <span className="font-bold text-black">
                ${transaction.amount}
              </span>{" "}
              USD
            </span>
            {transaction.status === "succeeded" && (
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
            <span className="text-[#533afd]">
              {transaction.owner.toUpperCase()}
            </span>
          </span>
        </div>
        <div className="action-btns ml-auto flex gap-2 items-stretch w-full lg:w-auto">
          <button className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
            <Undo2 className="size-3 stroke-3" />
            <span className="text-sm font-semibold">Refund</span>
          </button>
          <button className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
            <Ellipsis className="size-3 stroke-3" />
          </button>
        </div>
      </div>

      <div className="flex lg:hidden w-full flex-col gap-4 mt-5">
        <h6 className="text-xl font-bold">Details</h6>
        <div className="payment-id w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Payment ID</h6>
          <span className="w-max text-sm text-gray-500 flex items-center gap-1 p-1 hover:bg-gray-100 rounded-sm cursor-pointer max-w-[256px]">
            {transaction.payment_id}
            <ClipboardCopy className="size-3 stroke-2 text-gray-500" />
          </span>
        </div>
        <div className="payment-method w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Payment Method</h6>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <VisaIcon className="size-5" /> ••••{" "}
            {transaction.payment_method.cart_last_four}
          </span>
        </div>
        <div className="description w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Description</h6>
          <span className="text-sm flex items-center flex-wrap gap-1">
            {transaction.description}
            <span className="cursor-pointer text-[#533afd] flex items-center gap-1 flex-wrap">
              <span>Edit</span>
              <span>
                <Edit2 className="size-3 stroke-2" />
              </span>
            </span>
          </span>
        </div>
        <div className="statement-descriptor w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Statement descriptor</h6>
          <span className="text-sm flex items-center flex-wrap gap-1">
            {transaction.statement_descriptor}
          </span>
        </div>
        <div className="last-updated w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Last updated</h6>
          <span className="text-sm flex items-center flex-wrap gap-1">
            {transaction.updatedAt?.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="risk-evaluation w-full flex flex-col gap-2">
          <h6 className="text-sm font-bold">Risk evaluation</h6>
          <span className="text-sm flex items-center gap-1">
            <span
              className={cn(
                "p-0.5 rounded-full size-5 font-bold flex items-center justify-center text-xs",
                transaction.risk_evaluation.level === "low"
                  ? "bg-green-500 text-white"
                  : transaction.risk_evaluation.level === "normal"
                  ? "bg-yellow-500 text-red-500"
                  : "bg-red-500 text-white"
              )}
            >
              {transaction.risk_evaluation.score}
            </span>
            <span className="capitalize">
              {transaction.risk_evaluation.level}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SlugHeader;
