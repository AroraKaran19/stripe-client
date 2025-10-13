import Footer from "./components/shared/Footer/Footer";
import Navbar from "./components/shared/Navbar/Navbar";
import Sidebar from "./components/shared/Sidebar/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
