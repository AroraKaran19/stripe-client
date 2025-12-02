import { BinocularsIcon } from "lucide-react";
import { cloneElement } from "react";
import InfoIcon from "../../../assets/home/InfoIcon";
import AnalyticsLineChart from "../../../components/ui/charts/AnalyticsLineChart";
import type { AnalyticsData } from "../../../services/analytics.service";
import { cn } from "../../../utils";

interface GrossVolumeCardProps {
  data: AnalyticsData["grossVolume"];
  updatedAt: string;
}

const GrossVolumeCard = ({ data }: GrossVolumeCardProps) => {
  const isPositive = data.changePercent >= 0;
  const currency = "US$";

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-md p-3 overflow-hidden">
      <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold mb-2">
        <span>Gross volume</span>
        <span className="text-xs text-gray-500">
          {cloneElement(<InfoIcon />, {
            className: "size-3 stroke-3",
          })}
        </span>
        <button className="ml-auto flex items-center gap-1 bg-white cursor-pointer border border-gray-300 rounded-md p-1 px-2 hover:bg-gray-50 transition-colors">
          <BinocularsIcon className="size-3" />
          <span className="text-sm text-gray-700 font-semibold">Explore</span>
        </button>
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
          key={`gross-${data.current}-${data.timeSeries.current.length}`}
          currentData={data.timeSeries.current}
          previousData={data.timeSeries.previous}
          currency={currency}
        />
      </div>

      <div className="extra-info flex items-center justify-between text-xs flex-shrink-0 pt-1">
        <span className="cursor-pointer text-[#533afd] hover:underline">
          View more
        </span>
      </div>
    </div>
  );
};

export default GrossVolumeCard;

