import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutDashboard, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "../../utils";

const AdminIndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cards = [
    {
      title: "HomePage Management",
      description:
        "Configure and customize dashboard sections, analytics cards, and homepage content",
      icon: LayoutDashboard,
      gradient: "from-blue-500 via-blue-600 to-cyan-500",
      hoverGradient: "from-blue-600 via-blue-700 to-cyan-600",
      bgGradient: "from-blue-50 via-cyan-50 to-blue-50",
      onClick: () => navigate("/admin/home"),
    },
    {
      title: "Transactions Management",
      description:
        "View, create, edit, and manage all payment transactions and records",
      icon: CreditCard,
      gradient: "from-purple-500 via-purple-600 to-pink-500",
      hoverGradient: "from-purple-600 via-purple-700 to-pink-600",
      bgGradient: "from-purple-50 via-pink-50 to-purple-50",
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

      <div className="min-h-[calc(100vh-60px)] w-full bg-gradient-to-br flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <button
                  key={index}
                  onClick={card.onClick}
                  className={cn(
                    "group relative text-left rounded-2xl border-2 border-gray-200 cursor-pointer",
                    "bg-white hover:border-transparent",
                    "transition-all duration-500 overflow-hidden",
                    "hover:-translate-y-2 hover:shadow-2xl",
                    "focus:outline-none focus:ring-4 focus:ring-opacity-50"
                  )}
                >
                  {/* Background Gradient on Hover */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100",
                      card.bgGradient,
                      "transition-opacity duration-500"
                    )}
                  />

                  {/* Content Container */}
                  <div className="relative p-8">
                    {/* Icon Container */}
                    <div
                      className={cn(
                        "mb-6 w-16 h-16 rounded-xl bg-gradient-to-br shadow-lg",
                        card.gradient,
                        "flex items-center justify-center",
                        "group-hover:scale-110 group-hover:shadow-xl",
                        "transition-all duration-500"
                      )}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 text-base">
                      {card.description}
                    </p>

                    {/* Action Indicator */}
                    <div className="flex items-center text-[#533afd] font-semibold text-base group-hover:gap-3 transition-all">
                      <span>Manage</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br",
                      card.gradient,
                      "opacity-0 group-hover:opacity-10",
                      "rounded-bl-full transition-opacity duration-500"
                    )}
                  />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminIndexPage;
