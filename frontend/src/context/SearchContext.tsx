import { createContext, useContext, useEffect, useState } from "react";

interface SearchContextType {
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (search === "") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(() => {
      console.log("search", search);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <SearchContext.Provider value={{ search, setSearch, isLoading }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
