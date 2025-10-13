const TransactionIcon = ({ className }: { className?: string }) => {
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
      <path d="M9.714 6.693a.75.75 0 1 0 1.106 1.014l2.933-3.2a.75.75 0 0 0 0-1.013L10.82.294a.75.75 0 1 0-1.106 1.013l1.781 1.943H4.6A3.75 3.75 0 0 0 .85 7v.067a.75.75 0 1 0 1.5 0V7A2.25 2.25 0 0 1 4.6 4.75h6.895l-1.78 1.943ZM6.286 9.307A.75.75 0 0 0 5.18 8.293l-2.932 3.2a.75.75 0 0 0 0 1.014l2.932 3.2a.75.75 0 1 0 1.106-1.014l-1.78-1.942H11.4A3.75 3.75 0 0 0 15.15 9v-.067a.75.75 0 0 0-1.5 0V9a2.25 2.25 0 0 1-2.25 2.25H4.505l1.78-1.944Z"></path>
    </svg>
  );
};

export default TransactionIcon;
