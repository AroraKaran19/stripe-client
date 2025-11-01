import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Visualize & Build ltd. - Stripe</title>
        <meta
          name="description"
          content="The page you are looking for could not be found. Return to the dashboard or navigate to another section."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="404 - Page Not Found | Visualize & Build ltd. - Stripe"
        />
        <meta
          property="og:description"
          content="The page you are looking for could not be found. Return to the dashboard or navigate to another section."
        />
        <meta
          property="og:url"
          content={`${window.location.origin}${location.pathname}`}
        />
        <meta property="og:site_name" content="Visualize & Build ltd." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="404 - Page Not Found | Visualize & Build ltd. - Stripe"
        />
        <meta
          name="twitter:description"
          content="The page you are looking for could not be found. Return to the dashboard or navigate to another section."
        />

        {/* Additional meta tags */}
        <meta
          name="keywords"
          content="404, page not found, error page, stripe dashboard"
        />
        <meta name="author" content="Visualize & Build ltd." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl w-full flex flex-col items-center">
          <div className="mb-6">
            <div className="relative">
              <AlertCircle className="h-24 w-24 text-gray-400 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            The URL{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {location.pathname}
            </span>{" "}
            could not be found.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#533afd] text-white rounded-md hover:bg-[#4528e0] transition-colors duration-200 font-medium cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 w-full">
            <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-[#533afd] hover:underline cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/transactions")}
                className="text-sm text-[#533afd] hover:underline cursor-pointer"
              >
                Transactions
              </button>
              <button
                onClick={() => navigate("/admin/transactions")}
                className="text-sm text-[#533afd] hover:underline cursor-pointer"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
