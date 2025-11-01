import { Link, useLocation } from "react-router-dom";
import {
  AppIcon,
  CreateIcon,
  HelpIcon,
  NotificationsIcon,
  SettingsIcon,
} from "../../../assets";
import Searchbar from "./components/Searchbar";
import { cn } from "../../../utils";
import { cloneElement } from "react";

interface ActionBtn {
  name: string;
  icon: React.ReactNode;
  href?: string;
}

const Header = () => {
  const location = useLocation().pathname;
  const actionBtns: ActionBtn[] = [
    {
      name: "Apps",
      icon: <AppIcon />,
      href: "/apps",
    },
    {
      name: "Help",
      icon: <HelpIcon />,
      href: "/help",
    },
    {
      name: "Notifications",
      icon: <NotificationsIcon />,
    },
    {
      name: "Settings",
      icon: <SettingsIcon />,
      href: "/settings",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location === href || location.startsWith(href + "/");
  };

  return (
    <header className="w-full h-15 py-3 flex items-center gap-2">
      <Searchbar />
      <div className="action-btns ml-auto flex gap-5 items-center">
        {actionBtns.map((btn) => {
          return (
            <div
              className={cn(
                "size-5 flex items-center justify-center hover:before:!bg-black/10",
                "relative before:absolute before:w-[calc(100%+12px)] before:h-[calc(100%+12px)]",
                "before:max-h-6 before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
                "before:rounded-md before:pointer-events-none before:p-1.5 before:z-[-1] before:transition-all before:duration-300 before:ease-in-out",
                {
                  "hover:before:!bg-[#533afd]/10":
                    btn.href && isActive(btn.href),
                }
              )}
            >
              {btn.href ? (
                <Link
                  to={btn.href}
                  className="flex items-center justify-center"
                >
                  {cloneElement(btn.icon as React.ReactElement<SVGSVGElement>, {
                    className: cn("size-4 shrink-0", {
                      "!text-[#474e5a]": !isActive(btn.href),
                      "!text-[#533afd]": isActive(btn.href),
                    }),
                  })}
                </Link>
              ) : (
                <button
                  className={cn(
                    "size-5 flex items-center justify-center cursor-pointer text-[#474e5a]"
                  )}
                >
                  {btn.icon}
                </button>
              )}
            </div>
          );
        })}
        <button className="p-1 rounded-full cursor-pointer hover:bg-black/10 transition-all duration-300 ease-in-out">
          <div className="p-1 rounded-full bg-[#533afd]">
            <CreateIcon className="size-3 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
