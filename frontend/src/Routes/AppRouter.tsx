import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../layout";
import { Homepage } from "../pages";
import TransactionPage from "../pages/transactions/TransactionPage";
import IndividualTransactionsPage from "../pages/transactions/slug/IndividualTransactionsPage";
import AdminTransactionManagementPage from "../pages/admin/TransactionPage";

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/transactions" element={<TransactionPage />} />
          <Route
            path="/transactions/:id"
            element={<IndividualTransactionsPage />}
          />
          <Route
            path="/admin/transactions"
            element={<AdminTransactionManagementPage />}
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;
