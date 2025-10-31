import { useState } from "react";
import { cn } from "../../../../utils";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "../../../../context/SidebarContext";

const AccountManager = ({
  user,
}: {
  user: { name: string; email: string };
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "account-container w-full flex items-center gap-2 select-none cursor-pointer",
        "before:absolute before:w-[calc(100%+12px)] before:h-[calc(100%+12px)] before:max-h-7.5",
        "before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
        "before:rounded-md before:pointer-events-none before:p-1.5",
        "hover:before:bg-[#f5f6f8] before:z-[-1] before:transition-all before:duration-300 before:ease-in-out"
      )}
      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
      title={user.name}
    >
      <div className="account-icon size-6 rounded-sm bg-[#f5f6f8] flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold">{user.name.charAt(0)}</span>
      </div>
      <span
        className={cn("text-sm font-semibold whitespace-nowrap", {
          hidden: isCollapsed,
        })}
      >
        {user.name}
      </span>
      <span
        className={cn("p-1 ml-auto", {
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
