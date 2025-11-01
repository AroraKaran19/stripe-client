import { HelmetProvider } from "react-helmet-async";
import { SearchProvider } from "./context/SearchContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppRouter from "./Routes/AppRouter";

const App = () => {
  return (
    <HelmetProvider>
      <SidebarProvider>
        <SearchProvider>
          <AppRouter />
        </SearchProvider>
      </SidebarProvider>
    </HelmetProvider>
  );
};

export default App;
