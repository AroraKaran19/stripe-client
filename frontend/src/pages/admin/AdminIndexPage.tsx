import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Shield,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../utils";

const AdminIndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cards = [
    {
      title: "Home Page Management",
      description:
        "Configure and customize dashboard sections, analytics cards, and homepage content",
      icon: LayoutDashboard,
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => navigate("/admin/home"),
    },
    {
      title: "Transaction Management",
      description:
        "View, create, edit, and manage all payment transactions and records",
      icon: CreditCard,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => navigate("/admin/transactions"),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="Administrative dashboard for managing transactions, homepage content, and system settings."
        />
        <meta
          property="og:url"
          content={`${window.location.origin}${location.pathname}`}
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#533afd]/10 rounded-lg">
                <Shield className="h-6 w-6 text-[#533afd]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your platform settings and content
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Stats Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Quick Access
            </h2>
            <p className="text-sm text-gray-500">
              Select a section below to manage different aspects of your
              platform
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={card.onClick}
                  className={cn(
                    "group relative text-left rounded-xl border border-gray-200",
                    "bg-white hover:border-[#533afd]/30 hover:shadow-xl",
                    "transition-all duration-300 overflow-hidden",
                    "hover:-translate-y-1"
                  )}
                >
                  {/* Gradient Accent */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      card.gradient
                    )}
                  />

                  <div className="p-6">
                    {/* Icon */}
                    <div
                      className={cn(
                        "mb-4 w-12 h-12 rounded-lg bg-gradient-to-br",
                        card.gradient,
                        "flex items-center justify-center",
                        "group-hover:scale-110 transition-transform duration-300"
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#533afd] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {card.description}
                    </p>

                    {/* Action Indicator */}
                    <div className="flex items-center text-[#533afd] text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Open</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#533afd]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* Additional Info Section */}
          <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  System Information
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Use the admin dashboard to manage your platform's content and
                  transactions. All changes are saved automatically and
                  reflected immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminIndexPage;
