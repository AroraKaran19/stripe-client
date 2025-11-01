import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "./components/Header";
import { cn } from "../../utils";
import PaymentPage from "./components/PaymentPage";
import { Construction } from "lucide-react";
import { transactionService } from "../../services/transaction.service";

export interface FilterContainer {
  label: string;
  value: number;
}

const TransactionPage = () => {
  const location = useLocation();
  const tabs = [
    "Payments",
    "Payouts",
    "Collected fees",
    "Transfers",
    "No-cost Orders",
    "All activity",
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [filterContainer, setFilterContainer] = useState<FilterContainer[]>([
    { label: "All", value: 0 },
    { label: "Succeeded", value: 0 },
    { label: "Refunded", value: 0 },
    { label: "Disputed", value: 0 },
    { label: "Failed", value: 0 },
    { label: "Uncaptured", value: 0 },
  ]);
  const [activeFilter, setActiveFilter] = useState<FilterContainer>(
    filterContainer[0]
  );

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          allRes,
          succeededRes,
          refundedRes,
          disputedRes,
          failedRes,
          uncapturedRes,
        ] = await Promise.all([
          transactionService.getAll(1, 1),
          transactionService.getAll(1, 1, { status: "succeeded" }),
          transactionService.getAll(1, 1, { status: "refunded" }),
          transactionService.getAll(1, 1, { status: "disputed" }),
          transactionService.getAll(1, 1, { status: "failed" }),
          transactionService.getAll(1, 1, { status: "uncaptured" }),
        ]);

        // Safely access the total count from each response
        setFilterContainer([
          { label: "All", value: allRes?.data?.total ?? 0 },
          { label: "Succeeded", value: succeededRes?.data?.total ?? 0 },
          { label: "Refunded", value: refundedRes?.data?.total ?? 0 },
          { label: "Disputed", value: disputedRes?.data?.total ?? 0 },
          { label: "Failed", value: failedRes?.data?.total ?? 0 },
          { label: "Uncaptured", value: uncapturedRes?.data?.total ?? 0 },
        ]);
      } catch (error) {
        console.error("Error fetching transaction counts:", error);
        // Keep default values (0s) on error to prevent UI issues
      }
    };

    fetchCounts();
  }, []);

  const resetFilter = () => {
    setActiveFilter(filterContainer[0]);
  };

  return (
    <>
      <Helmet>
        <title>Transactions | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="View and manage all your transactions with Visualize & Build ltd. Filter by status, date range, and track payment history for better financial management."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Transactions | Visualize & Build ltd. - Stripe" />
        <meta
          property="og:description"
          content="View and manage all your transactions with Visualize & Build ltd. Filter by status, date range, and track payment history for better financial management."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Transactions | Visualize & Build ltd. - Stripe" />
        <meta
          name="twitter:description"
          content="View and manage all your transactions with Visualize & Build ltd. Filter by status, date range, and track payment history for better financial management."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="transactions, payments, stripe, financial management, payment history, transaction tracking, payment filters"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="py-4 w-full flex flex-col">
        <Header />
      <div className="tab-container mt-1 w-full flex flex-col">
        <div className="tabs flex gap-6 border-b border-gray-300 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn("text-sm min-w-max py-2 font-semibold cursor-pointer", {
                "text-[#533afd] border-b-2 border-[#533afd]": activeTab === tab,
                "text-gray-500": activeTab !== tab,
              })}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "Payments" ? (
        <PaymentPage
          filterContainer={filterContainer}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          resetFilter={resetFilter}
        />
      ) : (
        <div className="not-found-container mt-8 w-full flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4">
              <Construction className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-500 text-sm">
              This feature is currently under development
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default TransactionPage;
