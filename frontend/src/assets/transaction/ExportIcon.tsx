const ExportIcon = ({ className }: { className?: string }) => {
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
      <path d="M10.718 7.73a.743.743 0 1 0 1.053 1.052l3.51-3.506a.743.743 0 0 0 0-1.052L11.772.718a.745.745 0 0 0-1.053 1.052L12.951 4H8a2.75 2.75 0 0 0-2.75 2.75v4.5a.75.75 0 0 0 1.5 0v-4.5c0-.69.56-1.25 1.25-1.25h4.951l-2.233 2.23Z"></path>
      <path d="M1.25 11a.75.75 0 0 1 .75.75V14h12v-2.25a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75H1.25a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75Z"></path>
    </svg>
  );
};

export default ExportIcon;
