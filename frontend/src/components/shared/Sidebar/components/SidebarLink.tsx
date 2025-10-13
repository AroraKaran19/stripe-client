import React, { cloneElement } from "react";
import { cn } from "../../../../utils";
import { Link } from "react-router-dom";
import type { MenuLink } from "../../../../types";
import { ChevronDownIcon } from "lucide-react";

const SidebarLink = ({
  link,
  isActive,
  openSubmenu,
  setOpenSubmenu,
}: {
  link: MenuLink;
  isActive: (href: string) => boolean;
  openSubmenu: string | null;
  setOpenSubmenu: (submenuName: string | null) => void;
}) => {
  if (link.href) {
    return (
      <li
        className={cn(
          "relative flex items-center gap-2",
          "before:absolute before:w-[calc(100%+12px)] before:h-[calc(100%+12px)]",
          "before:max-h-7.5 before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
          "before:rounded-md before:pointer-events-none before:p-1.5 before:z-[-1] before:transition-all before:duration-300 before:ease-in-out hover:before:bg-black/10"
        )}
      >
        <Link
          to={link.href}
          className="w-full flex items-center gap-2 h-7.5"
          draggable={false}
        >
          <span className="p-1">
            {link.icon ? (
              cloneElement(link.icon as React.ReactElement<SVGSVGElement>, {
                className: cn("size-4 shrink-0", {
                  "!text-[#9097a5]": !isActive(link.href),
                  "!text-[#6b61ff]": isActive(link.href),
                }),
              })
            ) : (
              <div className="size-4 shrink-0" />
            )}
          </span>
          <span
            className={cn("text-sm", {
              "!text-black": !isActive(link.href),
              "!text-[#6b61ff] font-semibold": isActive(link.href),
            })}
          >
            {link.name}
          </span>
        </Link>
      </li>
    );
  } else {
    const isSubmenuOpen = openSubmenu === link.name;

    const handleSubmenuToggle = () => {
      if (isSubmenuOpen) {
        setOpenSubmenu(null);
      } else {
        setOpenSubmenu(link.name);
      }
    };

    return (
      <div className="relative group">
        <li
          className={cn(
            "relative flex items-center gap-2",
            "before:absolute before:w-[calc(100%+12px)] before:h-[calc(100%+12px)]",
            "before:max-h-7.5 before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
            "before:rounded-md before:pointer-events-none before:p-1.5 before:z-[-1] before:transition-all before:duration-300 before:ease-in-out hover:before:bg-black/10"
          )}
        >
          <div
            className="w-full flex items-center gap-2 h-7.5 cursor-pointer"
            onClick={handleSubmenuToggle}
            draggable={false}
          >
            <span className="p-1">
              {link.icon ? (
                cloneElement(link.icon as React.ReactElement<SVGSVGElement>, {
                  className: cn("size-4 shrink-0 text-[#9097a5]"),
                })
              ) : (
                <div className="size-4 shrink-0" />
              )}
            </span>
            <span className="text-sm select-none">{link.name}</span>
            <span className="ml-auto p-1">
              <ChevronDownIcon
                className={cn(
                  "size-3 stroke-3 transition-transform duration-200",
                  {
                    "rotate-180": isSubmenuOpen,
                  }
                )}
              />
            </span>
          </div>
        </li>
        <div
          className={cn(
            "transition-all duration-300 ease-in-out relative overflow-hidden",
            isSubmenuOpen ? "max-h-96 translate-y-0" : "max-h-0 -translate-y-full"
          )}
        >
          {link.subMenu &&
            link.subMenu.map((subLink) => (
              <SidebarLink
                key={subLink.name}
                link={subLink}
                isActive={isActive}
                openSubmenu={openSubmenu}
                setOpenSubmenu={setOpenSubmenu}
              />
            ))}
        </div>
      </div>
    );
  }
};

export default SidebarLink;
