import { useState } from "react";
import { cn } from "../../../../utils";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "../../../../context/SidebarContext";

const AccountManager = ({
  name,
  isLoading = false,
}: {
  name: string;
  isLoading?: boolean;
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "account-container w-full min-w-0 flex items-center gap-2 select-none cursor-pointer",
        "before:absolute before:w-[calc(100%+12px)] before:h-[calc(100%+12px)] before:max-h-7.5",
        "before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
        "before:rounded-md before:pointer-events-none before:p-1.5",
        "hover:before:bg-[#f5f6f8] before:z-[-1] before:transition-all before:duration-300 before:ease-in-out"
      )}
      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
      title={isLoading ? undefined : name}
      aria-busy={isLoading}
    >
      <div className="account-icon size-6 rounded-sm bg-[#f5f6f8] flex items-center justify-center shrink-0">
        {!isLoading && (
          <span className="text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {isLoading ? (
        <span
          className={cn("h-3.5 w-28 rounded bg-[#ebeef1] animate-pulse", {
            hidden: isCollapsed,
          })}
        />
      ) : (
        <span
          className={cn("text-sm font-semibold truncate min-w-0", {
            hidden: isCollapsed,
          })}
        >
          {name}
        </span>
      )}
      <span
        className={cn("p-1 ml-auto shrink-0", {
          hidden: isCollapsed,
        })}
      >
        <ChevronDown
          className={cn(
            "size-3 stroke-3 transition-transform duration-300 ease-in-out",
            {
              "rotate-180": isAccountDropdownOpen,
            }
          )}
        />
      </span>
    </div>
  );
};

export default AccountManager;
