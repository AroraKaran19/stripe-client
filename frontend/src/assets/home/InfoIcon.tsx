const InfoIcon = ({ className }: { className?: string }) => {
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
        d="M8.75 1.75h-5.5a1.5 1.5 0 0 0-1.5 1.5v5.5a1.5 1.5 0 0 0 1.5 1.5h5.5a1.5 1.5 0 0 0 1.5-1.5v-5.5a1.5 1.5 0 0 0-1.5-1.5ZM3.25.25a3 3 0 0 0-3 3v5.5a3 3 0 0 0 3 3h5.5a3 3 0 0 0 3-3v-5.5a3 3 0 0 0-3-3h-5.5Z"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.482 6.5a.7.7 0 0 1 .7-.7h1.09a.7.7 0 0 1 .7.7v2a.7.7 0 1 1-1.4 0V7.2h-.39a.7.7 0 0 1-.7-.7Z"
      ></path>
      <path d="M5 4a1.001 1.001 0 0 1 2 0 1.001 1.001 0 0 1-2 0Z"></path>
    </svg>
  );
};

export default InfoIcon;
