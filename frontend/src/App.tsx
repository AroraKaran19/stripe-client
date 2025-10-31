import { SearchProvider } from "./context/SearchContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppRouter from "./Routes/AppRouter";

const App = () => {
  return (
    <SidebarProvider>
      <SearchProvider>
        <AppRouter />
      </SearchProvider>
    </SidebarProvider>
  );
};

export default App;
