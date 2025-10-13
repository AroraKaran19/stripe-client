const ConnectIcon = ({ className }: { className?: string }) => {
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
        d="M0 6c0-.31.163-.598.429-.757L7.07 1.257a1.805 1.805 0 0 1 1.858 0l6.642 3.986a.883.883 0 0 1 0 1.514l-6.64 3.986a1.805 1.805 0 0 1-1.858 0L.43 6.757A.883.883 0 0 1 0 6Zm7.894 3.37L2.277 6l5.617-3.37a.205.205 0 0 1 .212 0L13.723 6 8.107 9.37a.205.205 0 0 1-.212 0Z"
      ></path>
      <path d="M1.434 9.828a.8.8 0 0 0-.868 1.344l6.128 3.96a2.3 2.3 0 0 0 1.248.368h.116a2.3 2.3 0 0 0 1.248-.368l6.128-3.96a.8.8 0 1 0-.868-1.344l-6.129 3.96a.7.7 0 0 1-.38.112h-.115a.7.7 0 0 1-.38-.112l-6.128-3.96Z"></path>
    </svg>
  );
};

export default ConnectIcon;
