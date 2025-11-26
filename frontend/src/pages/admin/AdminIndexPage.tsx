import { useNavigate } from "react-router-dom";

const AdminIndexPage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Manage Home Page",
      description: "Edit home page card sections data",
      onClick: () => navigate("/admin/home"),
    },
    {
      title: "Manage Transactions",
      description: "View and edit transactions",
      onClick: () => navigate("/admin/transactions"),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={card.onClick}
            className="text-left rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition p-4 bg-white"
          >
            <div className="text-lg font-medium">{card.title}</div>
            <div className="text-sm text-gray-500 mt-1">{card.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminIndexPage;




