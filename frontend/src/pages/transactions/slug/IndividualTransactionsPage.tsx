import SlugHeader from "./components/SlugHeader";
import { createDemoTransaction } from "../../../utils";
import RecentActivityContainer from "./components/RecentActivityContainer";
import CheckoutSummaryContainer from "./components/CheckoutSummaryContainer";
import PaymentBreakdownContainer from "./components/PaymentBreakdownContainer";
import PaymentMethodContainer from "./components/PaymentMethodContainer";

const IndividualTransactionsPage = () => {
  const transaction = createDemoTransaction();

  return (
    <div className="py-4 w-full flex flex-col">
      <SlugHeader
        status={transaction.status}
        amount={transaction.amount}
        chargedTo={transaction.owner}
      />

      <div className="w-full flex gap-4">
        <div className="main-column w-full flex flex-col gap-4">
          <RecentActivityContainer transaction={transaction} />
          <CheckoutSummaryContainer transaction={transaction} />
          <PaymentBreakdownContainer transaction={transaction} />
          <PaymentMethodContainer transaction={transaction} />
        </div>
        <div className="side-column max-w-[256px] w-full shrink-0"></div>
      </div>
    </div>
  );
};

export default IndividualTransactionsPage;
