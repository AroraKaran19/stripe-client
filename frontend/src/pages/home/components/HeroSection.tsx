const HeroSection = () => {
  return (
    <div className="min-w-[313px] max-w-[420px] w-full flex flex-col">
      <div className="cad-balance-wrapper flex flex-col border-b pl-5 pb-5 border-[#e5e7eb]">
        <div className="flex items-center justify-between text-sm font-normal">
          <span className="text-[#353a44] font-semibold">CAD balance</span>
          <span className="text-[#6c57fd] cursor-pointer select-none">
            View
          </span>
        </div>
        <span className="text-xl font-normal text-[#353a44]">$1,437.06</span>
        <span className="text-xs font-normal text-gray-600 mb-5">
          Estimated future payouts
        </span>
      </div>
      <div className="payouts-wrapper flex flex-col pl-5 pt-5">
        <div className="flex items-center justify-between text-sm font-normal">
          <span className="text-[#353a44] font-semibold">Payouts</span>
          <span className="text-[#6c57fd] cursor-pointer select-none">
            View
          </span>
        </div>
        <span className="text-xl font-normal text-[#353a44]">$312.82</span>
        <span className="text-xs font-normal text-gray-600 mb-7">
          Expected Nov 5
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
