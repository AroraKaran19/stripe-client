import { useState } from "react";
import type { Transaction } from "../../../../types";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "../../../../utils";

const PaymentBreakdownContainer = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const [showFees, setShowFees] = useState(false);

  return (
    <div className="payment-breakdown-container w-full flex flex-col gap-1 mt-10">
      <h6 className="text-xl font-bold">Payment Breakdown</h6>
      <span className="text-sm text-gray-500 pb-3">
        Charge was received in USD, but the funds will be transferred to you in
        CAD. <span className="text-[#533afd]">Learn more</span>
      </span>
      <div className="w-full flex flex-col gap-1">
        <table>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-sm w-1/2 text-gray-600 font-normal text-left pb-2">
                <span>Payment amount ($1.00 USD = $1.40082 CAD)</span>
              </th>
              <th className="text-sm text-gray-700 font-normal w-1/2 text-right pb-2">
                <div className="flex items-center gap-1 justify-end">
                  <span>
                    $
                    {transaction.items
                      .reduce((acc, item) => acc + item.total_price, 0)
                      .toFixed(2)}{" "}
                    USD
                  </span>
                  <ArrowRight className="size-3 stroke-2 text-gray-500" />
                  <span>
                    $
                    {(
                      transaction.items.reduce(
                        (acc, item) => acc + item.total_price,
                        0
                      ) * 1.40082
                    ).toFixed(2)}{" "}
                    CAD
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td
                className="text-sm text-gray-700 font-normal w-1/2 text-left py-2"
                onClick={() => setShowFees(!showFees)}
              >
                <button className="flex w-full items-center gap-1 cursor-pointer hover:text-gray-700">
                  <ChevronDown
                    className={cn("size-4 transition-transform duration-300", {
                      "text-gray-500 rotate-270": !showFees,
                      "text-gray-700 rotate-360": showFees,
                    })}
                  />
                  <span>Fees</span>
                </button>
              </td>
              <td className="text-sm text-gray-700 font-normal w-full text-right py-2">
                - $39.43 CAD
              </td>
            </tr>
            {showFees && (
              <>
                <tr className="border-b border-gray-200">
                  <td className="text-sm w-full flex items-center gap-1 text-gray-700 font-normal text-left py-2">
                    <div className="size-4" />
                    <span>
                      Stripe processing fees{" "}
                      <span className="underline">Learn more</span>
                    </span>
                  </td>
                  <td className="text-sm text-gray-700 font-normal w-1/2 text-right py-2">
                    - $25.70 CAD
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="text-sm w-full flex items-center gap-1 text-gray-700 font-normal text-left py-2">
                    <div className="size-4" />
                    <span>
                      Stripe currency conversion fee{" "}
                      <span className="underline">Learn more</span>
                    </span>
                  </td>
                  <td className="text-sm text-gray-700 font-normal w-1/2 text-right py-2">
                    - $13.73 CAD
                  </td>
                </tr>
              </>
            )}
            <tr className="border-b border-gray-200">
              <td className="text-sm text-gray-700 font-semibold w-1/2 text-left py-2">
                Net amount
              </td>
              <td className="text-sm text-gray-700 font-semibold w-1/2 text-right py-2">
                $
                {(
                  transaction.items.reduce(
                    (acc, item) => acc + item.total_price,
                    0
                  ) *
                    1.40082 -
                  39.43
                ).toFixed(2)}{" "}
                CAD
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentBreakdownContainer;
