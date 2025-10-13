const HomeIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 16a2.5 2.5 0 0 1-2.5-2.5V5.548a2 2 0 0 1 .862-1.644L6.486.356A2 2 0 0 1 7.625 0h.75a2 2 0 0 1 1.139.356l5.124 3.548a2 2 0 0 1 .862 1.644V13.5A2.5 2.5 0 0 1 13 16H3Zm2-1.5H3a1 1 0 0 1-1-1V5.548a.5.5 0 0 1 .215-.411L7.34 1.589a.5.5 0 0 1 .285-.089h.75a.5.5 0 0 1 .285.089l5.125 3.548a.5.5 0 0 1 .215.41V13.5a1 1 0 0 1-1 1h-2V8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6.5Zm1.5 0h3v-6h-3v6Z"
      ></path>
    </svg>
  );
};

export default HomeIcon;
