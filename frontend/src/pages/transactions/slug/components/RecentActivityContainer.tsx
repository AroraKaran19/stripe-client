import { CheckCircle, Plus } from "lucide-react";
import type { Transaction } from "../../../../types";
import MoneyIcon from "../../../../assets/transaction/MoneyIcon";

const RecentActivityContainer = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="recent-activity w-full mt-5 flex flex-col gap-2 border-b border-gray-200 pb-3">
      <div className="header w-full flex items-center gap-2 border-b border-gray-200 pb-3">
        <h6 className="text-xl font-bold">Recent Activity</h6>
        <button className="ml-auto flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-gray-700 rounded-md px-2 py-1 cursor-pointer">
          <Plus className="size-3 stroke-3" />
          <span className="text-sm font-semibold">Add Note</span>
        </button>
      </div>
      <div className="recent-activity-list mt-2 flex flex-col">
        {transaction.activity_history
          .slice()
          .reverse()
          .map((activity, index) => (
            <div className="activity-item px-4 mt-2w-full flex items-stretch gap-2">
              <div className="icon flex flex-col items-center">
                <span className="text-sm font-semibold">
                  {activity.activity === "Started" ? (
                    <MoneyIcon className="size-3 stroke-3 text-gray-400" />
                  ) : (
                    <CheckCircle className="size-3 stroke-3 text-[#378e0e]" />
                  )}
                </span>
                {index !== transaction.activity_history.length - 1 && (
                  <div className="line bg-gray-200 h-full w-px" />
                )}
              </div>
              <div className="flex flex-col justify-start mb-5 gap-2">
                <span className="text-sm leading-none">
                  {activity.activity === "Started"
                    ? "Payment started"
                    : "Payment authorized"}
                </span>
                <span className="text-xs text-gray-500">
                  {activity.timestamp.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) +
                    ", " +
                    activity.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecentActivityContainer;
