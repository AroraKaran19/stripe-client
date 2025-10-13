import { useState } from "react";
import { cn } from "../../../../utils";
import { ChevronDown } from "lucide-react";

const AccountManager = ({
  user,
}: {
  user: { name: string; email: string };
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

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
      <div className="account-icon size-6 rounded-sm bg-[#f5f6f8] flex items-center justify-center">
        <span className="text-xs font-semibold">{user.name.charAt(0)}</span>
      </div>
      <span className="text-sm font-semibold">{user.name}</span>
      <span className="p-1 ml-auto">
        <ChevronDown
          className={cn(
            "size-2 stroke-4 transition-transform duration-300 ease-in-out",
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
