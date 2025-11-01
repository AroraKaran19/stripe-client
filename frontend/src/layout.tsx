import Header from "./components/shared/Header/Header";
import Sidebar from "./components/shared/Sidebar/Sidebar";
import { cn } from "./utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useSidebar } from "./context/SidebarContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed, setIsCollapsed, isHovering, setIsHovering } =
    useSidebar();

  return (
    <div className="flex w-full min-h-screen relative">
      <Sidebar />
      <div
        className={cn("fixed top-0 h-screen flex items-center z-[9999]", {
          "left-61.5": !isCollapsed,
          "left-17.25": isCollapsed,
        })}
      >
        <button
          className="size-6 bg-transparent flex items-center justify-start cursor-pointer transition-all duration-300 ease-in-out"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            setIsHovering(false);
          }}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            isHovering ? (
              <ChevronRightIcon className="size-4" />
            ) : (
              <div className="w-0.5 h-3.5 bg-[#818da0] rounded-full"></div>
            )
          ) : isHovering ? (
            <ChevronLeftIcon className="size-4" />
          ) : (
            <div className="w-0.5 h-3.5 bg-[#818da0] rounded-full" />
          )}
        </button>
      </div>
      <div className="flex-1 mx-auto max-w-7xl px-4 min-w-0">
        <Header />
        <main className="w-full min-h-[calc(100vh-60px)] min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
