const AppIcon = ({ className }: { className?: string }) => {
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
        d="M12.25 0a.75.75 0 0 1 .75.75V3h2.25a.75.75 0 0 1 0 1.5H13V7a.75.75 0 0 1-1.5 0V4.5H9A.75.75 0 0 1 9 3h2.5V.75a.75.75 0 0 1 .75-.75ZM5 2H2a.5.5 0 0 0-.5.5v3A.5.5 0 0 0 2 6h3a.5.5 0 0 0 .5-.5v-3A.5.5 0 0 0 5 2ZM2 .5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H2Zm3 10H2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5ZM2 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H2Zm8.5 1.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Zm-2 .5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default AppIcon;
