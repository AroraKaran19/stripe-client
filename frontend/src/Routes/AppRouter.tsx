import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../layout";
import { Homepage } from "../pages";

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;
