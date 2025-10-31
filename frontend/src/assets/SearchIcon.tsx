const SearchIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.883 9.085a5 5 0 1 1 1.202-1.202l2.666 2.666a.847.847 0 0 1 0 1.202.847.847 0 0 1-1.202 0L7.883 9.085ZM8.3 5a3.3 3.3 0 1 1-6.6 0 3.3 3.3 0 0 1 6.6 0Z"
      ></path>
    </svg>
  );
};

export default SearchIcon;
