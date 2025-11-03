import type { AnalyticsData } from "../../../services/analytics.service";

interface HeroSectionProps {
  data?: AnalyticsData | null;
  loading?: boolean;
}

const HeroSection = ({ data, loading }: HeroSectionProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-w-[313px] max-w-[420px] w-full flex flex-col">
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-w-[313px] max-w-[420px] w-full flex flex-col">
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[313px] max-w-[420px] w-full flex flex-col">
      <div className="cad-balance-wrapper flex flex-col border-b pl-5 pb-5 border-[#e5e7eb]">
        <div className="flex items-center justify-between text-sm font-normal">
          <span className="text-[#353a44] font-semibold">Gross Volume</span>
          <span className="text-[#6c57fd] cursor-pointer select-none">
            View
          </span>
        </div>
        <span className="text-xl font-normal text-[#353a44]">
          US${formatAmount(data.grossVolume.current)}
        </span>
        <span className="text-xs font-normal text-gray-600 mb-5">
          Total revenue before fees
        </span>
      </div>
      <div className="payouts-wrapper flex flex-col pl-5 pt-5">
        <div className="flex items-center justify-between text-sm font-normal">
          <span className="text-[#353a44] font-semibold">Net Volume</span>
          <span className="text-[#6c57fd] cursor-pointer select-none">
            View
          </span>
        </div>
        <span className="text-xl font-normal text-[#353a44]">
          US${formatAmount(data.netVolume.current)}
        </span>
        <span className="text-xs font-normal text-gray-600 mb-7">
          Total revenue after fees
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
