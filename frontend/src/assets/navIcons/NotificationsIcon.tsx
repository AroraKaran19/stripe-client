const NotificationsIcon = ({ className }: { className?: string }) => {
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
        d="M5.005 13H2.79a1.792 1.792 0 0 1-1.628-2.532l.477-1.051a11.583 11.583 0 0 0 1.01-4.018l.027-.41A5.34 5.34 0 0 1 8 0a5.34 5.34 0 0 1 5.324 4.989l.027.41a11.6 11.6 0 0 0 1.01 4.018l.477 1.05A1.787 1.787 0 0 1 13.21 13h-2.215c0 1.657-1.34 3-2.995 3a2.997 2.997 0 0 1-2.995-3Zm-2.48-1.912.478-1.05a13.086 13.086 0 0 0 1.14-4.539l.027-.41A3.84 3.84 0 0 1 8 1.5a3.84 3.84 0 0 1 3.83 3.589l.027.41c.104 1.57.49 3.107 1.14 4.538l.477 1.051a.291.291 0 0 1-.264.412H2.79a.291.291 0 0 1-.264-.412ZM6.504 13a1.499 1.499 0 1 0 2.995 0H6.503Z"
      ></path>
    </svg>
  );
};

export default NotificationsIcon;
