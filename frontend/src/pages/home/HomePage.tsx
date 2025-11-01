"use client";
import { BinocularsIcon, ChevronDownIcon } from "lucide-react";
import { cloneElement, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { cn } from "../../utils";
import LineChart from "../../components/ui/charts/homepage/LineChart";
import HeroSection from "./components/HeroSection";
import SecondSectionHeader from "./components/SecondSectionHeader";
import InfoIcon from "../../assets/home/InfoIcon";

interface Graph {
  title: string;
  icon?: React.SVGProps<SVGSVGElement>;
}

const Homepage = () => {
  const location = useLocation();
  const [grossVolumeActive, setGrossVolumeActive] = useState(false);
  const [dateActive, setDateActive] = useState(false);
  const graphs: Graph[] = [
    {
      title: "payments",
    },
    {
      title: "gross_volume",
      icon: <InfoIcon />,
    },
    {
      title: "net_volume",
      icon: <InfoIcon />,
    },
    {
      title: "failed_payments",
    },
    {
      title: "new_customers",
    },
    {
      title: "top_customer_by_spend",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Home | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          property="og:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home | Visualize & Build ltd. - Stripe" />
        <meta
          name="twitter:description"
          content="Dashboard for Visualize & Build ltd. - Stripe. View payments, gross volume, net volume, failed payments, new customers, and top customer analytics."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="stripe dashboard, payment analytics, financial dashboard, transaction analytics, payment management"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold py-2 border-b border-[#e5e7eb]">
        Today
      </h1>
      <div className="mt-6 w-full flex flex-col lg:flex-row gap-4 justify-between items-stretch">
        <div className="flex flex-col w-full">
          <div className="tabs flex gap-15">
            <div className="gross-volume-tab-switch flex flex-col shrink-0">
              <button
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                onClick={() => setGrossVolumeActive(!grossVolumeActive)}
              >
                <span className="text-sm font-normal">Gross Volume</span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                      "rotate-180": grossVolumeActive,
                    }
                  )}
                />
              </button>
              <span className="text-xl font-normal text-[#353a44]">
                $683.83
              </span>
              <span className="text-xs text-gray-400">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="date-tab-switch flex flex-col shrink-0">
              <button
                className="flex items-center gap-1 mb-1 rounded-md cursor-pointer text-gray-600"
                onClick={() => setDateActive(!dateActive)}
              >
                <span className="text-sm font-normal">
                  {(() => {
                    const d = new Date();
                    const day = d.toLocaleString("en-US", { day: "numeric" });
                    const month = d.toLocaleString("en-US", { month: "short" });
                    const year = d.getFullYear();
                    return `${day} ${month}, ${year}`;
                  })()}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-3 stroke-3 transition-transform duration-200",
                    {
                      "rotate-180": dateActive,
                    }
                  )}
                />
              </button>
              <span className="text-base font-normal text-gray-400">
                $4,645.89
              </span>
            </div>
          </div>
          <LineChart />
        </div>
        <HeroSection />
      </div>
      <SecondSectionHeader />
      <div className="w-full h-full max-h-max grid grid-cols-1 lg:grid-cols-3 gap-2 bg-[#f5f6f8] rounded-md p-2 mt-2 mb-16">
        {graphs.map((graph: Graph, index: number) => (
          <div
            key={index}
            className="w-full h-full flex flex-col bg-white rounded-md p-4"
          >
            <h4 className="graph-title flex items-center gap-1 text-sm text-gray-700 font-semibold">
              {graph.title.charAt(0).toUpperCase() +
                graph.title.replace(/_/g, " ").slice(1)}
              {graph.icon && (
                <span className="text-xs text-gray-500">
                  {cloneElement(
                    graph.icon as React.ReactElement<SVGSVGElement>,
                    {
                      className: "size-3 stroke-3",
                    }
                  )}
                </span>
              )}
              {graph.title === "gross_volume" && (
                <button className="ml-auto flex items-center gap-1 bg-white cursor-pointer border border-gray-300 rounded-md p-1 px-2">
                  <BinocularsIcon className="size-3" />
                  <span className="text-sm text-gray-700 font-semibold">
                    Explore
                  </span>
                </button>
              )}
            </h4>
            <div className="graph-content w-full h-full min-h-[248px] lg:min-h-[288px] max-h-[288px] max-w-[384px]"></div>
            {["gross_volume", "net_volume", "new_customers"].includes(
              graph.title
            ) && (
              <div className="extra-info flex items-center justify-between text-sm">
                <span className="text-gray-500">Updated 2:30 PM</span>
                <span className="cursor-pointer text-[#533afd]">View more</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Homepage;
