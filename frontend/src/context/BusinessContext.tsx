import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { matchPath, useLocation, useSearchParams } from "react-router-dom";
import { homepageService } from "../services/homepage.service";
import { DEFAULT_BUSINESS_NAME } from "../config/defaults";

interface BusinessContextType {
  businessName: string;
  isLoading: boolean;
  refreshBusinessName: () => void;
}

// Top-level routes that would otherwise match /:username
const RESERVED_PATHS = ["transactions", "admin"];

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

const useActiveUsername = (): string | null => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  if (pathname.startsWith("/admin")) {
    return searchParams.get("user");
  }
  const username = matchPath("/:username", pathname)?.params.username;
  return username && !RESERVED_PATHS.includes(username) ? username : null;
};

const cacheKey = (username: string | null) => `businessName:${username ?? ""}`;

const readCachedName = (username: string | null): string | null => {
  try {
    return localStorage.getItem(cacheKey(username));
  } catch {
    return null;
  }
};

const writeCachedName = (username: string | null, name: string) => {
  try {
    localStorage.setItem(cacheKey(username), name);
  } catch {
    // Storage blocked; the name still shows, just without the instant first paint
  }
};

export const BusinessProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const username = useActiveUsername();
  const [fetched, setFetched] = useState<{
    username: string | null;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    homepageService
      .getBusinessName(username)
      .then((name) => {
        if (cancelled) return;
        writeCachedName(username, name);
        setFetched({ username, name });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching business name:", error);
        setFetched({
          username,
          name: readCachedName(username) ?? DEFAULT_BUSINESS_NAME,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [username, refreshKey]);

  const refreshBusinessName = useCallback(
    () => setRefreshKey((key) => key + 1),
    []
  );

  const resolvedName =
    fetched?.username === username ? fetched.name : readCachedName(username);

  return (
    <BusinessContext.Provider
      value={{
        businessName: resolvedName ?? DEFAULT_BUSINESS_NAME,
        isLoading: resolvedName === null,
        refreshBusinessName,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
