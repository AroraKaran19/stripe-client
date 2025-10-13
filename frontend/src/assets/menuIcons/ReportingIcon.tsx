const ReportingIcon = ({ className }: { className?: string }) => {
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
      <path d="M14 1.875a.875.875 0 0 0-1.75 0v8.75a.875.875 0 0 0 1.75 0v-8.75Z"></path>
      <path d="M2.6 1.875a.8.8 0 1 0-1.6 0V13.2A1.8 1.8 0 0 0 2.8 15h11.827a.8.8 0 0 0 0-1.6H2.8a.2.2 0 0 1-.2-.2V1.875Z"></path>
      <path d="M9.125 3.5c.483 0 .875.392.875.875v6.25a.875.875 0 0 1-1.75 0v-6.25c0-.483.392-.875.875-.875ZM6 6.875a.875.875 0 1 0-1.75 0v3.75a.875.875 0 0 0 1.75 0v-3.75Z"></path>
    </svg>
  );
};

export default ReportingIcon;
