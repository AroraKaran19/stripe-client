const ProductIcon = ({ className }: { className?: string }) => {
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
        d="M7.973 0a2 2 0 0 0-.894.211L1.607 2.947A2 2 0 0 0 .5 4.737v6.568a2 2 0 0 0 1.052 1.761l4.782 2.575A3 3 0 0 0 7.757 16h.488a3 3 0 0 0 1.422-.359l4.781-2.575a2 2 0 0 0 1.052-1.76v-6.57a2 2 0 0 0-1.105-1.789L8.922.211A2 2 0 0 0 8.03 0h-.056ZM14 11.306V5.62L8.75 8.448v5.964c.07-.025.14-.056.206-.091l4.781-2.575a.5.5 0 0 0 .263-.44ZM8.252 1.553l5.257 2.629-2.06 1.109-5.38-2.898 1.68-.84a.5.5 0 0 1 .224-.053h.056a.5.5 0 0 1 .223.053ZM4.756 3.05 2.491 4.182 8 7.148l2.184-1.176L4.756 3.05ZM7.25 8.448 2 5.622v5.683a.5.5 0 0 0 .263.44l4.782 2.576c.066.035.134.066.204.09V8.449Z"
      ></path>
    </svg>
  );
};

export default ProductIcon;
