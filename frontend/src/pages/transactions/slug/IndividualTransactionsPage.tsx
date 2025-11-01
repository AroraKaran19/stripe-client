import SlugHeader from "./components/SlugHeader";
import { cn, createDemoTransaction } from "../../../utils";
import RecentActivityContainer from "./components/RecentActivityContainer";
import CheckoutSummaryContainer from "./components/CheckoutSummaryContainer";
import PaymentBreakdownContainer from "./components/PaymentBreakdownContainer";
import PaymentMethodContainer from "./components/PaymentMethodContainer";
import { ClipboardCopy, Edit2 } from "lucide-react";
import VisaIcon from "../../../assets/transaction/VisaIcon";

const IndividualTransactionsPage = () => {
  const transaction = createDemoTransaction();

  return (
    <div className="py-4 w-full flex flex-col">
      <SlugHeader transaction={transaction} />

      <div className="w-full flex gap-8">
        <div className="main-column w-full flex flex-col gap-4">
          <RecentActivityContainer transaction={transaction} />
          <CheckoutSummaryContainer transaction={transaction} />
          <PaymentBreakdownContainer transaction={transaction} />
          <PaymentMethodContainer transaction={transaction} />
        </div>
        <div className="hidden lg:flex side-column mt-5 max-w-[256px] w-full shrink-0 flex-col gap-4">
          <h6 className="text-xl font-bold">Details</h6>
          <div className="payment-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Payment ID</h6>
            <span className="w-max text-sm text-gray-500 flex items-center gap-1 p-1 hover:bg-gray-100 rounded-sm cursor-pointer max-w-[256px]">
              {transaction.payment_id}
              <ClipboardCopy className="size-3 stroke-2 text-gray-500" />
            </span>
          </div>
          <div className="payment-method w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Payment Method</h6>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <VisaIcon className="size-5" /> ••••{" "}
              {transaction.payment_method.cart_last_four}
            </span>
          </div>
          <div className="description w-full flex flex-col gap-1">
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
          <div className="statement-descriptor w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Statement descriptor</h6>
            <span className="text-sm flex items-center flex-wrap gap-1">
              {transaction.statement_descriptor}
            </span>
          </div>
          <div className="last-updated w-full flex flex-col gap-1">
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
          <div className="risk-evaluation w-full flex flex-col gap-1">
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
          <h6 className="text-xl font-bold mt-5">Customer</h6>
          <div className="customer-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">ID</h6>
            <span className="text-sm text-[#533afd] flex items-center gap-1">
              {transaction.customer_id}
            </span>
          </div>
          <div className="customer-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Name</h6>
            <span className="text-sm text-black flex items-center gap-1">
              {transaction.owner}
            </span>
          </div>
          <div className="customer-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Email</h6>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {transaction.owner_email}
            </span>
          </div>
          <div className="customer-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Phone</h6>
            <span className="text-sm text-black flex items-center gap-1">
              {transaction.customer_phone}
            </span>
          </div>
          <div className="customer-id w-full flex flex-col gap-1">
            <h6 className="text-sm font-bold">Country</h6>
            <span className="text-sm text-black flex items-center gap-1">
              {transaction.country}
            </span>
          </div>
          <div className="flex items-center justify-between mt-5">
            <h6 className="text-xl font-bold">Metadata</h6>
            <div className="p-2 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer">
              <Edit2 className="size-3 stroke-2" />
            </div>
          </div>
          <div className="metadata-container w-full rounded-lg border-2 border-dashed border-gray-300 h-22">
            <span className="text-sm text-gray-600 flex items-center justify-center h-full">
              No metadata
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualTransactionsPage;
