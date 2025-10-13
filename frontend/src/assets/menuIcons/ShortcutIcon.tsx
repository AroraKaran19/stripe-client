const ShortcutIcon = ({ className }: { className?: string }) => {
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
      <path d="M8.75 4.75a.75.75 0 0 0-1.5 0V9c0 .3.179.571.455.69l1.75.75a.75.75 0 0 0 .59-1.38L8.75 8.506V4.75Z"></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 8a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7c3.876 0 7 3.134 7 7Zm-1.5 0a5.5 5.5 0 1 1-11 0A5.5 5.5 0 0 1 8 2.5c3.046 0 5.5 2.46 5.5 5.5Z"
      ></path>
    </svg>
  );
};

export default ShortcutIcon;
