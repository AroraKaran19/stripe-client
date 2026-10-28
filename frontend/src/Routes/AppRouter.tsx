import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../layout";
import { Homepage } from "../pages";
import TransactionPage from "../pages/transactions/TransactionPage";
import IndividualTransactionsPage from "../pages/transactions/slug/IndividualTransactionsPage";
import AdminTransactionManagementPage from "../pages/admin/TransactionPage";
import AdminIndexPage from "../pages/admin/AdminIndexPage";
import HomeManagementPage from "../pages/admin/HomeManagementPage";
import EditTopSectionPage from "../pages/admin/EditTopSectionPage";
import EditPaymentsCardPage from "../pages/admin/EditPaymentsCardPage";
import EditGrossVolumeCardPage from "../pages/admin/EditGrossVolumeCardPage";
import EditNetVolumeCardPage from "../pages/admin/EditNetVolumeCardPage";
import EditFailedPaymentsCardPage from "../pages/admin/EditFailedPaymentsCardPage";
import EditNewCustomersCardPage from "../pages/admin/EditNewCustomersCardPage";
import EditTopCustomersCardPage from "../pages/admin/EditTopCustomersCardPage";
import NotFoundPage from "../pages/404/NotFoundPage";
import { BusinessProvider } from "../context/BusinessContext";

const AppRouter = () => {
  return (
    <Router>
      <BusinessProvider>
        <Layout>
          <Routes>
            {/* Username-based homepage routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/:username" element={<Homepage />} />

            {/* Other routes */}
            <Route path="/transactions" element={<TransactionPage />} />
            <Route
              path="/transactions/:id"
              element={<IndividualTransactionsPage />}
            />
            <Route path="/admin" element={<AdminIndexPage />} />
            <Route
              path="/admin/transactions"
              element={<AdminTransactionManagementPage />}
            />
            <Route path="/admin/home" element={<HomeManagementPage />} />
            <Route path="/admin/home/top-section" element={<EditTopSectionPage />} />
            <Route path="/admin/home/payments" element={<EditPaymentsCardPage />} />
            <Route path="/admin/home/gross-volume" element={<EditGrossVolumeCardPage />} />
            <Route path="/admin/home/net-volume" element={<EditNetVolumeCardPage />} />
            <Route path="/admin/home/failed-payments" element={<EditFailedPaymentsCardPage />} />
            <Route path="/admin/home/new-customers" element={<EditNewCustomersCardPage />} />
            <Route path="/admin/home/top-customers" element={<EditTopCustomersCardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BusinessProvider>
    </Router>
  );
};

export default AppRouter;
