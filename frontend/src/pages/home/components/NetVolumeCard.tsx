import { cloneElement } from "react";
import InfoIcon from "../../../assets/home/InfoIcon";
import AnalyticsLineChart from "../../../components/ui/charts/AnalyticsLineChart";
import type { AnalyticsData } from "../../../services/analytics.service";
import { cn } from "../../../utils";

interface NetVolumeCardProps {
  data: AnalyticsData["netVolume"];
  updatedAt: string;
}

const NetVolumeCard = ({ data, updatedAt }: NetVolumeCardProps) => {
  const isPositive = data.changePercent >= 0;
  const currency = "US$";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-md p-3 overflow-hidden">
      <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold mb-2">
        <span>Net volume</span>
        <span className="text-xs text-gray-500">
          {cloneElement(<InfoIcon />, {
            className: "size-3 stroke-3",
          })}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-2xl font-normal text-[#353a44] break-words">
            {currency}
            {data.current.toFixed(2)}
          </span>
          <span
            className={cn("text-sm font-semibold", {
              "text-red-600": !isPositive,
              "text-green-600": isPositive,
            })}
          >
            {isPositive ? "+" : ""}
            {data.changePercent.toFixed(2)}%
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {currency}
          {data.previous.toFixed(2)} previous period
        </div>
      </div>

      <div className="graph-content w-full flex-shrink-0 mb-1" style={{ height: "180px" }}>
        <AnalyticsLineChart
          key={`net-${data.current}-${data.timeSeries.current.length}`}
          currentData={data.timeSeries.current}
          previousData={data.timeSeries.previous}
          currency={currency}
        />
      </div>

      <div className="extra-info flex items-center justify-between text-xs flex-shrink-0 pt-1">
        <span className="text-gray-500">Updated {formatTime(updatedAt)}</span>
        <span className="cursor-pointer text-[#533afd] hover:underline">
          View more
        </span>
      </div>
    </div>
  );
};

export default NetVolumeCard;

