const MoneyIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      height="12"
      width="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.25 4.25v6.5h10v-6.5h-10ZM2.75 4c0-.69.56-1.25 1.25-1.25h10.5c.69 0 1.25.56 1.25 1.25v7c0 .69-.56 1.25-1.25 1.25H4c-.69 0-1.25-.56-1.25-1.25V4Z"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 5.25a.75.75 0 0 1 .75.75v6.5c0 .414.336.75.75.75h10a.75.75 0 0 1 0 1.5h-10A2.25 2.25 0 0 1 .25 12.5V6A.75.75 0 0 1 1 5.25Z"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 7v1A.75.75 0 0 0 10 8V7a.75.75 0 0 0-1.5 0ZM7.25 7v1a2 2 0 1 0 4 0V7a2 2 0 1 0-4 0Z"
      ></path>
    </svg>
  );
};

export default MoneyIcon;
