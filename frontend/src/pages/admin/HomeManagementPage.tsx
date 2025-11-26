import { useNavigate } from "react-router-dom";

const HomeManagementPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Top Section (Hourly Chart)",
      description: "Manage the top section with hourly metrics chart",
      path: "/admin/home/top-section",
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200",
      featured: true,
    },
    {
      title: "Payments Card",
      description: "Manage payments data (total, successful, failed, average)",
      path: "/admin/home/payments",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Gross Volume Card",
      description: "Manage gross volume metrics and trends",
      path: "/admin/home/gross-volume",
      color: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Net Volume Card",
      description: "Manage net volume metrics and trends",
      path: "/admin/home/net-volume",
      color: "bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Failed Payments Card",
      description: "Manage failed payments data and statistics",
      path: "/admin/home/failed-payments",
      color: "bg-red-50 hover:bg-red-100",
    },
    {
      title: "New Customers Card",
      description: "Manage new customer metrics and growth",
      path: "/admin/home/new-customers",
      color: "bg-yellow-50 hover:bg-yellow-100",
    },
    {
      title: "Top Customers Card",
      description: "Manage top customers list and rankings",
      path: "/admin/home/top-customers",
      color: "bg-indigo-50 hover:bg-indigo-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Admin
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Home Page Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage data for each section of the home page independently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={`${section.color} p-6 rounded-lg border border-gray-200 text-left transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-gray-600">{section.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeManagementPage;
