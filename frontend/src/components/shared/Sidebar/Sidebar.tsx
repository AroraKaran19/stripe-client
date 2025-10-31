import { Link, useLocation } from "react-router-dom";
import {
  BalanceIcon,
  BillingIcon,
  ConnectIcon,
  CustomerIcon,
  HomeIcon,
  MoreIcon,
  PaymentIcon,
  ProductIcon,
  ReportingIcon,
  ShortcutIcon,
  TransactionIcon,
  DeveloperIcon,
} from "../../../assets";
import type { MenuLink } from "../../../types";
import AccountManager from "./components/AccountManager";
import SidebarLink from "./components/SidebarLink";
import { useState } from "react";
import { cn } from "../../../utils";
import { useSidebar } from "../../../context/SidebarContext";

const Sidebar = () => {
  const location = useLocation().pathname;
  const { isCollapsed, isHovering } = useSidebar();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const user = {
    name: "Visualize & Build ltd.",
    email: "visualizeandbuild@gmail.com",
  };

  const menuLinks: MenuLink[] = [
    {
      name: "Home",
      icon: <HomeIcon />,
      href: "/",
    },
    {
      name: "Balances",
      icon: <BalanceIcon />,
      href: "/balances",
    },
    {
      name: "Transactions",
      icon: <TransactionIcon />,
      href: "/transactions",
    },
    {
      name: "Customers",
      icon: <CustomerIcon />,
      href: "/customers",
    },
    {
      name: "Product catalog",
      icon: <ProductIcon />,
      href: "/products",
    },
  ];

  const shortcutLinks: MenuLink[] = [
    {
      name: "Tax",
      icon: <ShortcutIcon />,
      href: "/tax",
    },
    {
      name: "Payment Links",
      icon: <ShortcutIcon />,
      href: "/payment-links",
    },
    {
      name: "Subscriptions",
      icon: <ShortcutIcon />,
      href: "/subscriptions",
    },
    {
      name: "Quotes",
      icon: <ShortcutIcon />,
      href: "/quotes",
    },
  ];

  const productLinks: MenuLink[] = [
    {
      name: "Connect",
      icon: <ConnectIcon />,
      subMenu: [
        {
          name: "Overview",
          href: "/connect/overview",
        },
        {
          name: "Connected accounts",
          href: "/connect/connected-accounts",
        },
        {
          name: "Tax forms",
          href: "/connect/tax-forms",
        },
        {
          name: "Capital",
          href: "/connect/capital",
        },
        {
          name: "Support cases",
          href: "/connect/support-cases",
        },
      ],
    },
    {
      name: "Payments",
      icon: <PaymentIcon />,
      subMenu: [
        {
          name: "Analytics",
          href: "/payments/analytics",
        },
        {
          name: "Disputes",
          href: "/payments/disputes",
        },
        {
          name: "Radar",
          href: "/payments/radar",
        },
        {
          name: "Payment Links",
          href: "/payments/payment-links",
        },
        {
          name: "Terminal",
          href: "/payments/terminal",
        },
      ],
    },
    {
      name: "Billing",
      icon: <BillingIcon />,
      subMenu: [
        {
          name: "Overview",
          href: "/billing/overview",
        },
        {
          name: "Subscriptions",
          href: "/billing/subscriptions",
        },
        {
          name: "Invoices",
          href: "/billing/invoices",
        },
        {
          name: "Usage-based",
          href: "/billing/usage-based",
        },
        {
          name: "Revenue recovery",
          href: "/billing/revenue-recovery",
        },
      ],
    },
    {
      name: "Reporting",
      icon: <ReportingIcon />,
      subMenu: [
        {
          name: "Reports",
          href: "/reporting/reports",
        },
        {
          name: "Custom metrics",
          href: "/reporting/custom-metrics",
        },
        {
          name: "Sigma",
          href: "/reporting/sigma",
        },
        {
          name: "Revenue Recognition",
          href: "/reporting/revenue-recognition",
        },
        {
          name: "Data management",
          href: "/reporting/data-management",
        },
      ],
    },
    {
      name: "More",
      icon: <MoreIcon />,
      subMenu: [
        {
          name: "Tax",
          href: "/more/tax",
        },
        {
          name: "Identify",
          href: "/more/identify",
        },
        {
          name: "Atlas",
          href: "/more/atlas",
        },
        {
          name: "Financial Connections",
          href: "/more/financial-connections",
        },
        {
          name: "Climate",
          href: "/more/climate",
        },
        {
          name: "Workflows",
          href: "/more/workflows",
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location === href || location.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col sticky top-0 left-0 h-dvh bg-white text-[#353a44] shadow-[inset_-1px_0_0_0_#e5e7eb] shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-500 ease-in-out",
        {
          "w-59": isHovering,
          "w-60": !isHovering,
          "w-16": isCollapsed,
        }
      )}
    >
      <div className="account-wrapper mx-5 h-15 flex items-center relative shrink-0">
        <AccountManager user={user} />
      </div>
      <nav className="sidebar-menu p-5 pb-0 w-full h-full flex flex-col gap-7">
        <ul className="sidebar-main-list relative">
          {menuLinks.map((link: MenuLink) => (
            <SidebarLink
              key={link.name}
              link={link}
              isActive={isActive}
              openSubmenu={openSubmenu}
              setOpenSubmenu={setOpenSubmenu}
            />
          ))}
        </ul>
        <ul className="sidebar-shortcut-list relative">
          {!isCollapsed && (
            <div className="h-6.5 flex items-center">
              <span className="text-xs font-medium text-[#596171]">
                Shortcuts
              </span>
            </div>
          )}
          {!isCollapsed
            ? shortcutLinks.map((link) => (
                <SidebarLink
                  key={link.name}
                  link={link}
                  isActive={isActive}
                  openSubmenu={openSubmenu}
                  setOpenSubmenu={setOpenSubmenu}
                />
              ))
            : shortcutLinks
                .slice(0, 1)
                .map((link) => (
                  <SidebarLink
                    key={link.name}
                    link={link}
                    isActive={isActive}
                    openSubmenu={openSubmenu}
                    setOpenSubmenu={setOpenSubmenu}
                  />
                ))}
        </ul>
        <ul className="sidebar-product-list relative">
          {!isCollapsed && (
            <div className="h-6.5 flex items-center">
              <span className="text-xs font-medium text-[#596171] whitespace-nowrap">
                Product catalog
              </span>
            </div>
          )}
          {productLinks.map((link) => (
            <SidebarLink
              key={link.name}
              link={link}
              isActive={isActive}
              openSubmenu={openSubmenu}
              setOpenSubmenu={setOpenSubmenu}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto w-full py-4 px-5">
        <Link to="/developers" className="w-full flex items-center gap-2 h-7.5">
          <span className="p-1">
            <DeveloperIcon
              className={cn("size-4", {
                "text-[#596171]": !isActive("/developers"),
                "text-[#6b61ff]": isActive("/developers"),
              })}
            />
          </span>
          <span
            className={cn(
              "text-sm",
              {
                "text-[#596171]": !isActive("/developers"),
                "text-[#6b61ff] font-semibold": isActive("/developers"),
              },
              {
                hidden: isCollapsed,
              }
            )}
          >
            Developers
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
