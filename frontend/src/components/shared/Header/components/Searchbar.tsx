import { Loader2 } from "lucide-react";
import { SearchIcon } from "../../../../assets";
import { useSearch } from "../../../../context/SearchContext";

const Searchbar = () => {
  const { search, setSearch, isLoading } = useSearch();

  return (
    <div className="w-full max-w-141 h-9 flex items-center gap-2 bg-[#f5f6f8] rounded-md px-3">
      {isLoading ? (
        <Loader2 className="size-3 stroke-3 text-[#676f7e] animate-spin duration-300" />
      ) : (
        <SearchIcon className="size-3 text-[#676f7e]" />
      )}
      <input
        type="text"
        placeholder="Search"
        className="w-full h-full outline-none text-sm placeholder:text-[#676f7e] focus:outline-none text-[#676f7e]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default Searchbar;
