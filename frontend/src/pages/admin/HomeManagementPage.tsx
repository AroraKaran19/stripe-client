import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  homepageService,
  type HomepageData,
} from "../../services/homepage.service";
import { ChevronDown, Star, Trash2 } from "lucide-react";

const HomeManagementPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [homepages, setHomepages] = useState<HomepageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [defaultUsername, setDefaultUsername] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch all homepages and set default user
  useEffect(() => {
    const fetchHomepages = async () => {
      try {
        setLoading(true);
        const response = await homepageService.getAllHomepages();
        if (response.status === "success" && response.data) {
          const allHomepages = Array.isArray(response.data)
            ? (response.data as unknown as HomepageData[])
            : [response.data as unknown as HomepageData];
          setHomepages(allHomepages);

          // Find default homepage
          const defaultHomepage = allHomepages.find((h) => h.default);
          const defaultUser = defaultHomepage?.username || null;
          setDefaultUsername(defaultUser);

          // Get selected username from URL or use default
          const urlUsername = searchParams.get("user");
          const initialUsername = urlUsername || defaultUser;
          setSelectedUsername(initialUsername);

          // Update URL if no user param and we have a default
          if (!urlUsername && defaultUser) {
            setSearchParams({ user: defaultUser });
          }
        }
      } catch (error) {
        console.error("Error fetching homepages:", error);
        setMessage({ type: "error", text: "Failed to load homepages" });
      } finally {
        setLoading(false);
      }
    };

    fetchHomepages();
  }, [searchParams, setSearchParams]);

  const handleUserChange = (username: string) => {
    setSelectedUsername(username);
    setSearchParams({ user: username });
  };

  const handleSetDefault = async (username: string) => {
    if (username === defaultUsername) return; // Already default

    try {
      setIsSettingDefault(true);
      setMessage(null);
      await homepageService.setDefaultHomepage(username);

      // Update local state
      setDefaultUsername(username);
      setHomepages((prev) =>
        prev.map((h) => ({ ...h, default: h.username === username }))
      );

      setMessage({
        type: "success",
        text: "Default homepage updated successfully",
      });
    } catch (error) {
      console.error("Error setting default:", error);
      setMessage({ type: "error", text: "Failed to set default homepage" });
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async (username: string) => {
    // Check both state and data to prevent deleting default
    const homepage = homepages.find((h) => h.username === username);
    if (username === defaultUsername || homepage?.default) {
      setMessage({ type: "error", text: "Cannot delete the default homepage" });
      return;
    }

    if (
      !confirm(`Are you sure you want to delete homepage for "${username}"?`)
    ) {
      return;
    }

    try {
      await homepageService.deleteHomepage(username);
      setHomepages((prev) => prev.filter((h) => h.username !== username));

      // If deleted user was selected, switch to default
      if (selectedUsername === username && defaultUsername) {
        handleUserChange(defaultUsername);
      }

      setMessage({ type: "success", text: "Homepage deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting homepage:", error);
      const errorMsg = error.message?.includes("default")
        ? "Cannot delete the default homepage"
        : "Failed to delete homepage";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const sections = [
    {
      title: "Top Section (Hourly Chart)",
      description: "Manage the top section with hourly metrics chart",
      path: "/admin/home/top-section",
      color:
        "bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200",
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
    <div className="min-h-[calc(100vh-60px)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm cursor-pointer text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Admin
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Home Page Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage data for each section of the home page independently
          </p>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* User Selection Dropdown */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User to Manage
            </label>
            {loading ? (
              <div className="text-gray-500">Loading users...</div>
            ) : (
              <div className="flex gap-3 items-start">
                <div className="relative flex-1 max-w-md">
                  <select
                    value={selectedUsername || ""}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className="w-full px-4 py-2 cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
                  >
                    {homepages.map((homepage, index) => (
                      <option
                        className="cursor-pointer"
                        key={index}
                        value={homepage.username}
                      >
                        {homepage.username}{" "}
                        {homepage.default ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {selectedUsername && selectedUsername !== defaultUsername && (
                  <button
                    onClick={() => handleSetDefault(selectedUsername)}
                    disabled={isSettingDefault}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    {isSettingDefault ? "Setting..." : "Set as Default"}
                  </button>
                )}

                {selectedUsername &&
                  selectedUsername !== defaultUsername &&
                  !homepages.find((h) => h.username === selectedUsername)
                    ?.default && (
                    <button
                      onClick={() => handleDelete(selectedUsername)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}

                {selectedUsername &&
                  (selectedUsername === defaultUsername ||
                    homepages.find((h) => h.username === selectedUsername)
                      ?.default) && (
                    <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-600" />
                      Default (cannot delete)
                    </div>
                  )}
              </div>
            )}
          </div>

          {selectedUsername && (
            <p className="text-sm text-blue-600 mt-3 font-medium">
              Managing data for:{" "}
              <span className="font-bold">{selectedUsername}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                if (selectedUsername) {
                  navigate(`${section.path}?user=${selectedUsername}`);
                } else {
                  navigate(section.path);
                }
              }}
              disabled={!selectedUsername}
              className={`${section.color} cursor-pointer p-6 rounded-lg border border-gray-200 text-left transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
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
