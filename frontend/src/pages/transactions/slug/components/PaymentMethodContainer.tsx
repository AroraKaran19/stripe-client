import { CheckCircle, XCircle } from "lucide-react";
import type { Transaction } from "../../../../types";

const PaymentMethodContainer = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="payment-method-container w-full flex flex-col gap-1 mt-10">
      <h6 className="text-xl font-bold border-b border-gray-200 pb-3">
        Payment Method
      </h6>
      <div className="w-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col gap-1">
          <table>
            <tbody>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  ID
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  {transaction.payment_id}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Number
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  •••• {transaction.number}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Fingerprint
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  {transaction.fingerprint}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Expires
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left">
                  {transaction.expires}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Type
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left">
                  {transaction.type}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Issuer
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left">
                  {transaction.issuer ?? "Stripe Payments UK Limited"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-1">
          <table>
            <tbody>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Owner
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  {transaction.owner}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Owner Email
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  {transaction.owner_email}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Address
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left py-1">
                  {transaction.address}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  Origin
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left">
                  {transaction.origin}
                </td>
              </tr>
              <tr>
                <td className="text-sm text-gray-700 font-bold w-1/3 text-left py-1">
                  CVC Check
                </td>
                <td className="text-xs text-gray-700 font-normal w-2/3 text-left">
                  {transaction.cvc_check ? (
                    <span className="flex items-center gap-1">
                      <span>Passed</span>
                      <span className="text-[#217005]">
                        <CheckCircle className="stroke-2 size-3" />
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>Failed</span>
                      <span className="text-red-500">
                        <XCircle className="stroke-2 size-3" />
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodContainer;
