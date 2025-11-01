import type { Transaction } from "../../../../types";

const CheckoutSummaryContainer = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="checkout-summary-container w-full flex flex-col gap-2 mt-10">
      <h6 className="text-xl font-bold border-b border-gray-200 pb-3">
        Checkout Summary
      </h6>
      <div className="w-full flex justify-between items-stretch border-b border-gray-200 pb-3">
        <span className="text-sm text-gray-500 w-full lg:max-w-1/5">
          Customer
        </span>
        <div className="w-full lg:max-w-4/5 flex flex-col justify-start gap-1.5">
          <span className="text-sm text-gray-600">{transaction.owner}</span>
          <span className="text-sm text-gray-600">
            {transaction.owner_email}
          </span>
          <span className="text-sm text-gray-600">{transaction.country}</span>
        </div>
      </div>

      <div className="items-container w-full flex flex-col gap-2">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-xs font-semibold text-gray-700 text-left pb-2 px-3 whitespace-nowrap">
                  ITEMS
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center pb-2 px-3"></th>
                <th className="text-xs font-semibold text-gray-700 text-right pb-2 px-3 whitespace-nowrap">
                  QTY
                </th>
                <th className="text-xs font-semibold text-gray-700 text-right pb-2 px-3 whitespace-nowrap">
                  UNIT PRICE
                </th>
                <th className="text-xs font-semibold text-gray-700 text-right pb-2 px-3 whitespace-nowrap">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item) => (
                <tr key={item.name} className="border-b border-gray-200">
                  <td className="text-sm font-semibold text-gray-700 text-left py-2 px-3 whitespace-nowrap">
                    {item.name}{" "}
                  </td>
                  <td className="text-sm text-gray-700 text-center py-2 px-3">
                    {item.name === "Shipping Charge" && (
                      <span className="ml-5 text-sm text-gray-500 whitespace-nowrap">
                        Shipping Charge
                      </span>
                    )}
                    {item.name === "Taxes" && (
                      <span className="ml-5 text-sm text-gray-500 whitespace-nowrap">
                        GST + PST/HST
                      </span>
                    )}
                  </td>
                  <td className="text-sm text-gray-700 text-right py-2 px-3 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="text-sm text-gray-700 text-right py-2 px-3 whitespace-nowrap">
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="text-sm text-gray-700 text-right py-2 px-3 whitespace-nowrap">
                    ${item.total_price.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200">
                <td className="pb-2 px-3 whitespace-nowrap"></td>
                <td className="pb-2 px-3 whitespace-nowrap"></td>
                <td className="pb-2 px-3 whitespace-nowrap"></td>
                <td className="text-sm text-gray-700 text-right pb-2 px-3 whitespace-nowrap">
                  <span className="font-semibold">Total</span>
                </td>
                <td className="text-sm text-gray-700 text-right pb-2 px-3 whitespace-nowrap">
                  <span className="font-semibold">
                    $
                    {transaction.items
                      .reduce((acc, item) => acc + item.total_price, 0)
                      .toFixed(2)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummaryContainer;
